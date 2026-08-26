from typing import List, Tuple, Dict, Any, Optional
from pydantic import BaseModel, Field


class InvalidErrorRateInputError(Exception):
    """Raised when error rate inputs are invalid (negative counts, errors > observations, zero observations)."""
    pass


class ErrorRateResult(BaseModel):
    errors: int
    observations: int
    rate: float
    percentage: float
    metadata: Dict[str, Any] = Field(default_factory=dict)


def calculate_error_rate(errors: int, observations: int, metadata: Optional[Dict[str, Any]] = None) -> ErrorRateResult:
    """Calculate error rate for a single observation group."""
    if observations <= 0:
        raise InvalidErrorRateInputError("Total observations must be a positive integer.")
    if errors < 0:
        raise InvalidErrorRateInputError("Errors count cannot be negative.")
    if errors > observations:
        raise InvalidErrorRateInputError(f"Errors count ({errors}) cannot exceed total observations ({observations}).")

    rate = float(errors / observations)
    return ErrorRateResult(
        errors=errors,
        observations=observations,
        rate=round(rate, 6),
        percentage=round(rate * 100.0, 4),
        metadata=metadata or {}
    )


def calculate_aggregated_error_rate(groups: List[Tuple[int, int]]) -> ErrorRateResult:
    """Calculate aggregate error rate across multiple (errors, observations) groups."""
    if not groups:
        raise InvalidErrorRateInputError("Groups list cannot be empty.")

    total_errors = sum(g[0] for g in groups)
    total_obs = sum(g[1] for g in groups)

    if total_obs <= 0:
        raise InvalidErrorRateInputError("Total aggregated observations must be positive.")
    if total_errors < 0 or total_errors > total_obs:
        raise InvalidErrorRateInputError("Aggregated errors count is invalid.")

    return calculate_error_rate(total_errors, total_obs, metadata={"num_groups": len(groups)})
