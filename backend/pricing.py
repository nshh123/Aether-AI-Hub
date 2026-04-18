"""
pricing.py – Utility functions for estimating OpenAI API call costs.

Pricing tiers are sourced from OpenAI's public pricing page (April 2025).
All prices are in USD per 1,000 tokens (input / output).
Update MODEL_PRICING when OpenAI adjusts their rates.
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Pricing table: model_id → (input_cost_per_1k, output_cost_per_1k)  [USD]
# ---------------------------------------------------------------------------
MODEL_PRICING: dict[str, tuple[float, float]] = {
    # GPT-4o family
    "gpt-4o": (0.0025, 0.010),
    "gpt-4o-2024-11-20": (0.0025, 0.010),
    "gpt-4o-mini": (0.00015, 0.0006),
    "gpt-4o-mini-2024-07-18": (0.00015, 0.0006),
    # GPT-4 Turbo
    "gpt-4-turbo": (0.010, 0.030),
    "gpt-4-turbo-2024-04-09": (0.010, 0.030),
    # GPT-4
    "gpt-4": (0.030, 0.060),
    "gpt-4-32k": (0.060, 0.120),
    # GPT-3.5 Turbo
    "gpt-3.5-turbo": (0.0005, 0.0015),
    "gpt-3.5-turbo-0125": (0.0005, 0.0015),
    # o1 reasoning models
    "o1": (0.015, 0.060),
    "o1-mini": (0.003, 0.012),
    "o3-mini": (0.0011, 0.0044),
    # Default fallback (unknown model)
    "_default": (0.002, 0.002),
}


def calculate_cost(
    model_name: str,
    prompt_tokens: int,
    completion_tokens: int,
) -> float:
    """
    Return the estimated cost in USD for a single API call.

    Args:
        model_name:        The exact model string returned by OpenAI (e.g. "gpt-4o").
        prompt_tokens:     Number of input/prompt tokens consumed.
        completion_tokens: Number of output/completion tokens generated.

    Returns:
        Estimated cost in USD as a float (e.g. 0.000125).
    """
    input_rate, output_rate = MODEL_PRICING.get(
        model_name,
        MODEL_PRICING["_default"],
    )

    input_cost = (prompt_tokens / 1_000) * input_rate
    output_cost = (completion_tokens / 1_000) * output_rate

    return round(input_cost + output_cost, 8)
