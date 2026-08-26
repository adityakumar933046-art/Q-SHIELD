import { fetchApi } from './api';

export async function simulateAttack(attack_type: string, payload: any) {
  const endpointMap: Record<string, string> = {
    FORGERY: '/attacks/forgery',
    IMPERSONATION: '/attacks/impersonation',
    REPLAY: '/attacks/replay',
    CHANNEL_MANIPULATION: '/attacks/channel-manipulation',
    UNAUTHORIZED_VERIFICATION: '/attacks/unauthorized-verification',
  };

  const url = endpointMap[attack_type] || '/attacks/forgery';
  return fetchApi<any>(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
