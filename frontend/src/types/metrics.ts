export interface SecurityMetricsData {
  total_signatures: number;
  total_verifications: number;
  accepted_verifications: number;
  rejected_verifications: number;
  error_rate: number;
  threats_detected: number;
  attacks_blocked: number;
  attack_success_rate: number;
}

export interface StatisticalMetrics {
  total_samples: number;
  accepted: number;
  rejected: number;
  error_rate: number;
  false_acceptance_rate: number;
  false_rejection_rate: number;
  threshold_status: string;
}
