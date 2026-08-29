import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qshield.settings')
django.setup()

from apps.qds.models import QuantumDigitalSignature
from apps.verification.models import SignatureVerificationAttempt
from apps.incidents.models import SecurityIncident

def reset_demo_data():
    print("==================================================")
    print("Q-SHIELD DEMO DATA RESET MECHANISM")
    print("==================================================")

    # 1. Reset Verification Attempts
    ver_count = SignatureVerificationAttempt.objects.count()
    SignatureVerificationAttempt.objects.all().delete()
    print(f"Cleared {ver_count} demo verification attempts.")

    # 2. Reset Quantum Digital Signatures
    qds_count = QuantumDigitalSignature.objects.count()
    QuantumDigitalSignature.objects.all().delete()
    print(f"Cleared {qds_count} demo QDS signature transactions.")

    # 3. Reset Security Incidents
    inc_count = SecurityIncident.objects.count()
    SecurityIncident.objects.all().delete()
    print(f"Cleared {inc_count} demo security incidents.")

    print("\nDemo environment reset completed successfully.")
    print("System organizations, seed users, and audit logs preserved.")

if __name__ == "__main__":
    reset_demo_data()
