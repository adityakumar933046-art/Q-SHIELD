import { fetchApi } from './api';

export async function verifySignature(signature_id: string, message: string) {
  return fetchApi<any>('/verification', {
    method: 'POST',
    body: JSON.stringify({ signature_id, message }),
  });
}

export async function getVerification(id: string) {
  return fetchApi<any>(`/verification/${id}`);
}
