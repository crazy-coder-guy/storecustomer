import { useCallback, useEffect, useState } from 'react'
import { subscribeToPush } from '../services/push.service'

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

export type PushPermissionState = 'unsupported' | 'default' | 'granted' | 'denied'

export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermissionState>(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
      return 'unsupported'
    }
    return Notification.permission as PushPermissionState
  })
  const [isSubscribing, setIsSubscribing] = useState(false)

  // Register the service worker up front (idempotent) so it's ready the
  // moment permission is granted, without waiting on a user action first.
  useEffect(() => {
    if (permission === 'unsupported') return
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Non-fatal — enableNotifications will surface the real error if the
      // shopper actually tries to subscribe.
    })
  }, [permission])

  const enableNotifications = useCallback(async () => {
    if (permission === 'unsupported' || isSubscribing) return false
    setIsSubscribing(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result as PushPermissionState)
      if (result !== 'granted') return false
      if (!VAPID_PUBLIC_KEY) {
        console.error('VITE_VAPID_PUBLIC_KEY is not configured')
        return false
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as BufferSource,
      })
      const json = subscription.toJSON()
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return false

      await subscribeToPush({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      })
      return true
    } catch (err) {
      console.error('Failed to enable push notifications', err)
      return false
    } finally {
      setIsSubscribing(false)
    }
  }, [permission, isSubscribing])

  return { permission, isSubscribing, enableNotifications }
}
