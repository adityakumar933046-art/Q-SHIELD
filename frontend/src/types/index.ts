export type UserRole = 'ADMIN' | 'SIGNER' | 'VERIFIER' | 'SECURITY_ANALYST';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  organization: number | null;
  organization_name?: string;
  department: string;
  is_mfa_enabled: boolean;
  is_active?: boolean;
  created_at?: string;
}

export interface Organization {
  id: number;
  name: string;
  domain: string;
  description: string;
  max_quantum_nodes: number;
  is_active: boolean;
  member_count: number;
}

export interface QuantumExecutionResult {
  execution_id: string;
  shots: number;
  input_state_symbol: string;
  bell_state_type: string;
  fidelity: number;
  trace_distance: number;
  measurement_counts: Record<string, number>;
  statevector_real: number[];
  statevector_imag: number[];
  qber: number;
  attack_injected: boolean;
}

export interface ChiSquareResult {
  chi2_stat: number;
  p_value: number;
  degrees_of_freedom: number;
  hypothesis_rejected: boolean;
  alpha_threshold: number;
}

export interface SPRTResult {
  log_likelihood_ratio: number;
  upper_bound_A: number;
  lower_bound_B: number;
  decision: string;
}

export interface StatisticalAnalysis {
  record_id: string;
  execution_id: string;
  shots: number;
  qber: number;
  fidelity: number;
  chi_square: ChiSquareResult;
  forgery_probability: number;
  sprt: SPRTResult;
}

export interface ThreatEvaluation {
  evaluation_id: string;
  execution_id: string;
  threat_detected: boolean;
  threat_category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  rules_triggered: string[];
  qber_measured: number;
  fidelity_measured: number;
  forgery_probability: number;
  chi_square_pvalue: number;
  explanation: string;
  incident_id?: string;
}

export interface QuantumDigitalSignature {
  id: number;
  signature_id: string;
  sender_username: string;
  sender_org_name?: string;
  recipient_org_name?: string;
  message_payload: string;
  message_digest: string;
  payload_summary: string;
  quantum_state_basis: string;
  bell_pair_type: string;
  quantum_execution_id: string;
  session_id: string;
  nonce: string;
  is_consumed: boolean;
  consumed_at?: string;
  status: 'ISSUED' | 'VERIFIED' | 'COMPROMISED' | 'EXPIRED';
  created_at: string;
}

export interface SignatureVerificationAttempt {
  id: number;
  verification_id: string;
  signature_id: string;
  verifier_username: string;
  payload_provided: string;
  hash_match: boolean;
  quantum_fidelity: number;
  qber: number;
  forgery_probability: number;
  threat_detected: boolean;
  threat_category: string;
  verification_result: 'PASSED' | 'REJECTED_DIGEST_MISMATCH' | 'REJECTED_QUANTUM_THREAT' | 'REJECTED_REPLAY_ATTACK' | 'UNAUTHORIZED';
  created_at: string;
}

export interface SecurityIncident {
  id: number;
  incident_number: string;
  title: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED' | 'FALSE_POSITIVE';
  qber: number;
  fidelity: number;
  forgery_probability: number;
  description: string;
  assigned_to_username?: string;
  resolution_notes: string;
  created_at: string;
}

export interface AuditTrailRecord {
  id: number;
  action_type: string;
  user_identifier: string;
  target_resource: string;
  status: string;
  details: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface ThresholdRule {
  id: number;
  rule_name: string;
  metric_type: string;
  operator: string;
  threshold_value: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  is_active: boolean;
  description: string;
}

export interface AnalyticsSummary {
  signatures: {
    total: number;
    issued: number;
    verified: number;
    compromised: number;
  };
  verifications: {
    total: number;
  };
  incidents: {
    total: number;
    open: number;
    critical: number;
  };
  quantum_telemetry: {
    system_avg_qber: number;
    system_avg_fidelity: number;
    qber_threshold: number;
    fidelity_threshold: number;
  };
  qber_timeline: Array<{
    time: string;
    qber: number;
    fidelity: number;
    threshold: number;
  }>;
  threat_category_breakdown: Array<{
    category: string;
    count: number;
  }>;
}
