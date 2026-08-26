export interface Measurement {
  id?: string;
  signature_id?: string;
  basis: string;
  shots: number;
  counts: Record<string, number>;
  probabilities: Record<string, number>;
  state_vector?: number[][];
  fidelity?: number;
  timestamp?: string;
}

export interface QuantumMeasureRequest {
  state_label: string;
  basis: string;
  shots?: number;
}

export interface QuantumTeleportRequest {
  state_label: string;
  shots?: number;
}
