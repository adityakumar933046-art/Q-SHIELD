from rest_framework import serializers
from .models import SignatureVerificationAttempt

class SignatureVerificationAttemptSerializer(serializers.ModelSerializer):
    verifier_username = serializers.CharField(source='verifier.username', read_only=True)
    signature_id = serializers.CharField(source='signature.signature_id', read_only=True)
    signer_username = serializers.CharField(source='signature.sender.username', read_only=True)
    signer_full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SignatureVerificationAttempt
        fields = '__all__'

    def get_signer_full_name(self, obj):
        if obj.signature and obj.signature.sender:
            sender = obj.signature.sender
            first = sender.first_name
            last = sender.last_name
            if first or last:
                return f"{first} {last}".strip()
            return sender.username
        return "Unknown"

class VerifySignatureRequestSerializer(serializers.Serializer):
    signature_id = serializers.CharField(required=True)
    payload_content = serializers.CharField(required=True)
    simulated_noise = serializers.FloatField(default=0.0, min_value=0.0, max_value=1.0)
    inject_attack = serializers.ChoiceField(
        choices=['NONE', 'FORGERY', 'IMPERSONATION', 'REPLAY', 'CHANNEL_MANIPULATION', 'UNAUTHORIZED'],
        default='NONE'
    )
