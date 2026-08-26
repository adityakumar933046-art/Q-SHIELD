from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from app.config.security_config import security_settings


class ThresholdEvaluationResult(BaseModel):
    metric: str
    observed_value: float
    threshold: float
    comparison: str
    passed: bool
    reason: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


def evaluate_threshold(
    metric_name: str,
    observed_value: float,
    threshold: Optional[float] = None,
    comparison: str = "<="
) -> ThresholdEvaluationResult:
    """Evaluate observed metric against configurable threshold."""
    target_thresh = threshold if threshold is not None else security_settings.VERIFICATION_THRESHOLD

    if comparison == "<=":
        passed = (observed_value <= target_thresh)
    elif comparison == ">=":
        passed = (observed_value >= target_thresh)
    elif comparison == "<":
        passed = (observed_value < target_thresh)
    elif comparison == ">":
        passed = (observed_value > target_thresh)
    elif comparison in ("==", "="):
        passed = abs(observed_value - target_thresh) < 1e-6
    else:
        raise ValueError(f"Unsupported comparison operator '{comparison}'.")

    status_str = "PASSED" if passed else "FAILED"
    reason = f"{metric_name} ({observed_value:.6f}) {comparison} threshold ({target_thresh:.6f}): {status_str}"

    return ThresholdEvaluationResult(
        metric=metric_name,
        observed_value=round(observed_value, 6),
        threshold=round(target_thresh, 6),
        comparison=comparison,
        passed=passed,
        reason=reason
    )
