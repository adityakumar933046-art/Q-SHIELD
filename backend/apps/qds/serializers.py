import hashlib
from rest_framework import serializers
from .models import QuantumDigitalSignature

class QuantumDigitalSignatureSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_org_id = serializers.IntegerField(source='sender.organization.id', read_only=True)
    sender_org_name = serializers.CharField(source='sender.organization.name', read_only=True)
    recipient_org_name = serializers.CharField(source='recipient_organization.name', read_only=True)

    class Meta:
        model = QuantumDigitalSignature
        fields = '__all__'
        read_only_fields = ('signature_id', 'sender', 'message_digest', 'quantum_execution_id', 'session_id', 'nonce', 'is_consumed', 'consumed_at', 'status', 'created_at', 'updated_at')

class CreateSignatureRequestSerializer(serializers.Serializer):
    payload_content = serializers.CharField(required=True)
    quantum_state_basis = serializers.ChoiceField(
        choices=['|0>', '|1>', '|+>', '|->', '|+i>', '|-i>'],
        default='|+>'
    )
    bell_pair_type = serializers.ChoiceField(
        choices=['PHI_PLUS', 'PHI_MINUS', 'PSI_PLUS', 'PSI_MINUS'],
        default='PHI_PLUS'
    )
    recipient_organization_id = serializers.IntegerField(required=False, allow_null=True)
