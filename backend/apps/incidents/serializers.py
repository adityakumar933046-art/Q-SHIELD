from rest_framework import serializers
from .models import SecurityIncident, InvestigationNote

class InvestigationNoteSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = InvestigationNote
        fields = ['id', 'incident', 'author', 'author_username', 'note', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']


class SecurityIncidentSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    signature_id = serializers.CharField(source='related_signature.signature_id', read_only=True)
    source_username = serializers.CharField(source='source_user.username', read_only=True)
    notes = InvestigationNoteSerializer(many=True, read_only=True)

    class Meta:
        model = SecurityIncident
        fields = '__all__'
