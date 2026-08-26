export interface Signature {
  id: string;
  signature_id: string;
  signer_id: string;
  message_reference: string;
  signature_data?: Record<string, any>;
  status: 'CREATED' | 'ACTIVE' | 'VERIFIED' | 'REJECTED' | 'EXPIRED' | 'REVOKED';
  created_at: string;
  updated_at?: string;
}

export interface QDSSignRequest {
  message: string;
}
