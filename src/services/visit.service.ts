import { api } from './api'

export async function recordVisit() {
  await api.post('/visits')
}
