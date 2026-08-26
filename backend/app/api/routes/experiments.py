from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.experiments.runner import ExperimentRunner
from app.experiments.scenarios import ScenarioRegistry, ExperimentScenario
from app.api.dependencies import require_permission
from app.security.authorization import Permission
from app.security.identity import IdentityContext

router = APIRouter(prefix="/experiments", tags=["experiments"])
runner = ExperimentRunner()
require_exp_permission = require_permission(Permission.RUN_EXPERIMENT.value)


class ExperimentRunRequest(BaseModel):
    scenario_id: str
    iterations: Optional[int] = 10
    seed: Optional[int] = 42


@router.get("/scenarios", response_model=List[ExperimentScenario])
def list_scenarios():
    return ScenarioRegistry.list_scenarios()


@router.post("/", status_code=status.HTTP_201_CREATED)
def run_experiment_endpoint(
    req: ExperimentRunRequest,
    operator: IdentityContext = Depends(require_exp_permission),
    db: Session = Depends(get_db)
):
    try:
        res = runner.run_experiment(
            scenario_id=req.scenario_id,
            iterations=req.iterations,
            seed=req.seed,
            db=db
        )
        return res.model_dump()
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
