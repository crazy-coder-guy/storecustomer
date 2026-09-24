import { api } from './api'

export interface PushSubscriptionPayload {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

export async function subscribeToPush(payload: PushSubscriptionPayload) {
  await api.post('/push/subscribe', payload)
}

export async function unsubscribeFromPush(endpoint: string) {
  await api.post('/push/unsubscribe', { endpoint })
}
