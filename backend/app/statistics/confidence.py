import math
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

try:
    from scipy.stats import norm
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False


class ConfidenceInterval(BaseModel):
    estimate: float
    lower_bound: float
    upper_bound: float
    confidence_level: float
    sample_size: int
    method: str = "wilson"
    metadata: Dict[str, Any] = Field(default_factory=dict)


def _get_z_score(confidence_level: float) -> float:
    if not (0.0 < confidence_level < 1.0):
        raise ValueError("Confidence level must be strictly between 0 and 1.")
    
    if HAS_SCIPY:
        return float(norm.ppf(1.0 - (1.0 - confidence_level) / 2.0))
    
    # Common z-score approximations
    if abs(confidence_level - 0.95) < 0.01:
        return 1.95996
    elif abs(confidence_level - 0.99) < 0.01:
        return 2.57583
    elif abs(confidence_level - 0.90) < 0.01:
        return 1.64485
    else:
        # Inverse erfc approximation
        alpha = 1.0 - confidence_level
        return math.sqrt(2.0) * math.erfcinv(alpha) if hasattr(math, 'erfcinv') else 1.96


def calculate_confidence_interval(
    successes: int,
    sample_size: int,
    confidence_level: float = 0.95,
    method: str = "wilson"
) -> ConfidenceInterval:
    """Calculate Wilson score confidence interval for binomial proportion."""
    if sample_size <= 0:
        raise ValueError("Sample size must be a positive integer.")
    if successes < 0 or successes > sample_size:
        raise ValueError("Successes count must be between 0 and sample_size.")

    p_hat = successes / sample_size
    z = _get_z_score(confidence_level)
    z_sq = z ** 2

    if method.lower() == "wilson":
        denom = 1.0 + z_sq / sample_size
        center = (p_hat + z_sq / (2.0 * sample_size)) / denom
        spread = (z / denom) * math.sqrt((p_hat * (1.0 - p_hat) / sample_size) + (z_sq / (4.0 * sample_size ** 2)))
        lower = max(0.0, center - spread)
        upper = min(1.0, center + spread)
    else:
        # Standard Wald interval
        margin = z * math.sqrt(p_hat * (1.0 - p_hat) / sample_size)
        lower = max(0.0, p_hat - margin)
        upper = min(1.0, p_hat + margin)

    return ConfidenceInterval(
        estimate=round(p_hat, 6),
        lower_bound=round(lower, 6),
        upper_bound=round(upper, 6),
        confidence_level=confidence_level,
        sample_size=sample_size,
        method=method
    )
