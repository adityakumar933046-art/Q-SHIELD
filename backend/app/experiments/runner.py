import sys
import time
import platform
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session

from app.experiments.scenarios import ScenarioRegistry, ExperimentScenario, ExperimentType
from app.experiments.results import ExperimentResult, ExperimentObservation, ExperimentStatus
from app.experiments.benchmark import ExperimentBenchmark
from app.statistics.metrics import aggregate_metrics
from app.qds.protocol import QDSProtocol
from app.verification.verification_engine import VerificationEngine
from app.attacks.forgery import ForgeryAttack
from app.attacks.replay import ReplayAttack
from app.attacks.impersonation import ImpersonationAttack
from app.attacks.channel_manipulation import ChannelManipulationAttack
from app.security.identity import IdentityContext
from app.database.models import User


class ExperimentRunner:
    """Master Experiment Runner Orchestrator."""

    def __init__(self):
        self.protocol = QDSProtocol()
        self.verif_engine = VerificationEngine()

    def run_experiment(
        self,
        scenario_id: str,
        iterations: Optional[int] = None,
        seed: Optional[int] = 42,
        db: Session = None
    ) -> ExperimentResult:
        scenario = ScenarioRegistry.get_scenario(scenario_id)
        num_iterations = iterations or scenario.iterations

        if num_iterations <= 0 or num_iterations > 1000:
            raise ValueError("Iterations count must be between 1 and 1000.")

        start_wall = time.monotonic()
        started_at = datetime.now(timezone.utc)

        exp_result = ExperimentResult(
            scenario_id=scenario.scenario_id,
            scenario_version=scenario.scenario_version,
            status=ExperimentStatus.RUNNING,
            started_at=started_at,
            requested_iterations=num_iterations,
            configuration_summary={"iterations": num_iterations, "seed": seed},
            environment={
                "python_version": sys.version,
                "platform": platform.platform(),
                "protocol_version": self.protocol.version
            }
        )

        # Isolated Test User Setup in Database if db session provided
        test_user_id = "test_exp_user_01"
        if db:
            user = db.query(User).filter(User.username == "exp_user").first()
            if not user:
                user = User(username="exp_user", email="exp@qshield.org")
                db.add(user)
                db.commit()
                db.refresh(user)
            test_user_id = user.id

        observations: List[ExperimentObservation] = []
        completed = 0
        failed = 0

        for i in range(num_iterations):
            iter_start = time.monotonic()
            try:
                if scenario.experiment_type == ExperimentType.LEGITIMATE:
                    session = self.protocol.initialize_session(signer_id=test_user_id)
                    message = f"Legitimate Message Payload Iteration {i}"
                    signature = self.protocol.create_signature(message=message, signer_id=test_user_id, session=session, db=db)
                    
                    v_identity = IdentityContext(user_id=test_user_id, username="exp_verifier", roles=["VERIFIER"])
                    verif_dec = self.verif_engine.verify_signature(
                        signature_id=signature.signature_id,
                        message=message,
                        verifier_identity=v_identity,
                        db=db
                    )
                    latency = time.monotonic() - iter_start
                    obs = ExperimentObservation(
                        success=(verif_dec.decision.value == "ACCEPT"),
                        detected=False,
                        blocked=False,
                        decision=verif_dec.decision.value,
                        latency=round(latency, 6),
                        error_rate=verif_dec.error_rate
                    )

                elif scenario.experiment_type == ExperimentType.FORGERY:
                    session = self.protocol.initialize_session(signer_id=test_user_id)
                    message = f"Base Message Forgery Iteration {i}"
                    signature = self.protocol.create_signature(message=message, signer_id=test_user_id, session=session, db=db)
                    
                    attack = ForgeryAttack(target="local_qshield")
                    atk_res = attack.run_simulation(signature_id=signature.signature_id, message=message, scenario="MESSAGE_DIGEST_MODIFICATION", db=db)
                    latency = time.monotonic() - iter_start
                    obs = ExperimentObservation(
                        success=atk_res.success,
                        detected=atk_res.detected,
                        blocked=atk_res.blocked,
                        decision="REJECT" if atk_res.blocked else "ACCEPT",
                        latency=round(latency, 6)
                    )

                elif scenario.experiment_type == ExperimentType.REPLAY:
                    session = self.protocol.initialize_session(signer_id=test_user_id)
                    message = f"Replay Payload Iteration {i}"
                    signature = self.protocol.create_signature(message=message, signer_id=test_user_id, session=session, db=db)
                    
                    attack = ReplayAttack(target="local_qshield")
                    atk_res = attack.run_simulation(signature_id=signature.signature_id, message=message, db=db)
                    latency = time.monotonic() - iter_start
                    obs = ExperimentObservation(
                        success=atk_res.success,
                        detected=atk_res.detected,
                        blocked=atk_res.blocked,
                        decision="REJECT" if atk_res.blocked else "ACCEPT",
                        latency=round(latency, 6)
                    )

                elif scenario.experiment_type == ExperimentType.IMPERSONATION:
                    attack = ImpersonationAttack(target="local_qshield")
                    atk_res = attack.run_simulation(user_id=f"impersonator_{i}", db=db)
                    latency = time.monotonic() - iter_start
                    obs = ExperimentObservation(
                        success=atk_res.success,
                        detected=atk_res.detected,
                        blocked=atk_res.blocked,
                        decision="BLOCKED" if atk_res.blocked else "ALLOWED",
                        latency=round(latency, 6)
                    )

                else:
                    session = self.protocol.initialize_session(signer_id=test_user_id)
                    message = f"Channel Payload Iteration {i}"
                    signature = self.protocol.create_signature(message=message, signer_id=test_user_id, session=session, db=db)
                    
                    attack = ChannelManipulationAttack(target="local_qshield")
                    atk_res = attack.run_simulation(signature_id=signature.signature_id, original_message=message, db=db)
                    latency = time.monotonic() - iter_start
                    obs = ExperimentObservation(
                        success=atk_res.success,
                        detected=atk_res.detected,
                        blocked=atk_res.blocked,
                        decision="REJECT" if atk_res.blocked else "ACCEPT",
                        latency=round(latency, 6)
                    )

                observations.append(obs)
                completed += 1
            except Exception as e:
                failed += 1

        elapsed_total = time.monotonic() - start_wall

        # Statistical integration via Phase 6 aggregate_metrics
        verif_records = [{"result": obs.decision} for obs in observations]
        stat_metrics = aggregate_metrics(verif_records)

        # Benchmark calculation
        benchmark_res = ExperimentBenchmark.compute(observations=observations, elapsed_seconds=elapsed_total)

        exp_result.status = ExperimentStatus.COMPLETED if failed == 0 else ExperimentStatus.FAILED
        exp_result.completed_at = datetime.now(timezone.utc)
        exp_result.completed_iterations = completed
        exp_result.failed_iterations = failed
        exp_result.observations = observations
        exp_result.statistics = stat_metrics.model_dump()
        exp_result.benchmark = benchmark_res

        # Save result JSON to disk
        exp_result.save_to_disk()
        return exp_result
