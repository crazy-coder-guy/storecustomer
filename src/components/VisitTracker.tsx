import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { recordVisit } from '../services/visit.service'

const SESSION_KEY = 'kaiira_visit_tracked'

// Records one visit per browser session (per tab) — waits for Firebase auth
// state to resolve first so a signed-in shopper's visit is correctly tied to
// their account instead of always logging in as anonymous.
export function VisitTracker() {
  const { isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (sessionStorage.getItem(SESSION_KEY)) return
    sessionStorage.setItem(SESSION_KEY, '1')
    recordVisit().catch(() => {})
  }, [isLoading])

  return null
}
