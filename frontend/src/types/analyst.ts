export interface QuantumTelemetry {
  timestamp: string;
  qber: number; // Quantum Bit Error Rate (e.g., 0.14)
  fidelity: number; // State fidelity F(rho, sigma) [0 to 1]
  threshold: number; // Shor-Preskill noise bound (0.11)
  sprtLlr: number; // Wald's SPRT Log-Likelihood Ratio
}

export interface SecurityIncident {
  id: string;
  timestamp: string;
  attackType: 'INTERCEPT_RESEND' | 'FORGERY_ATTACK' | 'REPLAY_ATTACK' | 'CHANNEL_NOISE';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  sourceNode: string;
  targetNode: string;
  qber: number;
  fidelity: number;
  chiSquarePValue: number; // Chi-Square goodness-of-fit p-value
  sprtDecision: 'ACCEPT_H1_ATTACK' | 'CONTINUE_SAMPLING' | 'ACCEPT_H0_SECURE';
  status: 'ACTIVE' | 'MITIGATED' | 'UNDER_REVIEW';
}

export interface AnalystMetricSummary {
  threatIndex: number;
  activeAttacks: number;
  averageQBER: number;
  averageFidelity: number;
}