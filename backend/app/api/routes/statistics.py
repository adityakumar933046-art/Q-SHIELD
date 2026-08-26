from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.statistics.error_rate import calculate_error_rate
from app.statistics.forgery_analysis import analyze_forgery_risk
from app.statistics.hypothesis_tests import run_binomial_test
from app.statistics.confidence import calculate_confidence_interval

router = APIRouter(prefix="/statistics", tags=["statistics"])


class ErrorRateRequest(BaseModel):
    errors: int
    observations: int


class ForgeryRequest(BaseModel):
    false_accepts: int
    total_attempts: int
    false_rejects: int = 0
    legitimate_attempts: int = 0


class HypothesisRequest(BaseModel):
    successes: int
    trials: int
    p_expected: float = 0.5


class ConfidenceRequest(BaseModel):
    successes: int
    sample_size: int
    confidence_level: float = 0.95


@router.get("/summary")
def statistics_summary():
    return {
        "status": "statistical_engine_operational",
        "phase": 6,
        "capabilities": ["error_rate", "forgery_risk", "hypothesis_testing", "confidence_intervals", "metrics"]
    }


@router.post("/error-rate")
def compute_error_rate(req: ErrorRateRequest):
    try:
        res = calculate_error_rate(errors=req.errors, observations=req.observations)
        return res.model_dump()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/forgery")
def compute_forgery_risk(req: ForgeryRequest):
    try:
        res = analyze_forgery_risk(
            false_accepts=req.false_accepts,
            total_attempts=req.total_attempts,
            false_rejects=req.false_rejects,
            legitimate_attempts=req.legitimate_attempts
        )
        return res.model_dump()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/hypothesis-test")
def compute_hypothesis_test(req: HypothesisRequest):
    try:
        res = run_binomial_test(
            successes=req.successes,
            trials=req.trials,
            p_expected=req.p_expected
        )
        return res.model_dump()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/confidence")
def compute_confidence_interval(req: ConfidenceRequest):
    try:
        res = calculate_confidence_interval(
            successes=req.successes,
            sample_size=req.sample_size,
            confidence_level=req.confidence_level
        )
        return res.model_dump()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
