/**
 * Dashboard.jsx
 * Main analytics view — KPI grid, token chart, latency chart, cost chart.
 * All data is sourced from the useMetrics hook (GET /api/metrics/dashboard).
 */

import {
  Activity,
  Clock,
  DollarSign,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import React from "react";
import CostChart from "./CostChart.jsx";
import KpiCard from "./KpiCard.jsx";
import LatencyChart from "./LatencyChart.jsx";
import TokenChart from "./TokenChart.jsx";

/**
 * @param {{ data: object|null, loading: boolean, error: string|null, refetch: () => void }} props
 */
export default function Dashboard({ data, loading, error, refetch }) {
  const summary = data?.summary ?? {};
  const costData = data?.daily_costs ?? [];
  const tokenData = data?.daily_tokens ?? [];
  const latencyData = data?.daily_latency ?? [];

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div style={{ width: 180, height: 28, background: "var(--bg-elevated)", borderRadius: 8 }} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                height: 120,
                background: "var(--bg-elevated)",
                borderRadius: 16,
                animation: `pulse 1.5s ${i * 0.15}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
        <div style={{ height: 280, background: "var(--bg-elevated)", borderRadius: 16 }} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div style={{ height: 280, background: "var(--bg-elevated)", borderRadius: 16 }} />
          <div style={{ height: 280, background: "var(--bg-elevated)", borderRadius: 16 }} />
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <div
          className="glass-card p-8 text-center"
          style={{ maxWidth: 420 }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <Zap className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Backend Unreachable
          </h2>
          <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
            Could not connect to the FastAPI backend. Make sure it's running on port 8000.
          </p>
          <p className="mono text-xs mb-5" style={{
            color: "var(--neon-amber)",
            background: "var(--bg-elevated)",
            padding: "8px 12px",
            borderRadius: 8,
          }}>
            {error}
          </p>
          <button
            id="retry-fetch-btn"
            onClick={refetch}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg, hsl(185,100%,30%), hsl(275,80%,40%))",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // ── Main dashboard ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 p-6 max-w-screen-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between fade-in-up">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Analytics{" "}
            <span className="gradient-text-cyan">Dashboard</span>
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Real-time LLM usage metrics · Last 7 days
          </p>
        </div>
        <button
          id="refresh-dashboard-btn"
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(0,235,255,0.3)";
            e.currentTarget.style.color = "var(--neon-cyan)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-subtle)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Sparkles}
          label="Total Requests (7 days)"
          value={summary.total_requests?.toLocaleString() ?? "0"}
          accentClass="glow-cyan"
          iconColor="text-cyan-400"
          animationDelay="delay-1"
        />
        <KpiCard
          icon={DollarSign}
          label="Total Spend (7 days)"
          value={`$${(summary.total_cost_usd ?? 0).toFixed(4)}`}
          accentClass="glow-amber"
          iconColor="text-amber-400"
          animationDelay="delay-2"
        />
        <KpiCard
          icon={Clock}
          label="Avg Latency"
          value={(summary.avg_latency_ms ?? 0).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
          unit="ms"
          accentClass="glow-purple"
          iconColor="text-purple-400"
          animationDelay="delay-3"
        />
        <KpiCard
          icon={Activity}
          label="Total Tokens (7 days)"
          value={
            (summary.total_tokens ?? 0) >= 1_000_000
              ? `${((summary.total_tokens ?? 0) / 1_000_000).toFixed(2)}M`
              : (summary.total_tokens ?? 0) >= 1_000
              ? `${((summary.total_tokens ?? 0) / 1_000).toFixed(1)}k`
              : (summary.total_tokens ?? 0).toString()
          }
          accentClass="glow-green"
          iconColor="text-emerald-400"
          animationDelay="delay-4"
        />
      </div>

      {/* Token Volume Chart (full width) */}
      <TokenChart data={tokenData} />

      {/* Latency + Cost Charts (side by side on large screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LatencyChart data={latencyData} />
        <CostChart data={costData} />
      </div>
    </div>
  );
}
