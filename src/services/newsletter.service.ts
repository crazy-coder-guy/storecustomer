import { api } from './api'

export async function subscribeNewsletter(email: string) {
  const { data } = await api.post<{ alreadySubscribed: boolean }>('/newsletter/subscribe', { email })
  return data
}
