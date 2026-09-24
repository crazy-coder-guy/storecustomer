import { useCallback, useEffect, useRef, useState } from 'react'
import { subscribeToPush } from '../services/push.service'
import { useAuth } from '../context/AuthContext'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

// Web Push requires the VAPID key as a Uint8Array, but it's distributed
// (and stored in env vars) as a URL-safe base64 string.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length))
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

async function postSubscription(subscription: PushSubscription) {
  const json = subscription.toJSON()
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return false
  await subscribeToPush({
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  })
  return true
}

export type PushPermissionState = 'unsupported' | 'default' | 'granted' | 'denied'

export function usePushNotifications() {
  const { user } = useAuth()
  const [permission, setPermission] = useState<PushPermissionState>(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
      return 'unsupported'
    }
    return Notification.permission as PushPermissionState
  })
  const [isSubscribing, setIsSubscribing] = useState(false)
  const syncedForUid = useRef<string | null>(null)

  // Register the service worker up front (idempotent) so it's ready the
  // moment permission is granted, without waiting on a user action first.
  useEffect(() => {
    if (permission === 'unsupported') return
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Non-fatal — enableNotifications will surface the real error if the
      // shopper actually tries to subscribe.
    })
  }, [permission])

  // Re-associate an existing subscription with the signed-in account. This
  // matters because the enable-notifications prompt only ever fires once
  // (permission goes from "default" straight to "granted"/"denied" and stays
  // there) — so anyone who granted permission before signing in, or before
  // this per-user targeting existed at all, would otherwise have their
  // subscription stuck as anonymous forever. Re-posting the same
  // subscription is silent (no browser prompt) since permission is already
  // granted; the backend just updates which user it's tied to.
  useEffect(() => {
    if (permission !== 'granted' || !user || syncedForUid.current === user.uid) return
    syncedForUid.current = user.uid
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => subscription && postSubscription(subscription))
      .catch(() => {
        // Non-fatal — next sign-in, or a manual "enable notifications" click, will retry.
      })
  }, [permission, user])

  const enableNotifications = useCallback(async () => {
    if (permission === 'unsupported' || isSubscribing) return false
    setIsSubscribing(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result as PushPermissionState)
      if (result !== 'granted') return false
      if (!VAPID_PUBLIC_KEY || !/^[A-Za-z0-9_-]+$/.test(VAPID_PUBLIC_KEY)) {
        console.error(
          'VITE_VAPID_PUBLIC_KEY is missing or invalid in this build. ' +
            'Set it in your hosting platform\'s environment variables and redeploy.'
        )
        return false
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as BufferSource,
      })
      return await postSubscription(subscription)
    } catch (err) {
      console.error('Failed to enable push notifications', err)
      return false
    } finally {
      setIsSubscribing(false)
    }
  }, [permission, isSubscribing])

  return { permission, isSubscribing, enableNotifications }
}
