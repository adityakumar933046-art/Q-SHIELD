import io
import hashlib
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.organizations.models import Organization
from apps.documents.models import Document
from apps.qds.models import QuantumDigitalSignature, SigningRequest
from apps.verification.models import SignatureVerificationAttempt
from apps.incidents.models import SecurityIncident

User = get_user_model()

class DocumentWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.org = Organization.objects.create(
            name="Defense Quantum Command",
            domain="quantum.defense.gov"
        )
        self.signer = User.objects.create_user(
            username="test_doc_signer",
            email="doc_signer@quantum.defense.gov",
            password="Password@123",
            role=User.Role.SIGNER,
            organization=self.org
        )
        self.verifier = User.objects.create_user(
            username="test_doc_verifier",
            email="doc_verifier@quantum.defense.gov",
            password="Password@123",
            role=User.Role.VERIFIER,
            organization=self.org
        )

    def test_document_upload_validation(self):
        self.client.force_authenticate(user=self.signer)

        # 1. Reject Executable (.exe)
        exe_file = SimpleUploadedFile("malware.exe", b"MZ_EXECUTABLE_HEADER_CONTENT", content_type="application/octet-stream")
        res = self.client.post('/api/documents/upload/', {'file': exe_file}, format='multipart')
        self.assertEqual(res.status_code, 400)
        self.assertIn("Executable file type", res.data['error'])

        # 2. Reject Empty File (0 bytes)
        empty_file = SimpleUploadedFile("empty.pdf", b"", content_type="application/pdf")
        res = self.client.post('/api/documents/upload/', {'file': empty_file}, format='multipart')
        self.assertEqual(res.status_code, 400)
        self.assertIn("File is empty", res.data['error'])

        # 3. Accept Valid PDF & Compute SHA-256
        pdf_bytes = b"%PDF-1.4 Test Quantum Security Agreement Document Content Bytes"
        pdf_file = SimpleUploadedFile("contract.pdf", pdf_bytes, content_type="application/pdf")
        res = self.client.post('/api/documents/upload/', {'file': pdf_file}, format='multipart')
        self.assertEqual(res.status_code, 201)
        doc_id = res.data['id']
        expected_hash = hashlib.sha256(pdf_bytes).hexdigest()
        self.assertEqual(res.data['sha256_hash'], expected_hash)
        self.assertEqual(res.data['file_type'], 'PDF')

    def test_full_document_sign_and_verification_workflow(self):
        self.client.force_authenticate(user=self.signer)

        # Step 1: Upload PDF Document
        pdf_bytes = b"%PDF-1.4 Classified Interoperability Agreement"
        pdf_file = SimpleUploadedFile("interop_agreement.pdf", pdf_bytes, content_type="application/pdf")
        upload_res = self.client.post('/api/documents/upload/', {'file': pdf_file}, format='multipart')
        self.assertEqual(upload_res.status_code, 201)
        doc_id = upload_res.data['id']
        doc_hash = upload_res.data['sha256_hash']

        # Step 2: Attempt Signing WITHOUT Review Confirmation (Should Fail)
        step_up_res = self.client.post('/api/auth/step-up/verify/', {'password': 'Password@123'})
        step_up_token = step_up_res.data['step_up_token']

        sign_attempt_1 = self.client.post('/api/qds/', {
            'document_id': doc_id,
            'verifier_id': self.verifier.id,
            'quantum_state_basis': '|+>',
            'bell_pair_type': 'PHI_PLUS'
        }, HTTP_X_STEP_UP_TOKEN=step_up_token)
        self.assertEqual(sign_attempt_1.status_code, 400)
        self.assertIn('error', sign_attempt_1.data)
        self.assertIn("Signer review confirmation required", sign_attempt_1.data['error'])

        # Step 3: Signer Confirms Document Review
        confirm_res = self.client.post(f'/api/documents/{doc_id}/confirm-review/', {'confirmed': True})
        self.assertEqual(confirm_res.status_code, 200)
        self.assertIsNotNone(confirm_res.data['reviewed_at'])

        # Step 4: Sign Document & Generate QDS
        step_up_res2 = self.client.post('/api/auth/step-up/verify/', {'password': 'Password@123'})
        step_up_token2 = step_up_res2.data['step_up_token']

        sign_res = self.client.post('/api/qds/', {
            'document_id': doc_id,
            'verifier_id': self.verifier.id,
            'quantum_state_basis': '|+>',
            'bell_pair_type': 'PHI_PLUS'
        }, HTTP_X_STEP_UP_TOKEN=step_up_token2)
        self.assertEqual(sign_res.status_code, 201)
        sig_id = sign_res.data['signature']['signature_id']
        self.assertEqual(sign_res.data['signature']['message_digest'], doc_hash)

        # Step 5: Verifier Executes Verification on Intact Document (Passed)
        self.client.force_authenticate(user=self.verifier)
        verify_res = self.client.post('/api/verification/verify-signature/', {
            'signature_id': sig_id,
            'payload_content': 'interop_agreement.pdf'
        })
        self.assertEqual(verify_res.status_code, 200)
        self.assertEqual(verify_res.data['verification_attempt']['verification_result'], 'PASSED')
        self.assertTrue(verify_res.data['verification_attempt']['hash_match'])

    def test_tampered_document_detection_and_threat_flow(self):
        # Step 1: Upload TXT Document
        self.client.force_authenticate(user=self.signer)
        txt_bytes = b"SECRET_QUANTUM_DISPATCH_LOGS_2026"
        txt_file = SimpleUploadedFile("logs.txt", txt_bytes, content_type="text/plain")
        upload_res = self.client.post('/api/documents/upload/', {'file': txt_file}, format='multipart')
        doc_id = upload_res.data['id']

        # Confirm review
        self.client.post(f'/api/documents/{doc_id}/confirm-review/', {'confirmed': True})

        # Generate QDS Signature
        step_up_res = self.client.post('/api/auth/step-up/verify/', {'password': 'Password@123'})
        sign_res = self.client.post('/api/qds/', {
            'document_id': doc_id,
            'verifier_id': self.verifier.id,
            'quantum_state_basis': '|+>',
            'bell_pair_type': 'PHI_PLUS'
        }, HTTP_X_STEP_UP_TOKEN=step_up_res.data['step_up_token'])
        self.assertEqual(sign_res.status_code, 201)
        sig_id = sign_res.data['signature']['signature_id']

        # Step 2: Verifier Executes Verification with Tampered Simulation
        self.client.force_authenticate(user=self.verifier)
        verify_tampered_res = self.client.post('/api/verification/verify-signature/', {
            'signature_id': sig_id,
            'payload_content': 'logs.txt',
            'simulate_tamper': True
        })
        self.assertEqual(verify_tampered_res.status_code, 200)
        attempt = verify_tampered_res.data['verification_attempt']
        self.assertEqual(attempt['verification_result'], 'REJECTED_DIGEST_MISMATCH')
        self.assertFalse(attempt['hash_match'])
        self.assertTrue(attempt['threat_detected'])

        # Step 3: Verify Security Incident Created for Security Analyst
        inc = SecurityIncident.objects.filter(related_signature__signature_id=sig_id).first()
        self.assertIsNotNone(inc)
        self.assertIn("FORGERY", inc.category)
