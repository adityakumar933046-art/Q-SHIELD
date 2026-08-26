from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from app.statistics.confidence import calculate_confidence_interval, ConfidenceInterval


class ForgeryAnalysisResult(BaseModel):
    attempts: int
    false_accepts: int
    false_rejects: int
    false_acceptance_rate: float
    false_rejection_rate: float
    estimated_forgery_probability: float
    confidence: float
    confidence_interval: Optional[ConfidenceInterval] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


def analyze_forgery_risk(
    false_accepts: int,
    total_attempts: int,
    false_rejects: int = 0,
    legitimate_attempts: int = 0,
    confidence_level: float = 0.95
) -> ForgeryAnalysisResult:
    """Analyze empirical forgery risk and calculate false acceptance/rejection rates."""
    if total_attempts <= 0:
        raise ValueError("Total attempts must be positive.")
    if false_accepts < 0 or false_accepts > total_attempts:
        raise ValueError("False accepts count is invalid.")

    far = float(false_accepts / total_attempts)
    frr = float(false_rejects / legitimate_attempts) if legitimate_attempts > 0 else 0.0

    # Calculate Wilson confidence interval for FAR
    ci = calculate_confidence_interval(
        successes=false_accepts,
        sample_size=total_attempts,
        confidence_level=confidence_level
    )

    # For zero-event cases, use upper bound of confidence interval as conservative forgery risk estimate
    estimated_prob = ci.upper_bound if false_accepts == 0 else far

    return ForgeryAnalysisResult(
        attempts=total_attempts,
        false_accepts=false_accepts,
        false_rejects=false_rejects,
        false_acceptance_rate=round(far, 6),
        false_rejection_rate=round(frr, 6),
        estimated_forgery_probability=round(estimated_prob, 6),
        confidence=confidence_level,
        confidence_interval=ci,
        metadata={
            "zero_event_observed": false_accepts == 0,
            "interpretation": "Observed zero false accepts indicates sample upper bound, not mathematical zero risk." if false_accepts == 0 else "Empirical FAR estimated."
        }
    )
