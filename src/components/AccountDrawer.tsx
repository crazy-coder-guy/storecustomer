import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Cancel01Icon,
  Logout03Icon,
  UserIcon,
  GoogleIcon,
  ShoppingBag01Icon,
  FavouriteIcon,
  PackageIcon,
  ArrowRight01Icon,
  SecurityCheckIcon,
  Download01Icon,
} from '@hugeicons/core-free-icons'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { Skeleton } from './Skeleton'

interface AccountDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function AccountDrawer({ isOpen, onClose }: AccountDrawerProps) {
  const navigate = useNavigate()
  const { user, isLoading, signInWithGoogle, signOutUser } = useAuth()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Prevent background scrolling while drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  async function handleSignIn() {
    setIsSigningIn(true)
    try {
      await signInWithGoogle()
    } catch {
      // user closed popup or error — nothing needed
    } finally {
      setIsSigningIn(false)
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true)
    try {
      await signOutUser()
      onClose()
    } finally {
      setIsSigningOut(false)
    }
  }

  function handleNavigate(path: string) {
    onClose()
    navigate(path)
  }

  function handleDownloadAccountData() {
    const summary = {
      brand: 'KAIIRA Apparel',
      user: {
        name: user?.name ?? 'Valued Customer',
        email: user?.email ?? 'Unknown',
        uid: user?.uid ?? '',
        membership: 'KAIIRA Member',
      },
      bagSummary: {
        totalCartItems: cartCount,
        wishlistItemsCount: wishlistCount,
      },
      exportTimestamp: new Date().toISOString(),
      customerCare: 'care@kaiiraapparel.com',
    }

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kaiira-account-summary-${(user?.name || 'customer').toLowerCase().replace(/\s+/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return createPortal(
    <div className="fixed inset-0 z-[999] overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop with subtle blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        aria-hidden="true"
      />

      {/* Drawer Container (Slides in from Right, Full Height) */}
      <div className="fixed inset-y-0 right-0 z-10 flex h-full max-h-screen max-w-full pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full max-h-screen animate-drawer-slide-in">

          {/* Header */}
          <div className="shrink-0 flex items-center justify-between border-b border-black/10 px-6 py-4.5 bg-white/95 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
              <h2 className="text-base sm:text-lg font-black tracking-tight text-black">
                {user ? 'My Account' : 'Account & Profile'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 hover:bg-black hover:text-white transition-all text-black/70 cursor-pointer"
              aria-label="Close Account Sidebar"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {isLoading ? (
              /* Profile skeleton, shaped like the signed-in layout below */
              <div className="space-y-8 py-2">
                <div className="flex items-center gap-4 pb-6 border-b border-black/10">
                  <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-3 w-40 rounded" />
                    <Skeleton className="h-5 w-24 rounded-2xl" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-3 w-24 rounded mb-4 ml-2" />
                  <div className="divide-y divide-black/5 border-y border-black/10">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3.5 py-4 px-2">
                        <Skeleton className="h-5 w-5 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3.5 w-32 rounded" />
                          <Skeleton className="h-2.5 w-24 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : !user ? (
              /* Signed-out state */
              <div className="space-y-6 text-center py-6">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-black/5 border border-black/10 text-black/40">
                  <HugeiconsIcon icon={UserIcon} size={36} />
                </div>
                <div className="space-y-1.5 max-w-xs mx-auto">
                  <h3 className="text-xl font-black text-black">Welcome to KAIIRA</h3>
                  <p className="text-xs sm:text-sm font-medium text-black/60 leading-relaxed">
                    Sign in with Google to view your order history, manage your bag, and access personalized features.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl border border-black bg-black px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-neutral-800 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]"
                >
                  <HugeiconsIcon icon={GoogleIcon} size={18} />
                  <span>{isSigningIn ? 'Signing in with Google…' : 'Sign In with Google'}</span>
                </button>

                <div className="pt-4 border-t border-black/5">
                  <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-black/45">
                    <HugeiconsIcon icon={SecurityCheckIcon} size={14} />
                    <span>Fast, secure, 1-click authentication</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Signed-in profile — High-End Minimalist Studio Layout */
              <div className="space-y-8 py-2">
                {/* Profile Header without boxed card */}
                <div className="flex items-center gap-4 pb-6 border-b border-black/10">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-black/10 bg-neutral-100 flex items-center justify-center text-xl font-black uppercase text-black">
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
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-black leading-snug truncate">
                        {user.name ?? 'Valued Customer'}
                      </h3>
                    </div>
                    <p className="text-xs text-black/50 font-medium truncate mt-0.5">
                      {user.email}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-2xl bg-black px-2.5 py-0.5 text-[10px] font-bold text-white tracking-wide">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>KAIIRA Member</span>
                    </div>
                  </div>
                </div>

                {/* Seamless Menu Navigation Items (No Boxed Cards) */}
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-black/40 px-2 pb-2">
                    Quick Access
                  </p>
                  <nav className="divide-y divide-black/5 border-y border-black/10">
                    <button
                      type="button"
                      onClick={() => handleNavigate('/cart')}
                      className="group w-full flex items-center justify-between py-4 px-2 hover:bg-black/[0.02] transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-black/60 group-hover:text-black transition-colors">
                          <HugeiconsIcon icon={ShoppingBag01Icon} size={20} />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-black group-hover:translate-x-0.5 transition-transform">
                            My Shopping Bag
                          </p>
                          <p className="text-xs text-black/45 font-medium mt-0.5">
                            {cartCount} {cartCount === 1 ? 'item' : 'items'} waiting
                          </p>
                        </div>
                      </div>
                      <span className="text-black/40 group-hover:text-black group-hover:translate-x-1 transition-all">
                        <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={2} />
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavigate('/wishlist')}
                      className="group w-full flex items-center justify-between py-4 px-2 hover:bg-black/[0.02] transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-black/60 group-hover:text-black transition-colors">
                          <HugeiconsIcon icon={FavouriteIcon} size={20} />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-black group-hover:translate-x-0.5 transition-transform">
                            My Wishlist
                          </p>
                          <p className="text-xs text-black/45 font-medium mt-0.5">
                            {wishlistCount} {wishlistCount === 1 ? 'saved piece' : 'saved pieces'}
                          </p>
                        </div>
                      </div>
                      <span className="text-black/40 group-hover:text-black group-hover:translate-x-1 transition-all">
                        <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={2} />
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavigate('/orders')}
                      className="group w-full flex items-center justify-between py-4 px-2 hover:bg-black/[0.02] transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-black/60 group-hover:text-black transition-colors">
                          <HugeiconsIcon icon={PackageIcon} size={20} />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-black group-hover:translate-x-0.5 transition-transform">
                            My Orders
                          </p>
                          <p className="text-xs text-black/45 font-medium mt-0.5">
                            View order history & status
                          </p>
                        </div>
                      </div>
                      <span className="text-black/40 group-hover:text-black group-hover:translate-x-1 transition-all">
                        <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={2} />
                      </span>
                    </button>

                    {/* Download Account & Order History Summary */}
                    <button
                      type="button"
                      onClick={handleDownloadAccountData}
                      className="group w-full flex items-center justify-between py-4 px-2 hover:bg-black/[0.02] transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-black/60 group-hover:text-black transition-colors">
                          <HugeiconsIcon icon={Download01Icon} size={20} />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-black group-hover:translate-x-0.5 transition-transform">
                            Download Account Summary
                          </p>
                          <p className="text-xs text-black/45 font-medium mt-0.5">
                            Export profile details & order summary
                          </p>
                        </div>
                      </div>
                      <span className="text-black/40 group-hover:text-black group-hover:translate-x-1 transition-all">
                        <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={2} />
                      </span>
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Minimalist Sign Out */}
          {user && (
            <div className="shrink-0 border-t border-black/10 p-6 bg-white">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl border border-black/20 bg-white py-3.5 px-6 text-xs sm:text-sm font-bold text-black hover:border-black hover:bg-black hover:text-white transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 shadow-2xs active:scale-[0.99]"
              >
                <HugeiconsIcon icon={Logout03Icon} size={17} />
                <span>{isSigningOut ? 'Signing out…' : 'Sign Out of Account'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
