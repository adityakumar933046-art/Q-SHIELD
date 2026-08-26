from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field


class MeasurementAnalysis(BaseModel):
    valid: bool
    shots: int
    counts: Dict[str, int]
    probabilities: Dict[str, float]
    error_count: int
    error_rate: float
    fidelity: Optional[float] = None
    consistency_score: float
    expected_outcomes: Dict[str, float] = Field(default_factory=dict)
    observed_outcomes: Dict[str, float] = Field(default_factory=dict)
    warnings_or_errors: List[str] = Field(default_factory=list)


class MeasurementAnalyzer:
    """Analyzes quantum measurement outcomes and extracts verification metrics."""

    @staticmethod
    def analyze(
        measurements_data: Dict[str, Any],
        quantum_result_data: Optional[Dict[str, Any]] = None
    ) -> MeasurementAnalysis:
        warnings: List[str] = []

        shots = measurements_data.get("shots", 1024)
        counts = measurements_data.get("counts", {})
        probs = measurements_data.get("probabilities", {})

        if shots <= 0:
            warnings.append("Shots must be positive integer.")
            valid = False
        else:
            valid = True

        # Check probability sum
        prob_sum = sum(probs.values()) if probs else 0.0
        if abs(prob_sum - 1.0) > 0.05 and shots > 0:
            warnings.append(f"Probabilities sum to {prob_sum:.4f}, expected ~1.0.")

        # Extract fidelity if present in quantum_result_data
        fidelity = None
        if quantum_result_data and "fidelity" in quantum_result_data:
            try:
                fidelity = float(quantum_result_data["fidelity"])
            except Exception:
                fidelity = None

        # Expected outcome for |+> state measurement in Z basis: ~50% '0', ~50% '1'
        # Error rate calculation: deviation from expected distribution or observed non-zero error count
        expected_outcomes = {"0": 0.5, "1": 0.5}
        observed_outcomes = {k: float(v) for k, v in probs.items()}

        # Error rate computed as deviation from expected state probability or 1 - fidelity if fidelity available
        if fidelity is not None:
            error_rate = max(0.0, 1.0 - fidelity)
        else:
            # Deviation from expected probabilities
            dev = 0.0
            for k, expected_p in expected_outcomes.items():
                actual_p = observed_outcomes.get(k, 0.0)
                dev += abs(actual_p - expected_p)
            error_rate = min(1.0, dev / 2.0)

        error_count = int(round(error_rate * shots))
        consistency_score = max(0.0, 1.0 - error_rate)

        return MeasurementAnalysis(
            valid=valid and len(warnings) == 0,
            shots=shots,
            counts=counts,
            probabilities=probs,
            error_count=error_count,
            error_rate=round(error_rate, 4),
            fidelity=fidelity,
            consistency_score=round(consistency_score, 4),
            expected_outcomes=expected_outcomes,
            observed_outcomes=observed_outcomes,
            warnings_or_errors=warnings
        )
