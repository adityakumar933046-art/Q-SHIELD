import os
import tempfile
from app.experiments.results import ExperimentResult, ExperimentStatus, ExperimentObservation


def test_experiment_result_json_and_csv_export():
    res = ExperimentResult(
        scenario_id="LEGITIMATE_VERIFICATION",
        requested_iterations=2,
        status=ExperimentStatus.COMPLETED,
        observations=[
            ExperimentObservation(success=True, detected=False, blocked=False, decision="ACCEPT", latency=0.01),
            ExperimentObservation(success=True, detected=False, blocked=False, decision="ACCEPT", latency=0.02),
        ]
    )

    with tempfile.TemporaryDirectory() as tmp_dir:
        json_path = res.save_to_disk(output_dir=tmp_dir)

        assert os.path.exists(json_path)
        assert os.path.exists(os.path.join(tmp_dir, f"{res.experiment_id}.csv"))

