import hashlib
from rest_framework import serializers
from .models import QuantumDigitalSignature, SigningRequest

from apps.documents.serializers import DocumentSerializer

class QuantumDigitalSignatureSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_org_id = serializers.IntegerField(source='sender.organization.id', read_only=True)
    sender_org_name = serializers.CharField(source='sender.organization.name', read_only=True)
    recipient_org_name = serializers.CharField(source='recipient_organization.name', read_only=True)
    document_details = DocumentSerializer(source='document', read_only=True)

    class Meta:
        model = QuantumDigitalSignature
        fields = '__all__'
        read_only_fields = ('signature_id', 'sender', 'message_digest', 'quantum_execution_id', 'session_id', 'nonce', 'is_consumed', 'consumed_at', 'status', 'created_at', 'updated_at')

class CreateSignatureRequestSerializer(serializers.Serializer):
    payload_content = serializers.CharField(required=False, allow_blank=True, default='')
    document_id = serializers.UUIDField(required=False, allow_null=True)
    quantum_state_basis = serializers.ChoiceField(
        choices=['|0>', '|1>', '|+>', '|->', '|+i>', '|-i>'],
        default='|+>'
    )
    bell_pair_type = serializers.ChoiceField(
        choices=['PHI_PLUS', 'PHI_MINUS', 'PSI_PLUS', 'PSI_MINUS'],
        default='PHI_PLUS'
    )
    recipient_organization_id = serializers.IntegerField(required=False, allow_null=True)


class SigningRequestSerializer(serializers.ModelSerializer):
    requester_username = serializers.CharField(source='requester.username', read_only=True)
    signer_username = serializers.CharField(source='signer.username', read_only=True)
    signature_details = QuantumDigitalSignatureSerializer(source='signature', read_only=True)

    class Meta:
        model = SigningRequest
        fields = '__all__'
        read_only_fields = ('request_id', 'status', 'signature', 'created_at', 'updated_at')


class CreateSigningRequestSerializer(serializers.Serializer):
    signer_id = serializers.IntegerField(required=True)
    purpose = serializers.CharField(max_length=255, default='Document Sign')
    payload_content = serializers.CharField(required=True)
    verifiers_count = serializers.IntegerField(default=1)

