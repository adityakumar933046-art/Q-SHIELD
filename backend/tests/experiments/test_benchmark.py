from app.experiments.benchmark import ExperimentBenchmark, _percentile
from app.experiments.results import ExperimentObservation


def test_percentile_calculation():
    data = [1.0, 2.0, 3.0, 4.0, 5.0]
    assert _percentile(data, 50) == 3.0
    assert _percentile(data, 90) == 4.6


def test_experiment_benchmark_compute():
    obs = [
        ExperimentObservation(success=True, detected=False, blocked=False, decision="ACCEPT", latency=0.01),
        ExperimentObservation(success=True, detected=False, blocked=False, decision="ACCEPT", latency=0.02),
        ExperimentObservation(success=False, detected=True, blocked=True, decision="REJECT", latency=0.03),
    ]

    res = ExperimentBenchmark.compute(observations=obs, elapsed_seconds=0.1)
    assert res.total_iterations == 3
    assert res.successful_iterations == 3
    assert res.throughput == 30.0
