import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

export interface AuthUser {
  uid: string
  email: string | null
  name: string | null
  photoUrl: string | null
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  signInWithGoogle: () => Promise<AuthUser>
  signOutUser: () => Promise<void>
  /**
   * Resolves once signed in (no-op if already signed in). Shared across every
   * caller (cart, wishlist, ...) via one in-flight promise, so triggering
   * several gated actions back-to-back while signed out opens exactly one
   * Google popup instead of one per action.
   */
  ensureSignedIn: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function toAuthUser(firebaseUser: FirebaseUser): AuthUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    name: firebaseUser.displayName,
    photoUrl: firebaseUser.photoURL,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const signInPromiseRef = useRef<Promise<unknown> | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? toAuthUser(firebaseUser) : null)
      setIsLoading(false)
    })
    return unsubscribe
  }, [])

  async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider)
    return toAuthUser(result.user)
  }

  async function signOutUser() {
    await signOut(auth)
  }

  // Gate on Firebase's live `auth.currentUser`, not the React `user` state —
  // state updates are async, so several gated calls fired in the same tick
  // (or across a quick sequence of awaits) would otherwise all see a stale
  // "not signed in" value and each try to open their own popup.
  async function ensureSignedIn() {
    if (auth.currentUser) return
    if (!signInPromiseRef.current) {
      signInPromiseRef.current = signInWithGoogle().finally(() => {
        signInPromiseRef.current = null
      })
    }
    await signInPromiseRef.current
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, signOutUser, ensureSignedIn }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
