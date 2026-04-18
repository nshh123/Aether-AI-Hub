"""
main.py – Aether AI Hub: FastAPI application entry point.

Routes:
  POST /v1/chat/completions   → OpenAI-compatible gateway with interceptor
  GET  /api/metrics/dashboard → Aggregated analytics for the last 7 days
  GET  /health                → Health-check probe
"""

from __future__ import annotations

import os
import time
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import RequestLog
from pricing import calculate_cost

# ---------------------------------------------------------------------------
# Bootstrap
# ---------------------------------------------------------------------------

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_BASE_URL = os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai")

# Create all tables on startup (idempotent)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Aether AI Hub",
    description="API gateway and FinOps analytics layer for cloud LLMs.",
    version="1.0.0",
)

# Allow the Vite dev server (and Vercel preview) to query the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


@app.get("/health", tags=["System"])
async def health():
    return {"status": "ok", "service": "Aether AI Hub"}


# ---------------------------------------------------------------------------
# Gateway: POST /v1/chat/completions
# ---------------------------------------------------------------------------


@app.post("/v1/chat/completions", tags=["Gateway"])
async def chat_completions(request: Request, db: Session = Depends(get_db)):
    """
    Transparent proxy to OpenAI's chat completions endpoint.
    Measures latency, extracts token usage, calculates cost, and persists a log
    entry before forwarding the response back to the caller.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not configured on the server.",
        )

    body: dict[str, Any] = await request.json()
    model_name: str = body.get("model", "gemini-2.0-flash")

    # Forward request headers (strip host to avoid proxy conflicts)
    forward_headers = {
        "Authorization": f"Bearer {GEMINI_API_KEY}",
        "Content-Type": "application/json",
    }

    target_url = f"{GEMINI_BASE_URL}/chat/completions"

    # ── Interceptor: measure wall-clock latency ──────────────────────────────
    start_ts = time.perf_counter()

    async with httpx.AsyncClient(timeout=120.0) as client:
        upstream_response = await client.post(
            target_url, json=body, headers=forward_headers
        )

    elapsed_ms = (time.perf_counter() - start_ts) * 1_000  # seconds → ms

    # ── Parse upstream payload ────────────────────────────────────────────────
    try:
        payload = upstream_response.json()
    except Exception:
        # Non-JSON body — forward as-is
        return JSONResponse(
            status_code=upstream_response.status_code,
            content={"error": upstream_response.text},
        )

    # Gemini error responses are JSON *arrays* ([{"error": {...}}]), not objects.
    # If we received a non-2xx status or a list payload, forward it cleanly
    # without attempting to parse usage — this prevents the AttributeError crash.
    if not upstream_response.is_success or not isinstance(payload, dict):
        content = payload if isinstance(payload, (dict, list)) else {"error": str(payload)}
        return JSONResponse(
            status_code=upstream_response.status_code,
            content=content,
        )

    usage: dict[str, Any] = payload.get("usage", {})
    prompt_tokens: int = usage.get("prompt_tokens", 0)
    completion_tokens: int = usage.get("completion_tokens", 0)
    total_tokens: int = usage.get("total_tokens", prompt_tokens + completion_tokens)

    # ── Persist log entry ─────────────────────────────────────────────────────
    cost = calculate_cost(model_name, prompt_tokens, completion_tokens)
    log_entry = RequestLog(
        timestamp=datetime.now(timezone.utc),
        model_name=model_name,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_tokens=total_tokens,
        total_latency_ms=round(elapsed_ms, 2),
        estimated_cost_usd=cost,
    )
    db.add(log_entry)
    db.commit()

    return JSONResponse(
        status_code=upstream_response.status_code,
        content=payload,
    )


# ---------------------------------------------------------------------------
# Analytics: GET /api/metrics/dashboard
# ---------------------------------------------------------------------------


@app.get("/api/metrics/dashboard", tags=["Analytics"])
def dashboard_metrics(db: Session = Depends(get_db)):
    """
    Returns aggregated metrics for the last 7 days:
      - daily_costs:    [{date, cost}]
      - daily_tokens:   [{date, prompt_tokens, completion_tokens, total_tokens}]
      - daily_latency:  [{date, model, avg_latency_ms}]
      - summary:        {total_requests, total_cost, avg_latency_ms, total_tokens}
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)

    rows = (
        db.query(RequestLog)
        .filter(RequestLog.timestamp >= cutoff)
        .order_by(RequestLog.timestamp.asc())
        .all()
    )

    # ── Build daily buckets ───────────────────────────────────────────────────
    daily_cost: dict[str, float] = defaultdict(float)
    daily_prompt: dict[str, int] = defaultdict(int)
    daily_completion: dict[str, int] = defaultdict(int)
    daily_total: dict[str, int] = defaultdict(int)
    # latency per (date, model)
    latency_bucket: dict[tuple[str, str], list[float]] = defaultdict(list)

    total_requests = 0
    total_cost = 0.0
    total_tokens_all = 0
    latency_all: list[float] = []

    for row in rows:
        day = row.timestamp.strftime("%Y-%m-%d")
        daily_cost[day] += row.estimated_cost_usd
        daily_prompt[day] += row.prompt_tokens
        daily_completion[day] += row.completion_tokens
        daily_total[day] += row.total_tokens
        latency_bucket[(day, row.model_name)].append(row.total_latency_ms)

        total_requests += 1
        total_cost += row.estimated_cost_usd
        total_tokens_all += row.total_tokens
        latency_all.append(row.total_latency_ms)

    # Ensure all 7 days appear even with no data
    all_days = [
        (datetime.now(timezone.utc) - timedelta(days=i)).strftime("%Y-%m-%d")
        for i in range(6, -1, -1)
    ]

    daily_costs = [
        {"date": d, "cost": round(daily_cost.get(d, 0.0), 6)} for d in all_days
    ]
    daily_tokens = [
        {
            "date": d,
            "prompt_tokens": daily_prompt.get(d, 0),
            "completion_tokens": daily_completion.get(d, 0),
            "total_tokens": daily_total.get(d, 0),
        }
        for d in all_days
    ]

    # Flatten latency per (date, model)
    daily_latency = []
    for (day, model), latencies in sorted(latency_bucket.items()):
        daily_latency.append(
            {
                "date": day,
                "model": model,
                "avg_latency_ms": round(sum(latencies) / len(latencies), 2),
            }
        )

    return {
        "daily_costs": daily_costs,
        "daily_tokens": daily_tokens,
        "daily_latency": daily_latency,
        "summary": {
            "total_requests": total_requests,
            "total_cost_usd": round(total_cost, 6),
            "avg_latency_ms": (
                round(sum(latency_all) / len(latency_all), 2) if latency_all else 0.0
            ),
            "total_tokens": total_tokens_all,
        },
    }
