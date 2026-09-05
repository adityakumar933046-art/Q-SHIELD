import os
import hashlib
import zipfile
import xml.etree.ElementTree as ET
from django.utils import timezone
from django.http import FileResponse, Http404, HttpResponse
from rest_framework import views, status, permissions, generics
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Document
from .serializers import DocumentSerializer, DocumentUploadSerializer
from apps.audit.models import AuditTrailRecord

# Forbidden Executable File Extensions
FORBIDDEN_EXTENSIONS = {
    '.exe', '.bat', '.cmd', '.sh', '.bin', '.app', '.msi', '.com',
    '.py', '.js', '.vbs', '.ps1', '.jar', '.scr', '.pif', '.hta'
}

# Allowed Document File Extensions & Mappings
ALLOWED_EXTENSIONS = {
    '.pdf': Document.FileType.PDF,
    '.docx': Document.FileType.DOCX,
    '.txt': Document.FileType.TXT
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit


class DocumentUploadView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'error': 'No file uploaded. Please select a valid document.'}, status=status.HTTP_400_BAD_REQUEST)

        filename = uploaded_file.name
        ext = os.path.splitext(filename)[1].lower()

        # 1. Reject Forbidden Executables
        if ext in FORBIDDEN_EXTENSIONS:
            return Response({
                'error': f"Security Violation: Executable file type '{ext}' is strictly prohibited."
            }, status=status.HTTP_400_BAD_REQUEST)

        # 2. Validate Allowed File Extension
        if ext not in ALLOWED_EXTENSIONS:
            return Response({
                'error': f"Unsupported file extension '{ext}'. Only PDF, DOCX, and TXT documents are allowed."
            }, status=status.HTTP_400_BAD_REQUEST)

        # 3. Check Empty File
        if uploaded_file.size == 0:
            return Response({'error': 'File is empty (0 bytes). Please upload a valid document.'}, status=status.HTTP_400_BAD_REQUEST)

        # 4. Check Maximum File Size
        if uploaded_file.size > MAX_FILE_SIZE:
            return Response({'error': 'File size exceeds maximum allowed limit of 10 MB.'}, status=status.HTTP_400_BAD_REQUEST)

        # 5. Read Original File Bytes & Compute Cryptographic SHA-256 Hash
        file_bytes = uploaded_file.read()
        uploaded_file.seek(0)
        sha256_hash = hashlib.sha256(file_bytes).hexdigest()

        file_type = ALLOWED_EXTENSIONS[ext]

        # 6. Organization Context Isolation
        user = request.user
        org = user.organization
        if not org:
            return Response({'error': 'User must belong to an active organization to upload documents.'}, status=status.HTTP_400_BAD_REQUEST)

        document = Document.objects.create(
            organization=org,
            uploaded_by=user,
            file=uploaded_file,
            original_filename=filename,
            file_type=file_type,
            file_size=uploaded_file.size,
            sha256_hash=sha256_hash
        )

        AuditTrailRecord.objects.create(
            user_identifier=user.username,
            action_type='DOCUMENT_UPLOADED',
            target_resource=str(document.id),
            details={
                'filename': filename,
                'file_type': file_type,
                'file_size': uploaded_file.size,
                'sha256_hash': sha256_hash,
                'organization_id': org.id
            }
        )

        serializer = DocumentSerializer(document, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DocumentListView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = DocumentSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.organization:
            return Document.objects.none()
        return Document.objects.filter(organization=user.organization)


class DocumentDetailView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, pk):
        try:
            document = Document.objects.get(pk=pk)
        except Document.DoesNotExist:
            return Response({'error': 'Document not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Organization Scope Check
        if document.organization != request.user.organization:
            return Response({'error': 'Unauthorized access to document outside your organization.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = DocumentSerializer(document, context={'request': request})
        data = serializer.data

        # Extract Document Preview Content
        preview_content = ""
        try:
            document.file.open('rb')
            content_bytes = document.file.read()
            document.file.close()

            if document.file_type == Document.FileType.TXT:
                preview_content = content_bytes.decode('utf-8', errors='replace')[:50000]
            elif document.file_type == Document.FileType.DOCX:
                preview_content = self._extract_docx_text(document.file.path)
            elif document.file_type == Document.FileType.PDF:
                preview_content = f"PDF In-Browser Interactive Viewer active for {document.original_filename}."
        except Exception as e:
            preview_content = f"[Unable to extract text preview: {str(e)}]"

        data['preview_content'] = preview_content
        return Response(data, status=status.HTTP_200_OK)

    def _extract_docx_text(self, file_path):
        try:
            import docx
            doc = docx.Document(file_path)
            full_text = [p.text for p in doc.paragraphs if p.text]
            return "\n".join(full_text)[:50000]
        except Exception:
            # Fallback to XML zip extraction
            try:
                with zipfile.ZipFile(file_path) as z:
                    xml_content = z.read('word/document.xml')
                    tree = ET.fromstring(xml_content)
                    texts = []
                    for elem in tree.iter():
                        if elem.tag.endswith('t') and elem.text:
                            texts.append(elem.text)
                    return " ".join(texts)[:50000]
            except Exception as ex:
                return f"[DOCX text extraction error: {str(ex)}]"


class DocumentDownloadView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, pk):
        try:
            document = Document.objects.get(pk=pk)
        except Document.DoesNotExist:
            raise Http404("Document not found.")

        # Organization Scope Check
        if document.organization != request.user.organization:
            return Response({'error': 'Unauthorized access.'}, status=status.HTTP_403_FORBIDDEN)

        content_types = {
            'PDF': 'application/pdf',
            'DOCX': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'TXT': 'text/plain; charset=utf-8'
        }
        content_type = content_types.get(document.file_type, 'application/octet-stream')
        
        response = FileResponse(document.file.open('rb'), content_type=content_type)
        response['Content-Disposition'] = f'inline; filename="{document.original_filename}"'
        return response


class DocumentConfirmReviewView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            document = Document.objects.get(pk=pk)
        except Document.DoesNotExist:
            return Response({'error': 'Document not found.'}, status=status.HTTP_404_NOT_FOUND)

        if document.organization != request.user.organization:
            return Response({'error': 'Unauthorized document access.'}, status=status.HTTP_403_FORBIDDEN)

        confirmed = request.data.get('confirmed', False)
        if not confirmed:
            return Response({'error': 'Signer explicit review confirmation required.'}, status=status.HTTP_400_BAD_REQUEST)

        document.reviewed_at = timezone.now()
        document.save(update_fields=['reviewed_at', 'updated_at'])

        AuditTrailRecord.objects.create(
            user_identifier=request.user.username,
            action_type='DOCUMENT_REVIEW_CONFIRMED',
            target_resource=str(document.id),
            details={
                'filename': document.original_filename,
                'reviewed_at': document.reviewed_at.isoformat(),
                'signer': request.user.username
            }
        )

        serializer = DocumentSerializer(document, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
