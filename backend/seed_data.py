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

    org2, created2 = Organization.objects.get_or_create(
        domain="quantumsecure.com",
        defaults={
            "name": "Quantum Secure Ltd.",
            "description": "Commercial Entanglement and Security Division",
            "max_quantum_nodes": 15,
            "is_active": True
        }
    )
    print(f"  Organization: {org2.name} ({'Created' if created2 else 'Exists'})")

    # Passwords from environment or safe development defaults
    admin_pass = os.getenv('SEED_ADMIN_PASSWORD', 'admin123')
    signer_pass = os.getenv('SEED_SIGNER_PASSWORD', 'alice123')
    verifier_pass = os.getenv('SEED_VERIFIER_PASSWORD', 'bob123')
    analyst_pass = os.getenv('SEED_ANALYST_PASSWORD', 'analyst123')

    # 2. Create Users with Explicit RBAC Roles
    default_pass = os.getenv('SEED_DEFAULT_PASSWORD', 'Password@123')
    
    role_accounts = [
        ("superadmin", "superadmin@quantum.defense.gov", User.Role.SUPER_ADMIN, True, True),
        ("orgadmin", "orgadmin@quantum.defense.gov", User.Role.ORGANIZATION_ADMIN, False, False),
        ("signer", "signer@quantum.defense.gov", User.Role.SIGNER, False, False),
        ("verifier", "verifier@quantumsecure.com", User.Role.VERIFIER, False, False),
        ("analyst", "analyst@quantum.defense.gov", User.Role.SECURITY_ANALYST, False, False),
    ]

    for uname, uemail, urole, is_staff_flag, is_super_flag in role_accounts:
        u_obj, _ = User.objects.get_or_create(
            username=uname,
            defaults={
                "email": uemail,
                "role": urole,
                "organization": org2 if urole == User.Role.VERIFIER else org,
                "is_staff": is_staff_flag,
                "is_superuser": is_super_flag,
                "status": User.AccountStatus.ACTIVE
            }
        )
        u_obj.set_password(default_pass)
        u_obj.status = User.AccountStatus.ACTIVE
        u_obj.failed_login_attempts = 0
        u_obj.lockout_until = None
        u_obj.save()
        print(f"  Role Account: {uname} (Role: {urole}, Password: {default_pass})")

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
    signer_user.set_password(signer_pass)
    signer_user.save()
    print(f"  User: signer_alice (Role: SIGNER, Password: {signer_pass}) ({'Created' if created else 'Exists'})")

    verifier_user, created = User.objects.get_or_create(
        username="verifier_bob",
        defaults={
            "email": "bob@quantumsecure.com",
            "role": User.Role.VERIFIER,
            "organization": org2,
            "department": "Verification Node 01",
            "first_name": "Bob",
            "last_name": "Smith"
        }
    )
    verifier_user.organization = org2
    verifier_user.first_name = "Bob"
    verifier_user.last_name = "Smith"
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

    # 5. Create Sample Signing Requests
    try:
        from apps.qds.models import SigningRequest
        bob = verifier_user
        alice = signer_user
        carol = analyst_user
        
        # Request 1
        SigningRequest.objects.get_or_create(
            request_id="REQ-021",
            defaults={
                "requester": bob,
                "signer": alice,
                "purpose": "Agreement",
                "payload_content": "SECURE_QUANTUM_INTEROP_PROTOCOL_AGREEMENT",
                "verifiers_count": 2,
                "status": "PENDING"
            }
        )
        # Request 2
        SigningRequest.objects.get_or_create(
            request_id="REQ-020",
            defaults={
                "requester": bob,
                "signer": alice,
                "purpose": "Contract",
                "payload_content": "DEFENSE_DEPT_ENTANGLED_GATEWAY_CONTRACT",
                "verifiers_count": 1,
                "status": "PENDING"
            }
        )
        # Request 3
        SigningRequest.objects.get_or_create(
            request_id="REQ-019",
            defaults={
                "requester": carol,
                "signer": alice,
                "purpose": "Document Sign",
                "payload_content": "CLASSIFIED_WEAPON_TEST_LOGS_MD5_VERIFICATION",
                "verifiers_count": 2,
                "status": "PENDING"
            }
        )
        print("  Created Sample Signing Requests for Signer Dashboard.")
        
        # 6. Seed Specific Verifier Dashboard Data (Bob Smith Workspace)
        print("  Seeding Verifier Workspace Data...")
        
        # Signer users from the table
        alice_johnson, _ = User.objects.get_or_create(
            username="alice_johnson",
            defaults={
                "email": "alice@quantumsecure.com",
                "role": User.Role.SIGNER,
                "organization": org2,
                "department": "Quantum Physics",
                "first_name": "Alice",
                "last_name": "Johnson"
            }
        )
        alice_johnson.set_password(signer_pass)
        alice_johnson.save()
        
        carol_white, _ = User.objects.get_or_create(
            username="carol_white",
            defaults={
                "email": "carol_w@quantumsecure.com",
                "role": User.Role.SIGNER,
                "organization": org2,
                "department": "Document Control",
                "first_name": "Carol",
                "last_name": "White"
            }
        )
        carol_white.set_password(signer_pass)
        carol_white.save()
        
        ethan_davis, _ = User.objects.get_or_create(
            username="ethan_davis",
            defaults={
                "email": "ethan@quantumsecure.com",
                "role": User.Role.SIGNER,
                "organization": org2,
                "department": "Key Management",
                "first_name": "Ethan",
                "last_name": "Davis"
            }
        )
        ethan_davis.set_password(signer_pass)
        ethan_davis.save()

        # Clear existing signatures and verifications to enforce exact dashboard counts
        from apps.verification.models import SignatureVerificationAttempt
        from apps.qds.models import QuantumDigitalSignature
        
        SignatureVerificationAttempt.objects.all().delete()
        QuantumDigitalSignature.objects.all().delete()
        
        import datetime
        from django.utils import timezone
        
        # Helper to generate dates
        def get_date(day_offset, hour, minute):
            return datetime.datetime(2025, 4, day_offset, hour, minute, tzinfo=datetime.timezone.utc)
            
        # Create QDS objects:
        sig_138 = QuantumDigitalSignature.objects.create(
            signature_id="QDS-138",
            sender=ethan_davis,
            recipient_organization=org2,
            message_payload="Financial Audit Log for Q2",
            message_digest="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            quantum_state_basis="|+>",
            bell_pair_type="PHI_PLUS",
            status="VERIFIED",
            is_consumed=True,
            consumed_at=get_date(21, 10, 20)
        )
        
        sig_139 = QuantumDigitalSignature.objects.create(
            signature_id="QDS-139",
            sender=alice_johnson,
            recipient_organization=org2,
            message_payload="Encrypted Communication Channel Key",
            message_digest="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
            quantum_state_basis="|->",
            bell_pair_type="PSI_PLUS",
            status="VERIFIED",
            is_consumed=True,
            consumed_at=get_date(21, 10, 30)
        )
        
        sig_140 = QuantumDigitalSignature.objects.create(
            signature_id="QDS-140",
            sender=carol_white,
            recipient_organization=org2,
            message_payload="Access Token for Quantum Node 3",
            message_digest="fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
            quantum_state_basis="|+>",
            bell_pair_type="PHI_PLUS",
            status="COMPROMISED",
            is_consumed=False
        )
        
        sig_141 = QuantumDigitalSignature.objects.create(
            signature_id="QDS-141",
            sender=alice_johnson,
            recipient_organization=org2,
            message_payload="Public Key Infrastructure Registration",
            message_digest="abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
            quantum_state_basis="|+i>",
            bell_pair_type="PHI_MINUS",
            status="VERIFIED",
            is_consumed=True,
            consumed_at=get_date(21, 10, 58)
        )
        
        sig_142 = QuantumDigitalSignature.objects.create(
            signature_id="QDS-142",
            sender=alice_johnson,
            recipient_organization=org2,
            message_payload="Quantum Key Distribution Policy Update",
            message_digest="9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef",
            quantum_state_basis="|+>",
            bell_pair_type="PHI_PLUS",
            status="VERIFIED",
            is_consumed=True,
            consumed_at=get_date(21, 11, 10)
        )

        # Create attempts
        v_252 = SignatureVerificationAttempt.objects.create(
            verification_id="VER-252",
            signature=sig_138,
            verifier=verifier_user,
            payload_provided="Financial Audit Log for Q2",
            hash_match=True,
            quantum_fidelity=0.9695,
            qber=0.0305,
            forgery_probability=0.012,
            threat_detected=False,
            verification_result="PASSED"
        )
        SignatureVerificationAttempt.objects.filter(id=v_252.id).update(created_at=get_date(21, 10, 20))
        
        v_253 = SignatureVerificationAttempt.objects.create(
            verification_id="VER-253",
            signature=sig_139,
            verifier=verifier_user,
            payload_provided="Encrypted Communication Channel Key",
            hash_match=True,
            quantum_fidelity=0.9788,
            qber=0.0212,
            forgery_probability=0.008,
            threat_detected=False,
            verification_result="PASSED"
        )
        SignatureVerificationAttempt.objects.filter(id=v_253.id).update(created_at=get_date(21, 10, 30))
        
        v_254 = SignatureVerificationAttempt.objects.create(
            verification_id="VER-254",
            signature=sig_140,
            verifier=verifier_user,
            payload_provided="Access Token for Quantum Node 3 (MODIFIED BY ATTACKER)",
            hash_match=True,
            quantum_fidelity=0.8755,
            qber=0.1245,
            forgery_probability=0.85,
            threat_detected=True,
            threat_category="FORGERY_DETECTION",
            verification_result="REJECTED_QUANTUM_THREAT"
        )
        SignatureVerificationAttempt.objects.filter(id=v_254.id).update(created_at=get_date(21, 10, 45))
        
        v_255 = SignatureVerificationAttempt.objects.create(
            verification_id="VER-255",
            signature=sig_141,
            verifier=verifier_user,
            payload_provided="Public Key Infrastructure Registration",
            hash_match=True,
            quantum_fidelity=0.9711,
            qber=0.0289,
            forgery_probability=0.011,
            threat_detected=False,
            verification_result="PASSED"
        )
        SignatureVerificationAttempt.objects.filter(id=v_255.id).update(created_at=get_date(21, 10, 58))
        
        v_256 = SignatureVerificationAttempt.objects.create(
            verification_id="VER-256",
            signature=sig_142,
            verifier=verifier_user,
            payload_provided="Quantum Key Distribution Policy Update",
            hash_match=True,
            quantum_fidelity=0.9769,
            qber=0.0231,
            forgery_probability=0.009,
            threat_detected=False,
            verification_result="PASSED"
        )
        SignatureVerificationAttempt.objects.filter(id=v_256.id).update(created_at=get_date(21, 11, 10))

        # Seed additional verifications to reach exactly 230 PASSED and 12 FAILED (Total 242 historical)
        # We also distribute them to generate the exact Verification Trend:
        # 15 Apr: 15
        # 16 Apr: 25
        # 17 Apr: 10
        # 18 Apr: 18
        # 19 Apr: 12
        # 20 Apr: 35
        # 21 Apr: 42 (including our 5 recent ones, so 37 more on 21 Apr)
        # Remaining: 242 - (15+25+10+18+12+35+42) = 242 - 157 = 85 attempts on 14 Apr or earlier
        
        trend_distribution = {
            14: 85,
            15: 15,
            16: 25,
            17: 10,
            18: 18,
            19: 12,
            20: 35,
            21: 37  # 37 historical + 5 specific = 42 total on 21 Apr
        }
        
        passed_needed = 230 - 4  # 226 needed
        failed_needed = 12 - 1   # 11 needed
        
        # We target an average QBER of exactly 3.21% across all 242 attempts.
        # Total QBER sum target = 242 * 0.03211 = 7.77062
        # QBER sum of 5 specific attempts = 0.0385 + 0.0210 + 0.1245 + 0.0289 + 0.0231 = 0.2360
        # QBER sum of 11 failed attempts: each has QBER = 1.0 - (0.85 - 0.01 * (i % 5))
        failed_qbers = [1.0 - (0.85 - 0.01 * (i % 5)) for i in range(failed_needed)]
        failed_qber_sum = sum(failed_qbers)
        
        passed_qber_sum_needed = 7.77062 - 0.2360 - failed_qber_sum
        passed_qber_each = passed_qber_sum_needed / passed_needed
        
        serial_num = 1
        failed_idx = 0
        for day, count in trend_distribution.items():
            for _ in range(count):
                is_passed = passed_needed > 0
                if is_passed:
                    passed_needed -= 1
                    v_res = "PASSED"
                    qber = passed_qber_each + 0.005 * ((serial_num % 4) - 1.5)
                    fidelity = 1.0 - qber
                    threat = False
                    category = ""
                else:
                    passed_needed -= 1 # Keep decrementing to end the loop balance
                    v_res = "REJECTED_QUANTUM_THREAT"
                    qber = failed_qbers[failed_idx % len(failed_qbers)]
                    failed_idx += 1
                    fidelity = 1.0 - qber
                    threat = True
                    category = "CHANNEL_NOISE_BREACH"
                    
                # Create a signature for this attempt
                dummy_sig = QuantumDigitalSignature.objects.create(
                    signature_id=f"QDS-DUMMY-{serial_num}",
                    sender=alice_johnson if serial_num % 2 == 0 else ethan_davis,
                    recipient_organization=org2,
                    message_payload=f"Payload {serial_num}",
                    message_digest="0123456789abcdef",
                    status="VERIFIED" if v_res == "PASSED" else "COMPROMISED",
                    is_consumed=(v_res == "PASSED")
                )
                
                attempt = SignatureVerificationAttempt.objects.create(
                    verification_id=f"VER-HIST-{serial_num}",
                    signature=dummy_sig,
                    verifier=verifier_user,
                    payload_provided=f"Payload {serial_num}",
                    hash_match=True,
                    quantum_fidelity=fidelity,
                    qber=qber,
                    forgery_probability=0.01 if v_res == "PASSED" else 0.75,
                    threat_detected=threat,
                    threat_category=category,
                    verification_result=v_res
                )
                SignatureVerificationAttempt.objects.filter(id=attempt.id).update(created_at=get_date(day, 10, 0))
                serial_num += 1
                
        # Seed exactly 14 pending verifications (QDS with status 'ISSUED')
        for i in range(14):
            QuantumDigitalSignature.objects.create(
                signature_id=f"QDS-PENDING-{i+1}",
                sender=alice_johnson if i % 2 == 0 else ethan_davis,
                recipient_organization=org2,
                message_payload=f"Pending Contract Agreement Document #{i+1}",
                message_digest="pending_hash_digest",
                status="ISSUED",
                is_consumed=False
            )
            
        print(f"  Successfully seeded: {QuantumDigitalSignature.objects.count()} signatures, {SignatureVerificationAttempt.objects.count()} attempts.")
    except Exception as e:
        print("Error seeding verification dashboard data:", e)

    print("=== Seed completed successfully! ===")

if __name__ == "__main__":
    run_seed()
