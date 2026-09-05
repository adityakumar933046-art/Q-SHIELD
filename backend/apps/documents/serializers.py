from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_username = serializers.CharField(source='uploaded_by.username', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id',
            'organization',
            'organization_name',
            'uploaded_by',
            'uploaded_by_username',
            'original_filename',
            'file_type',
            'file_size',
            'sha256_hash',
            'reviewed_at',
            'file_url',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'organization', 'uploaded_by', 'sha256_hash', 'created_at', 'updated_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

class DocumentUploadSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)
