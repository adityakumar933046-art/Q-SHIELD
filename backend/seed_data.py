import os
import secrets
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qshield.settings')
django.setup()

from apps.accounts.models import User
from apps.organizations.models import Organization
from apps.threat_detection.models import ThresholdRule
from apps.qds.models import QuantumDigitalSignature
from apps.quantum_engine.services import QuantumEngineService
from apps.statistics_engine.services import StatisticsEngineService
from apps.threat_detection.services import ThreatDetectionService

def run_seed():
    print("=== Seeding Q-SHIELD Database (DEVELOPMENT ONLY) ===")

    # 1. Create Organization
    org, created = Organization.objects.get_or_create(
        domain="quantum.defense.gov",
        defaults={
            "name": "Defense Quantum Cyber Command",
            "description": "National Cyber Security Center Quantum Digital Signature Node",
            "max_quantum_nodes": 25,
            "is_active": True
        }
    )
    print(f"  Organization: {org.name} ({'Created' if created else 'Exists'})")

    # Passwords from environment or safe development defaults
    admin_pass = os.getenv('SEED_ADMIN_PASSWORD', 'AdminDevPassword2026!')
    signer_pass = os.getenv('SEED_SIGNER_PASSWORD', 'SignerDevPassword2026!')
    verifier_pass = os.getenv('SEED_VERIFIER_PASSWORD', 'VerifierDevPassword2026!')
    analyst_pass = os.getenv('SEED_ANALYST_PASSWORD', 'AnalystDevPassword2026!')

    # 2. Create Users with Explicit RBAC Roles
    admin_user, created = User.objects.get_or_create(
        username="admin",
        defaults={
            "email": "admin@quantum.defense.gov",
            "role": User.Role.ADMIN,
            "organization": org,
            "department": "Security Operations",
            "is_staff": True,
            "is_superuser": True
        }
    )
    if created:
        admin_user.set_password(admin_pass)
        admin_user.save()
    print(f"  User: admin (Role: ADMIN, Password: {admin_pass}) ({'Created' if created else 'Exists'})")

    signer_user, created = User.objects.get_or_create(
        username="signer_alice",
        defaults={
            "email": "alice@quantum.defense.gov",
            "role": User.Role.SIGNER,
            "organization": org,
            "department": "Quantum Physics Lab"
        }
    )
    if created:
        signer_user.set_password(signer_pass)
        signer_user.save()
    print(f"  User: signer_alice (Role: SIGNER, Password: {signer_pass}) ({'Created' if created else 'Exists'})")

    verifier_user, created = User.objects.get_or_create(
        username="verifier_bob",
        defaults={
            "email": "bob@quantum.defense.gov",
            "role": User.Role.VERIFIER,
            "organization": org,
            "department": "Verification Node 01"
        }
    )
    if created:
        verifier_user.set_password(verifier_pass)
        verifier_user.save()
    print(f"  User: verifier_bob (Role: VERIFIER, Password: {verifier_pass}) ({'Created' if created else 'Exists'})")

    analyst_user, created = User.objects.get_or_create(
        username="analyst_carol",
        defaults={
            "email": "carol@quantum.defense.gov",
            "role": User.Role.SECURITY_ANALYST,
            "organization": org,
            "department": "Threat Intelligence SOC"
        }
    )
    if created:
        analyst_user.set_password(analyst_pass)
        analyst_user.save()
    print(f"  User: analyst_carol (Role: SECURITY_ANALYST, Password: {analyst_pass}) ({'Created' if created else 'Exists'})")

    # 3. Create Threshold Rules
    rules_data = [
        {
            "rule_name": "QBER Security Upper Bound",
            "metric_type": "QBER",
            "operator": ">",
            "threshold_value": 0.11,
            "severity": "CRITICAL",
            "description": "Triggers when Quantum Bit Error Rate exceeds the 11% QDS teleportation security limit."
        },
        {
            "rule_name": "State Fidelity Overlap Floor",
            "metric_type": "FIDELITY",
            "operator": "<",
            "threshold_value": 0.85,
            "severity": "HIGH",
            "description": "Triggers when density matrix state fidelity drops below 85%."
        },
        {
            "rule_name": "Chi-Square Significance Limit",
            "metric_type": "CHI_SQUARE_P",
            "operator": "<",
            "threshold_value": 0.05,
            "severity": "MEDIUM",
            "description": "Triggers when measurement outcome distribution hypothesis p-value < 0.05."
        },
        {
            "rule_name": "Signature Forgery Probability Limit",
            "metric_type": "FORGERY_PROB",
            "operator": ">",
            "threshold_value": 0.05,
            "severity": "CRITICAL",
            "description": "Triggers when probability of adversary signature forgery exceeds 5%."
        }
    ]

    for r_data in rules_data:
        rule, created = ThresholdRule.objects.get_or_create(
            rule_name=r_data["rule_name"],
            defaults=r_data
        )
        print(f"  Threshold Rule: {rule.rule_name} ({'Created' if created else 'Exists'})")

    # 4. Generate initial sample QDS signature & run baseline execution
    q_res = QuantumEngineService.run_teleportation_qds(input_state_symbol='|+>', bell_type='PHI_PLUS', shots=1024)
    stat_res = StatisticsEngineService.analyze_quantum_execution(q_res)
    ThreatDetectionService.evaluate_threat(stat_res, {'user': 'admin'})

    print("=== Seed completed successfully! ===")

if __name__ == "__main__":
    run_seed()
