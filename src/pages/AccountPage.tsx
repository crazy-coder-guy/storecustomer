import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Logout03Icon,
  UserIcon,
  GoogleIcon,
  ShoppingBag01Icon,
  FavouriteIcon,
  PackageIcon,
} from '@hugeicons/core-free-icons'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { Skeleton } from '../components/Skeleton'
import { useAuth } from '../context/AuthContext'

export function AccountPage() {
  const navigate = useNavigate()
  const { user, isLoading, signInWithGoogle, signOutUser } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignIn() {
    setIsSigningIn(true)
    try {
      await signInWithGoogle()
    } catch {
      // user closed the popup or it failed — nothing to do
    } finally {
      setIsSigningIn(false)
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true)
    try {
      await signOutUser()
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="py-10 sm:py-16">
          <div className="kaira-container max-w-lg mx-auto">
            {isLoading ? (
              /* Profile skeleton, shaped like the signed-in card below */
              <div className="space-y-6">
                <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-xs text-center">
                  <Skeleton className="mx-auto h-20 w-20 rounded-full" />
                  <Skeleton className="mt-4 h-5 w-40 rounded mx-auto" />
                  <Skeleton className="mt-2 h-3.5 w-52 rounded mx-auto" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-2xl" />
                  ))}
                </div>
                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>
            ) : !user ? (
              /* Signed-out state */
              <div className="rounded-3xl border border-black/10 bg-neutral-50/70 p-8 sm:p-10 text-center space-y-5">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white border border-black/10 text-black/40 shadow-xs">
                  <HugeiconsIcon icon={UserIcon} size={30} />
                </div>
                <div className="space-y-1.5">
                  <h1 className="text-xl sm:text-2xl font-black text-black">You're not signed in</h1>
                  <p className="text-xs sm:text-sm font-medium text-black/60 max-w-sm mx-auto">
                    Sign in with Google to view your account.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="mx-auto flex items-center gap-2.5 rounded-2xl border border-black/15 bg-white px-6 py-3 text-sm font-bold text-black shadow-xs hover:border-black transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <HugeiconsIcon icon={GoogleIcon} size={18} />
                  {isSigningIn ? 'Signing in…' : 'Sign in with Google'}
                </button>
              </div>
            ) : (
              /* Signed-in profile */
              <div className="space-y-6">
                <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-xs text-center">
                  <div className="mx-auto h-20 w-20 overflow-hidden rounded-full border border-black/10 bg-neutral-100 flex items-center justify-center text-2xl font-black uppercase text-black">
                    {user.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      (user.name ?? user.email ?? '?').charAt(0)
                    )}
                  </div>
                  <h1 className="mt-4 text-xl sm:text-2xl font-black text-black">
                    {user.name ?? 'Your Account'}
                  </h1>
                  <p className="text-sm text-black/50 font-medium">{user.email}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/orders')}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-black/10 bg-neutral-50/60 p-5 hover:border-black transition-colors cursor-pointer"
                  >
                    <HugeiconsIcon icon={PackageIcon} size={22} />
                    <span className="text-xs font-black uppercase tracking-wider">My Orders</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/cart')}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-black/10 bg-neutral-50/60 p-5 hover:border-black transition-colors cursor-pointer"
                  >
                    <HugeiconsIcon icon={ShoppingBag01Icon} size={22} />
                    <span className="text-xs font-black uppercase tracking-wider">My Bag</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/wishlist')}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-black/10 bg-neutral-50/60 p-5 hover:border-black transition-colors cursor-pointer"
                  >
                    <HugeiconsIcon icon={FavouriteIcon} size={22} />
                    <span className="text-xs font-black uppercase tracking-wider">Wishlist</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-black/15 bg-white px-6 py-3 text-sm font-bold text-black hover:border-red-400 hover:text-red-500 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <HugeiconsIcon icon={Logout03Icon} size={18} />
                  {isSigningOut ? 'Signing out…' : 'Sign Out'}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
