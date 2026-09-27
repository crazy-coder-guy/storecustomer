import { useCallback, useEffect, useRef, useState } from 'react'
import { subscribeToPush } from '../services/push.service'
import { useAuth } from '../context/AuthContext'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

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

export function isAppStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

function iosNeedsInstallFirst(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  const isIOS = /iPad|iPhone|iPod/.test(nav.userAgent) || (nav.userAgent.includes('Macintosh') && nav.maxTouchPoints > 1)
  const isStandalone = isAppStandalone()
  return isIOS && !isStandalone
}

export function usePushNotifications() {
  const { user } = useAuth()
  const [permission, setPermission] = useState<PushPermissionState>(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
      return 'unsupported'
    }
    return Notification.permission as PushPermissionState
  })
  const [needsInstallFirst] = useState(iosNeedsInstallFirst)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const syncedForUid = useRef<string | null>(null)

  // Register service worker up front only for installed PWA & logged-in users
  useEffect(() => {
    if (permission === 'unsupported' || !user || !isAppStandalone()) return
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [permission, user])

  // Re-associate subscription with signed-in user inside installed PWA
  useEffect(() => {
    if (permission !== 'granted' || !user || !isAppStandalone() || syncedForUid.current === user.uid) return
    syncedForUid.current = user.uid
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => subscription && postSubscription(subscription))
      .catch(() => {})
  }, [permission, user])

  const enableNotifications = useCallback(async () => {
    // Strictly restrict notification permission requests to installed PWAs and logged-in users
    if (!user || !isAppStandalone() || permission === 'unsupported' || needsInstallFirst || isSubscribing) {
      return false
    }
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
  }, [permission, needsInstallFirst, isSubscribing, user])

  return { permission, isSubscribing, enableNotifications, needsInstallFirst }
}
