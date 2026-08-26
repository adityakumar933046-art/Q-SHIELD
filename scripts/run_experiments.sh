#!/usr/bin/env bash
set -e

echo "=== Running Q-SHIELD Experiment Suite ==="
python -c "
import sys
sys.path.insert(0, 'backend')
from app.experiments.runner import ExperimentRunner
runner = ExperimentRunner()
res = runner.run_experiment(scenario_id='LEGITIMATE_VERIFICATION', iterations=10)
print(f'Experiment ID: {res.experiment_id} | Status: {res.status}')
"
