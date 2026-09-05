import uuid
from django.db import models
from django.conf import settings

class Document(models.Model):
    class FileType(models.TextChoices):
        PDF = 'PDF', 'PDF Document'
        DOCX = 'DOCX', 'Word Document'
        TXT = 'TXT', 'Text Document'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='documents'
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='uploaded_documents'
    )
    file = models.FileField(upload_to='documents/%Y/%m/%d/')
    original_filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=20, choices=FileType.choices)
    file_size = models.BigIntegerField(help_text="File size in bytes")
    sha256_hash = models.CharField(max_length=64, db_index=True, help_text="Cryptographic SHA-256 hash of original file bytes")
    reviewed_at = models.DateTimeField(null=True, blank=True, help_text="Timestamp when Signer confirmed document review")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Document {self.original_filename} ({self.file_type}) - SHA256: {self.sha256_hash[:8]}..."
