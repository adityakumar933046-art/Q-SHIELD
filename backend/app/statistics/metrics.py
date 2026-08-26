from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.statistics.error_rate import calculate_aggregated_error_rate
from app.statistics.confidence import calculate_confidence_interval, ConfidenceInterval
from app.statistics.forgery_analysis import analyze_forgery_risk


class StatisticalMetrics(BaseModel):
    total_samples: int
    accepted: int
    rejected: int
    error_rate: float
    false_acceptance_rate: float
    false_rejection_rate: float
    confidence_interval: Optional[ConfidenceInterval] = None
    threshold_status: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


def aggregate_metrics(
    verifications_data: List[Dict[str, Any]],
    confidence_level: float = 0.95
) -> StatisticalMetrics:
    """Aggregate raw verification records into structured statistical metrics."""
    if not verifications_data:
        return StatisticalMetrics(
            total_samples=0,
            accepted=0,
            rejected=0,
            error_rate=0.0,
            false_acceptance_rate=0.0,
            false_rejection_rate=0.0,
            threshold_status="NO_DATA",
            metadata={"message": "No verification data provided."}
        )

    total_samples = len(verifications_data)
    accepted = sum(1 for v in verifications_data if v.get("result") in ("ACCEPT", "ACCEPTED"))
    rejected = total_samples - accepted

    # Aggregate error rates
    errors = sum(1 for v in verifications_data if v.get("result") not in ("ACCEPT", "ACCEPTED"))
    error_rate = float(errors / total_samples)

    ci = calculate_confidence_interval(
        successes=accepted,
        sample_size=total_samples,
        confidence_level=confidence_level
    )

    forgery_analysis = analyze_forgery_risk(
        false_accepts=sum(1 for v in verifications_data if v.get("false_accept", False)),
        total_attempts=total_samples,
        confidence_level=confidence_level
    )

    return StatisticalMetrics(
        total_samples=total_samples,
        accepted=accepted,
        rejected=rejected,
        error_rate=round(error_rate, 6),
        false_acceptance_rate=forgery_analysis.false_acceptance_rate,
        false_rejection_rate=forgery_analysis.false_rejection_rate,
        confidence_interval=ci,
        threshold_status="PASSED" if error_rate <= 0.11 else "EXCEEDED",
        metadata={"num_records": total_samples}
    )
