from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.database import Base
from app.experiments.runner import ExperimentRunner
from app.experiments.results import ExperimentStatus


def test_runner_legitimate_scenario_execution():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine)
    db = TestingSession()

    runner = ExperimentRunner()
    res = runner.run_experiment(scenario_id="LEGITIMATE_VERIFICATION", iterations=2, db=db)

    assert res.status == ExperimentStatus.COMPLETED
    assert res.completed_iterations == 2
    assert res.benchmark is not None
    assert res.benchmark.total_iterations == 2

    db.close()
