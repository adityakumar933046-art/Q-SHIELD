import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileKey2, Upload, FileText, CheckCircle2, AlertCircle, RefreshCw,
  Cpu, Lock, Send, Eye, ShieldCheck, FileCheck2, AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';
import { User, QuantumDigitalSignature, QuantumExecutionResult, DocumentItem } from '../../types';

interface CreateSignaturePageProps {
  currentUser: User | null;
}

export const CreateSignaturePage: React.FC<CreateSignaturePageProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'DOCUMENT' | 'RAW'>('DOCUMENT');

  // Document Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<DocumentItem | null>(null);

  // Signer Confirmation State
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Raw Message State
  const [rawMessage, setRawMessage] = useState('');

  // Verifier & Quantum Parameters
  const [verifiers, setVerifiers] = useState<any[]>([]);
  const [selectedVerifierId, setSelectedVerifierId] = useState<string>('');
  const [basis, setBasis] = useState('|+>');
  const [bellPair, setBellPair] = useState('PHI_PLUS');

  // Multi-Step Progress State
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Success Result State
  const [generatedSignature, setGeneratedSignature] = useState<QuantumDigitalSignature | null>(null);
  const [telemetryResult, setTelemetryResult] = useState<QuantumExecutionResult | null>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const FORBIDDEN_EXTS = ['.exe', '.bat', '.cmd', '.sh', '.bin', '.app', '.msi', '.py', '.js', '.vbs', '.ps1'];

  useEffect(() => {
    loadAvailableVerifiers();
  }, [currentUser]);

  const loadAvailableVerifiers = async () => {
    try {
      const list = await api.getAvailableVerifiers();
      setVerifiers(list);
      if (list.length > 0) {
        setSelectedVerifierId(list[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to load authorized verifiers:', err);
    }
  };

  const steps = [
    'Validating Document & File Integrity',
    'Generating Exact SHA-256 Cryptographic Digest',
    'Preparing Quantum Basis States (Pauli Eigenstates)',
    'Creating Bell-State Pair Entanglement',
    'Executing Quantum Teleportation Simulation',
    'Performing Bell State Measurement (BSM)',
    'Packaging Cryptographic QDS Signature',
    'Storing Record & Dispatching to Verifier',
  ];

  // File Upload Handler
  const handleFileUpload = async (file: File) => {
    setError(null);
    const filename = file.name;
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();

    // 1. Executable Blocking
    if (FORBIDDEN_EXTS.includes(ext)) {
      setError(`Security Violation: Executable file type '${ext}' is strictly prohibited.`);
      return;
    }

    // 2. Allowed File Type Check
    if (!['.pdf', '.docx', '.txt'].includes(ext)) {
      setError(`Unsupported file type '${ext}'. Please upload a PDF, DOCX, or TXT document.`);
      return;
    }

    // 3. File Size Validation
    if (file.size === 0) {
      setError('File is empty (0 bytes). Please select a valid document.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds maximum allowed limit of 10 MB.');
      return;
    }

    setSelectedFile(file);
    setUploading(true);
    setIsConfirmed(false);

    try {
      const doc = await api.uploadDocument(file);
      const docDetail = await api.getDocumentDetail(doc.id);
      setUploadedDoc(docDetail);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload document.');
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  // Signer Confirmation Handler
  const handleToggleConfirm = async (checked: boolean) => {
    if (!uploadedDoc) return;
    if (checked) {
      setConfirming(true);
      setError(null);
      try {
        const updated = await api.confirmDocumentReview(uploadedDoc.id);
        setUploadedDoc(updated);
        setIsConfirmed(true);
      } catch (err: any) {
        console.error('Confirmation error:', err);
        setError(err.response?.data?.error || 'Failed to confirm document review.');
        setIsConfirmed(false);
      } finally {
        setConfirming(false);
      }
    } else {
      setIsConfirmed(false);
    }
  };

  // Generate QDS Signature Handler
  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'DOCUMENT') {
      if (!uploadedDoc) {
        setError('Please upload a document to proceed.');
        return;
      }
      if (!uploadedDoc.reviewed_at && !isConfirmed) {
        setError('Signer review confirmation required! Please confirm that you have reviewed the document before generating a digital signature.');
        return;
      }
    } else {
      if (!rawMessage.trim()) {
        setError('Please enter a message payload.');
        return;
      }
    }

    if (!selectedVerifierId && verifiers.length > 0) {
      setError('Please select an authorized Verifier from your organization.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setActiveStep(0);

    try {
      let stepUpToken = '';
      try {
        const stepUpRes = await api.verifyStepUp();
        stepUpToken = stepUpRes.step_up_token;
      } catch (stepUpErr) {
        console.warn('Step-up token fallback:', stepUpErr);
      }

      for (let i = 0; i < steps.length; i++) {
        setActiveStep(i);
        await new Promise((r) => setTimeout(r, 200));
      }

      const verifierObj = verifiers.find((v) => v.id.toString() === selectedVerifierId);
      const payloadData: any = {
        quantum_state_basis: basis,
        bell_pair_type: bellPair,
        recipient_organization_id: currentUser?.organization || (verifierObj ? verifierObj.organization : null),
        verifier_id: selectedVerifierId,
        step_up_token: stepUpToken,
      };

      if (mode === 'DOCUMENT' && uploadedDoc) {
        payloadData.document_id = uploadedDoc.id;
      } else {
        payloadData.payload_content = rawMessage;
      }

      const headers: Record<string, string> = {};
      if (stepUpToken) {
        headers['X-Step-Up-Token'] = stepUpToken;
      }

      const res = await api.clientPost('/qds/', payloadData, { headers });

      const qdsRecord = res.data.signature || res.data;
      const qResult = res.data.quantum_teleportation_key || null;

      setGeneratedSignature(qdsRecord);
      setTelemetryResult(qResult);
      setIsGenerating(false);
    } catch (err: any) {
      console.error('Signature creation failed:', err);
      setIsGenerating(false);
      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          'Failed to generate QDS signature. Please try again.'
      );
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 max-w-5xl font-sans">
      {/* Header Banner */}
      <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#00C2FF]/10 border border-[#00C2FF]/30 rounded-xl text-[#00C2FF]">
            <FileKey2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Document Review & QDS Signature Workflow</h2>
            <p className="text-xs text-slate-400 font-sans">
              Upload PDF/DOCX/TXT, preview document, confirm review, compute SHA-256 hash, and generate quantum signature
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center bg-[#131E33] border border-[#1F2E4D] rounded-xl p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode('DOCUMENT')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              mode === 'DOCUMENT' ? 'bg-[#00C2FF] text-[#0B1220]' : 'text-slate-400 hover:text-white'
            }`}
          >
            Document Upload Mode
          </button>
          <button
            type="button"
            onClick={() => setMode('RAW')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              mode === 'RAW' ? 'bg-[#00C2FF] text-[#0B1220]' : 'text-slate-400 hover:text-white'
            }`}
          >
            Raw Text Payload
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-xl text-xs text-[#EF4444] font-sans flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Flow Views */}
      {!generatedSignature && !isGenerating ? (
        <form onSubmit={handleGenerateSubmit} className="space-y-6">
          {mode === 'DOCUMENT' ? (
            <>
              {/* STEP 1: DOCUMENT UPLOAD ZONE */}
              <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
                <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider flex items-center space-x-2 border-b border-[#1F2E4D] pb-3">
                  <Upload className="w-4 h-4 text-[#00C2FF]" />
                  <span>1. Upload Document (PDF, DOCX, TXT)</span>
                </h3>

                <div className="border-2 border-dashed border-[#1F2E4D] hover:border-[#00C2FF] rounded-2xl p-8 text-center transition bg-[#131E33]/30">
                  <input
                    type="file"
                    id="doc-file-input"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />

                  {uploading ? (
                    <div className="space-y-2">
                      <RefreshCw className="w-8 h-8 animate-spin text-[#00C2FF] mx-auto" />
                      <span className="text-xs text-white block">Processing file & computing SHA-256 hash...</span>
                    </div>
                  ) : uploadedDoc ? (
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-[#10B981]/10 border border-[#10B981]/30 rounded-2xl text-[#10B981] mx-auto flex items-center justify-center font-bold text-sm">
                        {uploadedDoc.file_type}
                      </div>
                      <div>
                        <span className="font-bold text-white text-sm block">{uploadedDoc.original_filename}</span>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          {formatBytes(uploadedDoc.file_size)} • Uploaded {new Date(uploadedDoc.created_at).toLocaleString()}
                        </span>
                      </div>
                      <label
                        htmlFor="doc-file-input"
                        className="inline-block px-3 py-1.5 bg-[#131E33] hover:bg-[#1F2E4D] text-[#00C2FF] text-xs font-bold rounded-lg border border-[#1F2E4D] cursor-pointer transition"
                      >
                        Change File
                      </label>
                    </div>
                  ) : (
                    <label htmlFor="doc-file-input" className="cursor-pointer space-y-3 block">
                      <div className="w-12 h-12 bg-[#00C2FF]/10 border border-[#00C2FF]/30 rounded-2xl text-[#00C2FF] mx-auto flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="font-bold text-white text-sm block">Click to Upload Document</span>
                        <span className="text-xs text-slate-400 block mt-1">
                          Supported Formats: <strong>PDF, DOCX, TXT</strong> (Max 10 MB)
                        </span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* STEP 2: IN-BROWSER DOCUMENT PREVIEW & METADATA */}
              {uploadedDoc && (
                <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
                  <div className="flex items-center justify-between border-b border-[#1F2E4D] pb-3">
                    <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-purple-400" />
                      <span>2. Document Preview & Metadata</span>
                    </h3>
                    <span className="text-xs font-bold text-[#10B981] px-2.5 py-0.5 bg-[#10B981]/10 border border-[#10B981]/30 rounded-full">
                      SHA-256 Computed
                    </span>
                  </div>

                  {/* Document Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
                    <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase block">Filename</span>
                      <span className="font-bold text-white truncate block">{uploadedDoc.original_filename}</span>
                    </div>

                    <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase block">File Type & Size</span>
                      <span className="font-bold text-purple-400 block">
                        {uploadedDoc.file_type} ({formatBytes(uploadedDoc.file_size)})
                      </span>
                    </div>

                    <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl space-y-1 lg:col-span-2">
                      <span className="text-slate-400 text-[10px] uppercase block">Original SHA-256 Hash Digest</span>
                      <span className="font-bold text-[#00C2FF] text-[11px] block break-all">{uploadedDoc.sha256_hash}</span>
                    </div>
                  </div>

                  {/* In-Browser Document Viewer */}
                  <div>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      In-Browser Document Content Viewer
                    </span>

                    {uploadedDoc.file_type === 'PDF' && uploadedDoc.file_url ? (
                      <div className="bg-[#131E33] border border-[#1F2E4D] rounded-xl p-2 h-96 overflow-hidden">
                        <iframe
                          src={uploadedDoc.file_url}
                          title="PDF Document Preview"
                          className="w-full h-full rounded-lg border-0"
                        />
                      </div>
                    ) : (
                      <div className="p-4 bg-[#131E33] border border-[#1F2E4D] rounded-xl text-slate-200 text-xs font-mono max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                        {uploadedDoc.preview_content || 'No text preview available.'}
                      </div>
                    )}
                  </div>

                  {/* STEP 3: SIGNER EXPLICIT REVIEW CONFIRMATION */}
                  <div className="p-4 bg-[#131E33] border border-purple-500/30 rounded-xl space-y-3">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="signer-review-checkbox"
                        checked={isConfirmed || !!uploadedDoc.reviewed_at}
                        disabled={confirming}
                        onChange={(e) => handleToggleConfirm(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-[#00C2FF] rounded cursor-pointer"
                      />
                      <label htmlFor="signer-review-checkbox" className="text-xs text-white font-sans font-semibold cursor-pointer">
                        I confirm that I have reviewed the document content and approve generating its Quantum Digital Signature.
                      </label>
                    </div>

                    {uploadedDoc.reviewed_at && (
                      <div className="text-[11px] text-[#10B981] font-sans font-bold flex items-center space-x-1.5 pl-7">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          Review Confirmed at {new Date(uploadedDoc.reviewed_at).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* RAW TEXT PAYLOAD MODE */
            <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider flex items-center space-x-2 border-b border-[#1F2E4D] pb-3">
                <FileText className="w-4 h-4 text-[#00C2FF]" />
                <span>Message Payload Input</span>
              </h3>

              <textarea
                rows={5}
                required
                value={rawMessage}
                onChange={(e) => setRawMessage(e.target.value)}
                placeholder="Enter transaction document text or payload message..."
                className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C2FF] font-sans leading-relaxed"
              />
            </div>
          )}

          {/* STEP 4: VERIFIER ASSIGNMENT & QUANTUM PARAMETERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider flex items-center space-x-2 border-b border-[#1F2E4D] pb-3">
                <Send className="w-4 h-4 text-purple-400" />
                <span>Assign Authorized Verifier</span>
              </h3>

              <div>
                <label className="block text-[11px] font-sans font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Verifier in {currentUser?.organization_name || 'Organization'} *
                </label>
                {verifiers.length === 0 ? (
                  <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl text-xs font-sans text-slate-400">
                    Loading verifiers...
                  </div>
                ) : (
                  <select
                    value={selectedVerifierId}
                    onChange={(e) => setSelectedVerifierId(e.target.value)}
                    className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C2FF] font-sans"
                  >
                    {verifiers.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.first_name ? `${v.first_name} ${v.last_name || ''}` : v.username} ({v.email || 'verifier@org.gov'})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider flex items-center space-x-2 border-b border-[#1F2E4D] pb-3">
                <Cpu className="w-4 h-4 text-[#10B981]" />
                <span>Quantum Teleportation Settings</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 font-sans text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Basis State
                  </label>
                  <select
                    value={basis}
                    onChange={(e) => setBasis(e.target.value)}
                    className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#10B981]"
                  >
                    <option value="|+>">|+⟩ Basis</option>
                    <option value="|->">|-⟩ Basis</option>
                    <option value="|0>">|0⟩ Basis</option>
                    <option value="|1>">|1⟩ Basis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Bell Pair Type
                  </label>
                  <select
                    value={bellPair}
                    onChange={(e) => setBellPair(e.target.value)}
                    className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#10B981]"
                  >
                    <option value="PHI_PLUS">|Φ+⟩ Bell Pair</option>
                    <option value="PHI_MINUS">|Φ-⟩ Bell Pair</option>
                    <option value="PSI_PLUS">|Ψ+⟩ Bell Pair</option>
                    <option value="PSI_MINUS">|Ψ-⟩ Bell Pair</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={mode === 'DOCUMENT' ? (!uploadedDoc || (!uploadedDoc.reviewed_at && !isConfirmed)) : !rawMessage.trim()}
              className="px-6 py-3 bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-bold text-xs font-sans uppercase tracking-wider rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
            >
              <FileKey2 className="w-4 h-4" />
              <span>Generate QDS Signature</span>
            </button>
          </div>
        </form>
      ) : isGenerating ? (
        /* Progress Indicator View */
        <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-8 shadow-2xl backdrop-blur-md space-y-6 text-center font-sans">
          <div className="p-4 bg-[#00C2FF]/10 border border-[#00C2FF]/30 rounded-2xl text-[#00C2FF] w-16 h-16 mx-auto flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">Quantum-Inspired QDS Generation in Progress</h3>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Executing teleportation-based Pauli eigenstate simulation...
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-2 text-left font-sans text-xs">
            {steps.map((stepName, index) => {
              const isDone = index < activeStep;
              const isCurrent = index === activeStep;
              return (
                <div
                  key={stepName}
                  className={`p-2.5 rounded-xl border transition flex items-center justify-between ${
                    isDone
                      ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                      : isCurrent
                      ? 'bg-[#00C2FF]/15 border-[#00C2FF] text-[#00C2FF] font-bold'
                      : 'bg-[#131E33]/40 border-[#1F2E4D]/40 text-slate-500'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] shrink-0 font-bold">
                      {index + 1}
                    </span>
                    <span>{stepName}</span>
                  </div>
                  {isDone && <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />}
                  {isCurrent && <RefreshCw className="w-4 h-4 animate-spin text-[#00C2FF] shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Success Result View */
        <div className="bg-[#0B1220] border border-[#10B981]/40 rounded-2xl p-8 shadow-2xl backdrop-blur-md space-y-6 font-sans">
          <div className="flex items-center space-x-4 border-b border-[#1F2E4D] pb-6">
            <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-2xl text-[#10B981]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-sans font-bold text-[#10B981] uppercase tracking-widest block">
                QDS Generation Complete
              </span>
              <h3 className="text-xl font-bold text-white">Quantum-Inspired Signature Generated Successfully</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
            <div className="p-4 bg-[#131E33] border border-[#1F2E4D] rounded-xl space-y-2">
              <span className="text-slate-400 block text-[10px] uppercase">Signature ID</span>
              <span className="font-bold text-[#00C2FF] text-sm block">{generatedSignature?.signature_id}</span>
            </div>

            <div className="p-4 bg-[#131E33] border border-[#1F2E4D] rounded-xl space-y-2">
              <span className="text-slate-400 block text-[10px] uppercase">Lifecycle Status</span>
              <span className="font-bold text-amber-400 text-xs block">PENDING_VERIFICATION</span>
            </div>

            <div className="p-4 bg-[#131E33] border border-[#1F2E4D] rounded-xl space-y-2 md:col-span-2">
              <span className="text-slate-400 block text-[10px] uppercase">Original File SHA-256 Hash Digest</span>
              <span className="font-bold text-slate-200 text-xs block break-all">{generatedSignature?.message_digest}</span>
            </div>
          </div>

          <div className="p-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-xs font-sans text-[#10B981] flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>
              Document signature package assigned and dispatched to Verifier for organization verification.
            </span>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-[#1F2E4D]">
            <button
              onClick={() => {
                setGeneratedSignature(null);
                setUploadedDoc(null);
                setSelectedFile(null);
                setIsConfirmed(false);
                setRawMessage('');
              }}
              className="px-4 py-2.5 bg-[#131E33] hover:bg-[#1F2E4D] text-slate-300 font-sans font-bold text-xs rounded-xl border border-[#1F2E4D] transition"
            >
              Sign Another Document
            </button>
            <Link
              to={`/signer/signatures/${generatedSignature?.signature_id}`}
              className="px-5 py-2.5 bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-bold font-sans text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View Signature Details</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
