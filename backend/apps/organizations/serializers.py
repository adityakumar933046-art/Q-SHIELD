from rest_framework import serializers
from .models import Organization

class OrganizationSerializer(serializers.ModelSerializer):
    member_count = serializers.IntegerField(source='members.count', read_only=True)

    class Meta:
        model = Organization
        fields = ('id', 'name', 'domain', 'description', 'max_quantum_nodes', 'is_active', 'member_count', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
