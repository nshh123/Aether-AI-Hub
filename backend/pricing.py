"""
pricing.py – Utility functions for estimating Google Gemini API call costs.

Pricing is set to 0.0 to reflect Gemini's Free Tier usage in Google AI Studio.
Update MODEL_PRICING if moving to a paid tier.
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Pricing table: model_id → (input_cost_per_1k, output_cost_per_1k)  [USD]
# ---------------------------------------------------------------------------
MODEL_PRICING: dict[str, tuple[float, float]] = {
    # Gemini 2.5 family (newest, free via AI Studio)
    "gemini-2.5-flash": (0.0, 0.0),
    "gemini-2.5-pro": (0.0, 0.0),
    # Gemini 2.0 family
    "gemini-2.0-flash": (0.0, 0.0),
    "gemini-2.0-flash-001": (0.0, 0.0),
    "gemini-2.0-flash-lite": (0.0, 0.0),
    "gemini-2.0-flash-lite-001": (0.0, 0.0),
    # Gemini 1.5 family (legacy, may not be available on all keys)
    "gemini-1.5-flash": (0.0, 0.0),
    "gemini-1.5-flash-8b": (0.0, 0.0),
    "gemini-1.5-pro": (0.0, 0.0),
    # Default fallback — free tier regardless of unknown model
    "_default": (0.0, 0.0),
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
