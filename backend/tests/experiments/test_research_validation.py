from app.experiments.scenarios import BASELINE_SCENARIOS, ExperimentType
from app.quantum.states import state_plus
from app.quantum.measurement import MeasurementService


def test_research_scenario_registry():
    assert "NOISY_VERIFICATION_BITFLIP" in BASELINE_SCENARIOS
    assert "THRESHOLD_SWEEP_HIGH" in BASELINE_SCENARIOS
    assert "SHOTS_SWEEP_LARGE" in BASELINE_SCENARIOS

    sc_noisy = BASELINE_SCENARIOS["NOISY_VERIFICATION_BITFLIP"]
    assert sc_noisy.experiment_type == ExperimentType.NOISE_SIMULATION
    assert sc_noisy.configuration["noise_type"] == "bitflip"


def test_deterministic_seed_reproducibility():
    sp = state_plus()
    res1 = MeasurementService.measure_state(sp, shots=1000, seed=42)
    res2 = MeasurementService.measure_state(sp, shots=1000, seed=42)

    assert res1.shots == res2.shots == 1000
    assert res1.counts == res2.counts
    assert res1.probabilities == res2.probabilities


def test_shots_sweep_precision():
    sp = state_plus()
    res_small = MeasurementService.measure_state(sp, shots=100, seed=42)
    res_large = MeasurementService.measure_state(sp, shots=5000, seed=42)

    assert res_small.shots == 100
    assert res_large.shots == 5000
    assert abs(res_large.probabilities["0"] - 0.5) < 0.05
