import uuid
from django.conf import settings
from django.utils import timezone
import datetime
from .models import ThresholdRule, ThreatEvaluationLog
from apps.incidents.models import SecurityIncident
from apps.audit.models import AuditTrailRecord
from apps.qds.models import QuantumDigitalSignature
from django.contrib.auth import get_user_model

User = get_user_model()

class ThreatDetectionService:
    """
    Non-Machine-Learning Deterministic Threat Detector for Q-SHIELD.
    Evaluates quantum & statistical metrics strictly against configured thresholds.
    """

    @classmethod
    def evaluate_threat(cls, analysis_data: dict, execution_context: dict = None) -> dict:
        execution_context = execution_context or {}
        qber = analysis_data.get('qber', 0.0)
        fidelity = analysis_data.get('fidelity', 1.0)
        forgery_prob = analysis_data.get('forgery_probability', 0.0)
        chi_p = analysis_data.get('chi_square', {}).get('p_value', 1.0)
        execution_id = analysis_data.get('execution_id', f"EXEC-{uuid.uuid4().hex[:8]}")

        # Active Threshold Limits
        qber_limit = getattr(settings, 'QBER_THRESHOLD', 0.11)
        fidelity_limit = getattr(settings, 'FIDELITY_THRESHOLD', 0.85)
        forgery_limit = getattr(settings, 'MAX_FORGERY_PROBABILITY_THRESHOLD', 0.05)
        chi_alpha = getattr(settings, 'CHI_SQUARE_ALPHA', 0.05)

        rules_triggered = []
        is_threat = False

        if qber > qber_limit:
            rules_triggered.append(f"Rule-QBER-01: QBER {qber:.4f} > {qber_limit}")
            is_threat = True

        if fidelity < fidelity_limit:
            rules_triggered.append(f"Rule-Fid-01: Fidelity {fidelity:.4f} < {fidelity_limit}")
            is_threat = True

        if forgery_prob > forgery_limit:
            rules_triggered.append(f"Rule-Forg-01: Forgery Prob {forgery_prob:.4f} > {forgery_limit}")
            is_threat = True

        if chi_p < chi_alpha:
            rules_triggered.append(f"Rule-Chi-01: Chi-Square p-value {chi_p:.4f} < {chi_alpha}")
            is_threat = True

        # Explicit Attack Context Overrides
        attack_type = execution_context.get('attack_type', '')
        if attack_type:
            is_threat = True
            rules_triggered.append(f"Simulated Attack Vector: {attack_type}")

        # Threat Categorization
        threat_cat = "SECURE"
        severity = "INFO"

        if is_threat:
            if attack_type == 'UNAUTHORIZED_VERIFICATION' or execution_context.get('unauthorized_attempt', False):
                threat_cat = "UNAUTHORIZED_VERIFICATION"
                severity = "CRITICAL"
            elif attack_type == 'REPLAY_ATTACK' or execution_context.get('is_replay', False):
                threat_cat = "REPLAY_ATTACK"
                severity = "HIGH"
            elif attack_type == 'IMPERSONATION':
                threat_cat = "SENDER_IMPERSONATION"
                severity = "HIGH"
            elif attack_type == 'FORGERY':
                threat_cat = "SIGNATURE_FORGERY"
                severity = "CRITICAL"
            elif attack_type == 'CHANNEL_MANIPULATION':
                threat_cat = "QUANTUM_CHANNEL_MANIPULATION"
                severity = "HIGH"
            elif fidelity < 0.70 and chi_p < 0.01:
                threat_cat = "SENDER_IMPERSONATION"
                severity = "HIGH"
            elif forgery_prob > 0.20 and qber > 0.20:
                threat_cat = "SIGNATURE_FORGERY"
                severity = "CRITICAL"
            elif qber > 0.11:
                threat_cat = "QUANTUM_CHANNEL_MANIPULATION"
                severity = "HIGH"
            else:
                threat_cat = "QUANTUM_ANOMALY_BREACH"
                severity = "MEDIUM"

        explanation = (
            f"Threat evaluation completed for {execution_id}. "
            f"Result: {threat_cat} (Severity: {severity}). Rules breached: {', '.join(rules_triggered) if rules_triggered else 'None'}."
        )

        eval_id = f"EVAL-{uuid.uuid4().hex[:12].upper()}"

        # Persist Evaluation Log
        ThreatEvaluationLog.objects.create(
            evaluation_id=eval_id,
            execution_id=execution_id,
            threat_detected=is_threat,
            threat_category=threat_cat,
            severity=severity,
            rule_triggered=", ".join(rules_triggered),
            qber_measured=qber,
            fidelity_measured=fidelity,
            forgery_probability=forgery_prob,
            chi_square_pvalue=chi_p,
            explanation=explanation
        )

        # Lookup related entities
        sig_obj = QuantumDigitalSignature.objects.filter(signature_id=execution_id).first()
        user_name = execution_context.get('user')
        src_user = User.objects.filter(username=user_name).first() if user_name else (sig_obj.sender if sig_obj else None)
        org_obj = sig_obj.sender.organization if (sig_obj and sig_obj.sender and sig_obj.sender.organization) else (src_user.organization if (src_user and src_user.organization) else None)

        incident_id = None
        if is_threat:
            # Check for duplicate recent unresolved incident (5 min window)
            recent_time = timezone.now() - datetime.timedelta(minutes=5)
            existing = SecurityIncident.objects.filter(
                category=threat_cat,
                status__in=['OPEN', 'INVESTIGATING'],
                created_at__gte=recent_time
            )
            if sig_obj:
                existing = existing.filter(related_signature=sig_obj)

            dup_inc = existing.first()
            if dup_inc:
                dup_inc.description += f" [Update {timezone.now().strftime('%H:%M:%S')}: {explanation}]"
                dup_inc.save()
                incident_id = dup_inc.incident_number
            else:
                evidence = {
                    'execution_id': execution_id,
                    'rules_breached': rules_triggered,
                    'qber': qber,
                    'fidelity': fidelity,
                    'forgery_probability': forgery_prob,
                    'chi_square_pvalue': chi_p,
                    'attack_context': execution_context,
                    'quantum_basis': sig_obj.quantum_state_basis if sig_obj else '|+>',
                    'bell_pair': sig_obj.bell_pair_type if sig_obj else 'PHI_PLUS',
                    'message_digest': sig_obj.message_digest if sig_obj else 'N/A'
                }

                inc = SecurityIncident.objects.create(
                    incident_number=f"INC-{uuid.uuid4().hex[:8].upper()}",
                    title=f"Security Anomaly: {threat_cat}",
                    category=threat_cat,
                    severity=severity,
                    status='OPEN',
                    classification='CONFIRMED_THREAT',
                    organization=org_obj,
                    related_signature=sig_obj,
                    source_user=src_user,
                    detection_source=execution_context.get('detection_source', 'QDS Verification Engine'),
                    qber=qber,
                    fidelity=fidelity,
                    forgery_probability=forgery_prob,
                    description=f"Automated threat detection alert for execution {execution_id}. {explanation}",
                    evidence_data=evidence
                )
                incident_id = inc.incident_number

                AuditTrailRecord.objects.create(
                    action_type='THREAT_DETECTED_INCIDENT_CREATED',
                    user_identifier=user_name or 'SYSTEM',
                    target_resource=execution_id,
                    status='ALERT',
                    details={
                        'incident_number': inc.incident_number,
                        'threat_category': threat_cat,
                        'severity': severity,
                        'rules': rules_triggered,
                        'organization_id': org_obj.id if org_obj else None
                    }
                )

        return {
            'evaluation_id': eval_id,
            'execution_id': execution_id,
            'threat_detected': is_threat,
            'threat_category': threat_cat,
            'severity': severity,
            'rules_triggered': rules_triggered,
            'qber_measured': qber,
            'fidelity_measured': fidelity,
            'forgery_probability': forgery_prob,
            'chi_square_pvalue': chi_p,
            'explanation': explanation,
            'incident_id': incident_id
        }
