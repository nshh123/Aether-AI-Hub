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
    # GitHub Models — Free Tier
    "gpt-4o": (0.0, 0.0),
    "gpt-4o-mini": (0.0, 0.0),
    "Meta-Llama-3-8B-Instruct": (0.0, 0.0),
    "Meta-Llama-3.1-405B-Instruct": (0.0, 0.0),
    "Phi-3-mini-4k-instruct": (0.0, 0.0),
    # Default fallback — free tier for GitHub Models
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
