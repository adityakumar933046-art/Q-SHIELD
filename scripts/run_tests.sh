#!/usr/bin/env bash
set -e

echo "=== Executing Q-SHIELD Unit Test Suite ==="
python -c "
import sys, importlib
sys.path.insert(0, 'backend')
test_files = [
    'tests.test_health', 'tests.test_database', 'tests.test_models', 'tests.test_schemas',
    'tests.security.test_impersonation', 'tests.security.test_authorization',
    'tests.security.test_replay', 'tests.security.test_forgery',
    'tests.quantum.test_pauli', 'tests.quantum.test_bell_states',
    'tests.quantum.test_teleportation', 'tests.quantum.test_measurement',
    'tests.qds.test_signature', 'tests.qds.test_verification',
    'tests.statistics.test_error_rate', 'tests.statistics.test_threshold',
    'tests.attacks.test_forgery', 'tests.attacks.test_impersonation',
    'tests.attacks.test_replay', 'tests.attacks.test_channel_manipulation',
    'tests.attacks.test_unauthorized_verification',
    'tests.experiments.test_scenarios', 'tests.experiments.test_benchmark',
    'tests.experiments.test_results', 'tests.experiments.test_runner',
    'tests.audit.test_event', 'tests.audit.test_logger', 'tests.audit.test_forensic'
]
passed = 0
total = 0
for tf in test_files:
    mod = importlib.import_module(tf)
    for attr in dir(mod):
        if attr.startswith('test_') and callable(getattr(mod, attr)):
            total += 1
            getattr(mod, attr)()
            passed += 1
print(f'TEST SUITE SUMMARY: {passed}/{total} PASSED')
"
