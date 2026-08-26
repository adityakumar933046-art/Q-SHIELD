import statistics
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class BenchmarkResult(BaseModel):
    total_iterations: int
    successful_iterations: int
    failed_iterations: int
    average_latency: float
    median_latency: float
    minimum_latency: float
    maximum_latency: float
    p50_latency: float
    p90_latency: float
    p95_latency: float
    p99_latency: float
    throughput: float
    detection_rate: float
    attack_success_rate: float
    error_rate: float
    metadata: Dict[str, Any] = Field(default_factory=dict)


def _percentile(data: List[float], p: float) -> float:
    """Compute percentile value for latency measurements."""
    if not data:
        return 0.0
    sorted_data = sorted(data)
    n = len(sorted_data)
    if n == 1:
        return sorted_data[0]
    idx = (n - 1) * (p / 100.0)
    floor_idx = int(idx)
    ceil_idx = min(floor_idx + 1, n - 1)
    weight = idx - floor_idx
    return sorted_data[floor_idx] * (1.0 - weight) + sorted_data[ceil_idx] * weight


class ExperimentBenchmark:
    """Computes latency percentiles, throughput, and detection benchmarks."""

    @staticmethod
    def compute(
        observations: List[Any],
        elapsed_seconds: float
    ) -> BenchmarkResult:
        total = len(observations)
        if total == 0:
            return BenchmarkResult(
                total_iterations=0,
                successful_iterations=0,
                failed_iterations=0,
                average_latency=0.0,
                median_latency=0.0,
                minimum_latency=0.0,
                maximum_latency=0.0,
                p50_latency=0.0,
                p90_latency=0.0,
                p95_latency=0.0,
                p99_latency=0.0,
                throughput=0.0,
                detection_rate=0.0,
                attack_success_rate=0.0,
                error_rate=0.0
            )

        latencies = [getattr(obs, "latency", 0.0) for obs in observations]
        successful = sum(1 for obs in observations if getattr(obs, "success", False) or getattr(obs, "blocked", False))
        failed = total - successful

        avg_lat = float(sum(latencies) / total)
        med_lat = float(statistics.median(latencies)) if latencies else 0.0
        min_lat = float(min(latencies)) if latencies else 0.0
        max_lat = float(max(latencies)) if latencies else 0.0

        p50 = _percentile(latencies, 50)
        p90 = _percentile(latencies, 90)
        p95 = _percentile(latencies, 95)
        p99 = _percentile(latencies, 99)

        throughput = float(total / elapsed_seconds) if elapsed_seconds > 0 else 0.0
        detected_count = sum(1 for obs in observations if getattr(obs, "detected", False))
        detection_rate = float(detected_count / total)
        attack_success_rate = float(sum(1 for obs in observations if getattr(obs, "success", False) and getattr(obs, "blocked", False) is False) / total)

        error_rate = float(sum(getattr(obs, "error_rate", 0.0) for obs in observations) / total)

        return BenchmarkResult(
            total_iterations=total,
            successful_iterations=successful,
            failed_iterations=failed,
            average_latency=round(avg_lat, 6),
            median_latency=round(med_lat, 6),
            minimum_latency=round(min_lat, 6),
            maximum_latency=round(max_lat, 6),
            p50_latency=round(p50, 6),
            p90_latency=round(p90, 6),
            p95_latency=round(p95, 6),
            p99_latency=round(p99, 6),
            throughput=round(throughput, 4),
            detection_rate=round(detection_rate, 4),
            attack_success_rate=round(attack_success_rate, 4),
            error_rate=round(error_rate, 4)
        )
