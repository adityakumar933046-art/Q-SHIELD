from datetime import datetime, timezone
from enum import Enum
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field


class ExperimentType(str, Enum):
    LEGITIMATE = "LEGITIMATE"
    FORGERY = "FORGERY"
    REPLAY = "REPLAY"
    IMPERSONATION = "IMPERSONATION"
    CHANNEL_MANIPULATION = "CHANNEL_MANIPULATION"
    NOISE_SIMULATION = "NOISE_SIMULATION"
    THRESHOLD_SWEEP = "THRESHOLD_SWEEP"
    SHOTS_SWEEP = "SHOTS_SWEEP"


class ExperimentScenario(BaseModel):
    scenario_id: str
    name: str
    description: str
    experiment_type: ExperimentType
    enabled: bool = True
    iterations: int = 10
    scenario_version: str = "1.0"
    configuration: Dict[str, Any] = Field(default_factory=dict)
    expected_behavior: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: Dict[str, Any] = Field(default_factory=dict)


# Centralized Baseline Scenarios Registry
BASELINE_SCENARIOS: Dict[str, ExperimentScenario] = {
    "LEGITIMATE_VERIFICATION": ExperimentScenario(
        scenario_id="LEGITIMATE_VERIFICATION",
        name="Legitimate QDS Signature Verification",
        description="Evaluates valid QDS signature creation, teleportation, and verification pipeline.",
        experiment_type=ExperimentType.LEGITIMATE,
        iterations=10,
        expected_behavior="Valid signatures verified and ACCEPTED."
    ),
    "FORGERY_SIGNATURE_MODIFICATION": ExperimentScenario(
        scenario_id="FORGERY_SIGNATURE_MODIFICATION",
        name="Signature Data Modification Forgery",
        description="Simulates signature payload tampering.",
        experiment_type=ExperimentType.FORGERY,
        iterations=10,
        expected_behavior="Tampered signatures detected and REJECTED."
    ),
    "FORGERY_MESSAGE_MODIFICATION": ExperimentScenario(
        scenario_id="FORGERY_MESSAGE_MODIFICATION",
        name="Message Digest Modification Forgery",
        description="Simulates message content modification.",
        experiment_type=ExperimentType.FORGERY,
        iterations=10,
        expected_behavior="Digest mismatch detected and REJECTED."
    ),
    "REPLAY_NONCE_REUSE": ExperimentScenario(
        scenario_id="REPLAY_NONCE_REUSE",
        name="Nonce Reuse Replay Simulation",
        description="Simulates re-execution of previously registered nonces.",
        experiment_type=ExperimentType.REPLAY,
        iterations=10,
        expected_behavior="Replayed nonces blocked by ReplayProtectionService."
    ),
    "IMPERSONATION_UNAUTHORIZED_USER": ExperimentScenario(
        scenario_id="IMPERSONATION_UNAUTHORIZED_USER",
        name="Unauthorized User Impersonation",
        description="Simulates unauthorized identity verification attempts.",
        experiment_type=ExperimentType.IMPERSONATION,
        iterations=10,
        expected_behavior="Unauthorized credentials blocked by RBAC authorization."
    ),
    "CHANNEL_BYTE_MUTATION": ExperimentScenario(
        scenario_id="CHANNEL_BYTE_MUTATION",
        name="Channel Byte Mutation Simulation",
        description="Simulates noise/corruption over quantum classical channel.",
        experiment_type=ExperimentType.CHANNEL_MANIPULATION,
        iterations=10,
        expected_behavior="Corrupted channel data detected and REJECTED."
    ),
    # Phase 16 Research Extensions
    "NOISY_VERIFICATION_BITFLIP": ExperimentScenario(
        scenario_id="NOISY_VERIFICATION_BITFLIP",
        name="Bit-Flip Noise Verification Simulation",
        description="Evaluates QDS verification under simulated 5% bit-flip quantum noise.",
        experiment_type=ExperimentType.NOISE_SIMULATION,
        iterations=10,
        configuration={"noise_type": "bitflip", "error_rate": 0.05},
        expected_behavior="Measurement error tracked and threshold verified."
    ),
    "NOISY_VERIFICATION_DEPOLARIZING": ExperimentScenario(
        scenario_id="NOISY_VERIFICATION_DEPOLARIZING",
        name="Depolarizing Noise Verification Simulation",
        description="Evaluates QDS verification under simulated 5% depolarizing channel noise.",
        experiment_type=ExperimentType.NOISE_SIMULATION,
        iterations=10,
        configuration={"noise_type": "depolarizing", "error_rate": 0.05},
        expected_behavior="Depolarizing channel error quantified."
    ),
    "THRESHOLD_SWEEP_LOW": ExperimentScenario(
        scenario_id="THRESHOLD_SWEEP_LOW",
        name="Low Acceptance Threshold Evaluation",
        description="Evaluates acceptance rates under permissive threshold (eta_v = 0.80).",
        experiment_type=ExperimentType.THRESHOLD_SWEEP,
        iterations=10,
        configuration={"threshold_eta_v": 0.80},
        expected_behavior="Acceptance rate increases with looser bounds."
    ),
    "THRESHOLD_SWEEP_HIGH": ExperimentScenario(
        scenario_id="THRESHOLD_SWEEP_HIGH",
        name="High Acceptance Threshold Evaluation",
        description="Evaluates acceptance rates under strict threshold (eta_v = 0.95).",
        experiment_type=ExperimentType.THRESHOLD_SWEEP,
        iterations=10,
        configuration={"threshold_eta_v": 0.95},
        expected_behavior="Rejection rate increases under strict bounds."
    ),
    "SHOTS_SWEEP_SMALL": ExperimentScenario(
        scenario_id="SHOTS_SWEEP_SMALL",
        name="Small Sample Size Evaluation (100 Shots)",
        description="Evaluates statistical variance under N = 100 measurement shots.",
        experiment_type=ExperimentType.SHOTS_SWEEP,
        iterations=10,
        configuration={"shots": 100},
        expected_behavior="Higher statistical variance observed."
    ),
    "SHOTS_SWEEP_LARGE": ExperimentScenario(
        scenario_id="SHOTS_SWEEP_LARGE",
        name="Large Sample Size Evaluation (5000 Shots)",
        description="Evaluates statistical precision under N = 5000 measurement shots.",
        experiment_type=ExperimentType.SHOTS_SWEEP,
        iterations=10,
        configuration={"shots": 5000},
        expected_behavior="Narrow confidence interval bounds achieved."
    )
}


class ScenarioRegistry:
    """Registry accessor for ExperimentScenario definitions."""

    @staticmethod
    def get(scenario_id: str) -> Optional[ExperimentScenario]:
        return BASELINE_SCENARIOS.get(scenario_id)

    @staticmethod
    def get_scenario(scenario_id: str) -> Optional[ExperimentScenario]:
        return BASELINE_SCENARIOS.get(scenario_id)

    @staticmethod
    def list_scenarios() -> List[ExperimentScenario]:
        return list(BASELINE_SCENARIOS.values())

    @staticmethod
    def get_all() -> List[ExperimentScenario]:
        return list(BASELINE_SCENARIOS.values())

