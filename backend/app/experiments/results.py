import os
import csv
import json
import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.experiments.benchmark import BenchmarkResult


class ExperimentStatus(str, Enum):
    CREATED = "CREATED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class IterationStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"


class ExperimentObservation(BaseModel):
    iteration_id: str = Field(default_factory=lambda: f"ITR-{uuid.uuid4().hex[:8].upper()}")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    success: bool
    detected: bool
    blocked: bool
    decision: str
    latency: float
    error_count: int = 0
    total_measurements: int = 1000
    error_rate: float = 0.0
    threat_level: str = "LOW"
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ExperimentResult(BaseModel):
    experiment_id: str = Field(default_factory=lambda: f"EXP-{uuid.uuid4().hex[:12].upper()}")
    scenario_id: str
    scenario_version: str = "1.0"
    status: ExperimentStatus = ExperimentStatus.CREATED
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    requested_iterations: int
    completed_iterations: int = 0
    failed_iterations: int = 0
    skipped_iterations: int = 0
    observations: List[ExperimentObservation] = Field(default_factory=list)
    statistics: Dict[str, Any] = Field(default_factory=dict)
    benchmark: Optional[BenchmarkResult] = None
    configuration_summary: Dict[str, Any] = Field(default_factory=dict)
    environment: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)

    def to_json(self) -> str:
        """Export experiment result to JSON string."""
        return json.dumps(self.model_dump(), default=str, indent=2)

    def save_to_disk(self, output_dir: str = "C:/Users/adity/.gemini/antigravity/scratch/Q-SHIELD/experiments/results") -> str:

        """Save JSON and CSV result representations under experiments/results directory."""
        os.makedirs(output_dir, exist_ok=True)
        json_path = os.path.join(output_dir, f"{self.experiment_id}.json")
        csv_path = os.path.join(output_dir, f"{self.experiment_id}.csv")

        with open(json_path, "w", encoding="utf-8") as f:
            f.write(self.to_json())

        # Write iteration observations to CSV
        if self.observations:
            with open(csv_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow([
                    "experiment_id", "iteration_id", "timestamp", "success",
                    "detected", "blocked", "decision", "latency", "error_rate"
                ])
                for obs in self.observations:
                    writer.writerow([
                        self.experiment_id, obs.iteration_id, obs.timestamp.isoformat(),
                        obs.success, obs.detected, obs.blocked, obs.decision,
                        obs.latency, obs.error_rate
                    ])

        return json_path
