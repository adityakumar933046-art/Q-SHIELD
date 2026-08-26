export interface ThreatSignal {
  signal_type: string;
  weight: number;
  timestamp: string;
}

export interface ThreatAssessment {
  score: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  threat_type: string;
  signals: ThreatSignal[];
  recommendation: string;
}
