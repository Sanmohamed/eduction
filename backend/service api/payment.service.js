import api from './api'

export async function checkout(payload) {
  const { data } = await api.post("/payments/create", payload);
  return data;
}

export function resolveGatewayAction(gateway) {
  if (!gateway || typeof gateway !== 'object') {
    return { type: 'none' }
  }

  if (gateway?.url) {
    return { type: 'redirect', url: gateway.url }
  }

  return { type: 'none' }
}

export async function confirmPayment(paymentData) {
  const { data } = await api.post("/payments/confirm", paymentData);
  return data;
}

