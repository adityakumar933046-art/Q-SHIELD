import { fetchApi } from './api';
import { QuantumMeasureRequest, QuantumTeleportRequest } from '../types/measurement';

export async function getQuantumBackendInfo() {
  return fetchApi<any>('/quantum/backend');
}

export async function measureState(req: QuantumMeasureRequest) {
  return fetchApi<any>('/quantum/measure', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function teleportState(req: QuantumTeleportRequest) {
  return fetchApi<any>('/quantum/teleport', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}
