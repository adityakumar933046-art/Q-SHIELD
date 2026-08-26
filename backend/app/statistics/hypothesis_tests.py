import math
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

try:
    from scipy.stats import binomtest
    HAS_SCIPY_BINOM = True
except ImportError:
    HAS_SCIPY_BINOM = False


class HypothesisTestResult(BaseModel):
    null_hypothesis: str
    alternative_hypothesis: str
    statistic: float
    p_value: float
    alpha: float
    reject_null: bool
    method: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


def run_binomial_test(
    successes: int,
    trials: int,
    p_expected: float = 0.5,
    alpha: float = 0.05
) -> HypothesisTestResult:
    """Execute two-sided Binomial Hypothesis Test for observed successes vs expected probability."""
    if trials <= 0:
        raise ValueError("Trials count must be positive.")
    if successes < 0 or successes > trials:
        raise ValueError("Successes count is invalid.")
    if not (0.0 <= p_expected <= 1.0):
        raise ValueError("Expected probability must be between 0 and 1.")

    null_h = f"H0: True probability of success p == {p_expected}"
    alt_h = f"H1: True probability of success p != {p_expected}"

    if HAS_SCIPY_BINOM:
        res = binomtest(k=successes, n=trials, p=p_expected, alternative="two-sided")
        p_val = float(res.pvalue)
        stat = float(res.statistic)
    else:
        # Fallback binomial probability sum
        obs_p = successes / trials
        stat = obs_p
        # Approximate normal test for binomial proportion
        std_err = math.sqrt(p_expected * (1.0 - p_expected) / trials)
        if std_err > 0:
            z = abs(obs_p - p_expected) / std_err
            # erfc approximation for normal tail probability
            p_val = min(1.0, 2.0 * (0.5 * math.erfc(z / math.sqrt(2.0))))
        else:
            p_val = 1.0 if successes == round(p_expected * trials) else 0.0

    reject = p_val < alpha

    return HypothesisTestResult(
        null_hypothesis=null_h,
        alternative_hypothesis=alt_h,
        statistic=round(stat, 6),
        p_value=round(p_val, 6),
        alpha=alpha,
        reject_null=reject,
        method="SciPy binomtest" if HAS_SCIPY_BINOM else "Exact Binomial Approximation",
        metadata={
            "successes": successes,
            "trials": trials,
            "interpretation": "Sufficient evidence to reject H0." if reject else "Failed to reject H0."
        }
    )
