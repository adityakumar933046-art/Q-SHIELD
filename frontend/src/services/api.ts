import axios from 'axios';
import {
  User,
  Organization,
  QuantumExecutionResult,
  StatisticalAnalysis,
  ThreatEvaluation,
  QuantumDigitalSignature,
  SignatureVerificationAttempt,
  SecurityIncident,
  AuditTrailRecord,
  ThresholdRule,
  AnalyticsSummary
} from '../types';

const API_BASE_URL = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT Token Interceptor if available in localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('qshield_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth & User Management API
  login: async (username: string, password: string) => {
    const res = await apiClient.post('/auth/login/', { username, password });
    if (res.data.access) {
      localStorage.setItem('qshield_token', res.data.access);
      localStorage.setItem('qshield_refresh', res.data.refresh);
    }
    return res.data;
  },
  logout: async () => {
    const refresh = localStorage.getItem('qshield_refresh');
    if (refresh) {
      try {
        await apiClient.post('/auth/logout/', { refresh });
      } catch (e) {
        console.log('Logout API call exception:', e);
      }
    }
    localStorage.removeItem('qshield_token');
    localStorage.removeItem('qshield_refresh');
  },
  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me/');
    return res.data;
  },
  getUsers: async (): Promise<User[]> => {
    const res = await apiClient.get('/auth/users/');
    return res.data.results || res.data;
  },
  createUser: async (userData: {
    username: string;
    email: string;
    password: string;
    confirm_password?: string;
    first_name?: string;
    last_name?: string;
    role: string;
    organization?: number | null;
    is_active?: boolean;
  }): Promise<User> => {
    const res = await apiClient.post('/auth/users/', userData);
    return res.data;
  },
  updateUser: async (id: number, userData: Partial<User> & { password?: string }): Promise<User> => {
    const res = await apiClient.patch(`/auth/users/${id}/`, userData);
    return res.data;
  },
  deleteUser: async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/auth/users/${id}/`);
    return res.data;
  },

  // Organizations
  getOrganizations: async (): Promise<Organization[]> => {
    const res = await apiClient.get('/organizations/');
    return res.data.results || res.data;
  },

  // Analytics
  getAnalyticsSummary: async (): Promise<AnalyticsSummary> => {
    const res = await apiClient.get('/analytics/summary/');
    return res.data;
  },

  // Quantum Engine
  runTeleportation: async (params: {
    input_state_symbol: string;
    bell_state_type: string;
    shots?: number;
    channel_noise?: number;
    bsm_tamper?: boolean;
    forgery?: boolean;
    fake_state?: string;
  }): Promise<QuantumExecutionResult> => {
    const res = await apiClient.post('/quantum-engine/run-teleportation/', params);
    return res.data;
  },

  // QDS Signatures
  createSignature: async (params: {
    payload_content: string;
    quantum_state_basis: string;
    bell_pair_type: string;
  }): Promise<{ signature: QuantumDigitalSignature; quantum_teleportation_key: QuantumExecutionResult }> => {
    const res = await apiClient.post('/qds/', params);
    return res.data;
  },
  getSignatures: async (): Promise<QuantumDigitalSignature[]> => {
    const res = await apiClient.get('/qds/');
    return res.data.results || res.data;
  },

  // Verification
  verifySignature: async (params: {
    signature_id: string;
    payload_content: string;
    simulated_noise?: number;
    inject_attack?: string;
  }): Promise<{
    verification_attempt: SignatureVerificationAttempt;
    quantum_execution: QuantumExecutionResult;
    statistical_analysis: StatisticalAnalysis;
    threat_evaluation: ThreatEvaluation;
  }> => {
    const res = await apiClient.post('/verification/verify-signature/', params);
    return res.data;
  },
  getVerifications: async (): Promise<SignatureVerificationAttempt[]> => {
    const res = await apiClient.get('/verification/');
    return res.data.results || res.data;
  },

  // Attack Simulator
  simulateAttack: async (params: {
    attack_vector: string;
    intensity: number;
    shots: number;
  }): Promise<{
    simulation_id: string;
    attack_vector: string;
    intensity: number;
    quantum_execution: QuantumExecutionResult;
    statistical_analysis: StatisticalAnalysis;
    threat_detection: ThreatEvaluation;
  }> => {
    const res = await apiClient.post('/attack-simulator/simulate/', params);
    return res.data;
  },
  getAttackSimulations: async () => {
    const res = await apiClient.get('/attack-simulator/');
    return res.data.results || res.data;
  },

  // Threat Detection & Rules
  getThresholdRules: async (): Promise<ThresholdRule[]> => {
    const res = await apiClient.get('/threats/rules/');
    return res.data.results || res.data;
  },
  getThreatEvaluations: async (): Promise<ThreatEvaluation[]> => {
    const res = await apiClient.get('/threats/evaluations/');
    return res.data.results || res.data;
  },

  // Incidents
  getIncidents: async (): Promise<SecurityIncident[]> => {
    const res = await apiClient.get('/incidents/');
    return res.data.results || res.data;
  },
  updateIncidentStatus: async (id: number, status: string, notes: string) => {
    const res = await apiClient.patch(`/incidents/${id}/`, { status, resolution_notes: notes });
    return res.data;
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditTrailRecord[]> => {
    const res = await apiClient.get('/audit/');
    return res.data.results || res.data;
  },

  // Signer Dashboard & Signing Requests API
  getSigningRequests: async (): Promise<any[]> => {
    const res = await apiClient.get('/qds/requests/');
    return res.data.results || res.data;
  },
  createSigningRequest: async (params: {
    signer_id: number;
    purpose: string;
    payload_content: string;
    verifiers_count?: number;
  }): Promise<any> => {
    const res = await apiClient.post('/qds/requests/', params);
    return res.data;
  },
  signRequest: async (
    requestId: number | string,
    params: {
      quantum_state_basis: string;
      bell_pair_type: string;
    }
  ): Promise<any> => {
    const res = await apiClient.post(`/qds/requests/${requestId}/sign/`, params);
    return res.data;
  },
  rejectRequest: async (requestId: number | string): Promise<any> => {
    const res = await apiClient.post(`/qds/requests/${requestId}/reject/`);
    return res.data;
  },
  getSignerDashboardStats: async (): Promise<any> => {
    const res = await apiClient.get('/qds/dashboard-stats/');
    return res.data;
  },
  getVerifierDashboardStats: async (): Promise<any> => {
    const res = await apiClient.get('/verification/dashboard-stats/');
    return res.data;
  }
};

