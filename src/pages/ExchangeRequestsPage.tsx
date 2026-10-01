import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Alert02Icon,
  Cancel01Icon,
  GoogleIcon,
  PackageIcon,
  Clock01Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { Skeleton } from '../components/Skeleton'
import { useAuth } from '../context/AuthContext'
import { useMyExchangeRequests } from '../hooks/queries'
import { cancelExchangeRequest } from '../services/exchange.service'
import { getErrorMessage } from '../services/api'
import { formatDate } from '../utils/formatDate'
import { useSeoMeta } from '../hooks/useSeoMeta'
import type { ExchangeRequest, ExchangeRequestStatus } from '../types'

const REASON_LABEL: Record<string, string> = {
  DAMAGED: 'Item arrived damaged',
  DEFECTIVE: 'Item is defective / faulty',
  WRONG_ITEM: 'Received the wrong item',
  SIZE_FIT: 'Size / fit issue',
  OTHER: 'Something else',
}

const STATUS_BADGE: Record<ExchangeRequestStatus, { label: string; badgeClass: string; icon: typeof Clock01Icon }> = {
  PENDING: {
    label: 'Under Review',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/60',
    icon: Clock01Icon,
  },
  APPROVED: {
    label: 'Approved',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200/60',
    icon: CheckmarkCircle02Icon,
  },
  REJECTED: {
    label: 'Rejected',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200/60',
    icon: Cancel01Icon,
  },
  COMPLETED: {
    label: 'Completed',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
    icon: CheckmarkCircle02Icon,
  },
  CANCELLED: {
    label: 'Cancelled',
    badgeClass: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    icon: Cancel01Icon,
  },
}

export function ExchangeRequestsPage() {
  useSeoMeta({ title: 'My Exchange Requests', robots: 'noindex, nofollow' })

  const { user, isLoading: authLoading, signInWithGoogle } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [selected, setSelected] = useState<ExchangeRequest | null>(null)

  const { data: requests = [], isLoading } = useMyExchangeRequests(Boolean(user))

  async function handleSignIn() {
    setIsSigningIn(true)
    try {
      await signInWithGoogle()
    } catch {
      // user closed popup
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between font-sans">
      <div>
        <Navbar />

        <main className="py-6 sm:py-10">
          <div className="kaira-container max-w-4xl mx-auto px-4 sm:px-6">
            <div className="space-y-2 pb-6 border-b border-black/10">
              <span className="text-xs font-black uppercase tracking-widest text-black/50">
                Exchange History
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight leading-tight">
                My Exchange Requests
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-black/60">
                Track the status of damaged, defective, or wrong items you've reported.
              </p>
            </div>

            {authLoading || isLoading ? (
              <div className="py-8 divide-y divide-black/10">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="py-6 flex items-center gap-5">
                    <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/2 rounded" />
                      <Skeleton className="h-3 w-1/3 rounded" />
                    </div>
                    <Skeleton className="h-6 w-24 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : !user ? (
              <div className="my-14 rounded-3xl border border-black/10 bg-neutral-50/60 p-8 sm:p-14 text-center max-w-xl mx-auto space-y-6">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white border border-black/10 text-black/50 shadow-2xs">
                  <HugeiconsIcon icon={Alert02Icon} size={36} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight leading-tight">
                    Sign in to view exchanges
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold text-black/60 max-w-sm mx-auto leading-relaxed">
                    Your exchange requests are securely tied to your Google account.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="mx-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-black px-7 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-60 active:scale-95"
                >
                  <HugeiconsIcon icon={GoogleIcon} size={18} />
                  <span>{isSigningIn ? 'Connecting to Google…' : 'Sign In with Google'}</span>
                </button>
              </div>
            ) : requests.length === 0 ? (
              <div className="my-14 rounded-3xl border border-black/10 bg-neutral-50/60 p-8 sm:p-14 text-center max-w-xl mx-auto space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white border border-black/10 text-black/40 shadow-2xs">
                  <HugeiconsIcon icon={PackageIcon} size={30} />
                </div>
                <h2 className="text-lg sm:text-xl font-black text-black">No exchange requests yet</h2>
                <p className="text-xs sm:text-sm font-semibold text-black/60 max-w-sm mx-auto">
                  If a delivered item arrives damaged or wrong, report it from that order within 3 days of delivery.
                </p>
              </div>
            ) : (
              <div className="py-6 divide-y divide-black/10">
                {requests.map((request) => {
                  const badge = STATUS_BADGE[request.status]
                  return (
                    <button
                      key={request.id}
                      type="button"
                      onClick={() => setSelected(request)}
                      className="w-full flex items-center gap-4 sm:gap-5 py-5 first:pt-0 last:pb-0 text-left cursor-pointer group"
                    >
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-neutral-100 border border-black/10 overflow-hidden shrink-0 flex items-center justify-center">
                        {request.productImage ? (
                          <img
                            src={request.productImage}
                            alt={request.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <HugeiconsIcon icon={PackageIcon} size={24} className="text-black/30" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <h3 className="text-sm sm:text-base font-black text-black tracking-tight leading-snug truncate group-hover:underline underline-offset-2">
                          {request.productName}
                        </h3>
                        <p className="text-xs font-semibold text-black/60">
                          {REASON_LABEL[request.reason] ?? request.reason} · Order {request.orderNumber}
                        </p>
                        <p className="text-xs font-semibold text-black/40">
                          Reported on {formatDate(request.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-bold ${badge.badgeClass}`}
                      >
                        <HugeiconsIcon icon={badge.icon} size={13} />
                        <span>{badge.label}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />

      {selected && <ExchangeDetailDrawer request={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function ExchangeDetailDrawer({ request, onClose }: { request: ExchangeRequest; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [isCancelling, setIsCancelling] = useState(false)
  const badge = STATUS_BADGE[request.status]

  async function handleCancel() {
    setIsCancelling(true)
    try {
      await cancelExchangeRequest(request.id)
      toast.success('Exchange request cancelled')
      queryClient.invalidateQueries({ queryKey: ['my-exchange-requests'] })
      queryClient.invalidateQueries({ queryKey: ['exchange-eligible-items'] })
      onClose()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsCancelling(false)
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exchange-detail-title"
      className="fixed inset-0 z-[999] overflow-hidden font-sans"
    >
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 z-10 flex h-full max-h-screen max-w-full pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full max-h-screen animate-drawer-slide-in">
          <div className="shrink-0 flex items-center justify-between border-b border-black/10 px-5 sm:px-6 py-4.5 bg-white/95 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3 min-w-0">
              {request.productImage ? (
                <div className="h-11 w-9 rounded-xl overflow-hidden bg-neutral-100 border border-black/10 shrink-0">
                  <img src={request.productImage} alt={request.productName} className="h-full w-full object-cover object-top" />
                </div>
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-black shrink-0">
                  <HugeiconsIcon icon={Alert02Icon} size={18} strokeWidth={2} />
                </span>
              )}
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-black/45 block">
                  Exchange Request
                </span>
                <h2
                  id="exchange-detail-title"
                  className="text-sm sm:text-base font-black tracking-tight text-black leading-tight truncate"
                >
                  {request.productName}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 hover:bg-black hover:text-white transition-all text-black/70 cursor-pointer shrink-0"
              aria-label="Close Exchange Detail Drawer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-6 scrollbar-none divide-y divide-black/10">
            <div className="pb-6 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-black/50">Status</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-bold ${badge.badgeClass}`}
              >
                <HugeiconsIcon icon={badge.icon} size={13} />
                <span>{badge.label}</span>
              </span>
            </div>

            <div className="py-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-black/50">
                <span>Item</span>
                <span>Order {request.orderNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-black/60">
                <span className="h-2.5 w-2.5 rounded-full border border-black/20" style={{ backgroundColor: request.colorHex || '#000' }} />
                <span>{request.colorName}</span>
                <span>•</span>
                <span className="font-extrabold text-black/80">Size: {request.sizeCode}</span>
              </div>
            </div>

            <div className="py-6 space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-black/50 block">Reason</span>
              <p className="text-sm font-bold text-black">{REASON_LABEL[request.reason] ?? request.reason}</p>
              {request.description && (
                <p className="text-sm font-medium text-black/70 leading-relaxed">{request.description}</p>
              )}
            </div>

            {request.images.length > 0 && (
              <div className="py-6 space-y-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-black/50 block">
                  Photos Submitted
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {request.images.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer" className="block">
                      <img src={url} alt="" className="h-20 w-20 rounded-xl object-cover border border-black/10" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {request.adminNote && (
              <div className="py-6 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-black/50 block">
                  Note from our team
                </span>
                <p className="text-sm font-medium text-black/70 leading-relaxed rounded-2xl bg-neutral-50 border border-black/10 p-3.5">
                  {request.adminNote}
                </p>
              </div>
            )}

            <div className="py-6 space-y-1">
              <p className="text-xs font-semibold text-black/40">Reported on {formatDate(request.createdAt)}</p>
              <p className="text-xs font-semibold text-black/40">Last updated {formatDate(request.updatedAt)}</p>
            </div>
          </div>

          {request.status === 'PENDING' && (
            <div className="shrink-0 p-4 sm:p-5 border-t border-black/10 bg-white">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCancelling}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-black/15 py-3.5 px-5 text-xs font-black uppercase tracking-wider text-black hover:border-red-400 hover:text-red-500 transition-all cursor-pointer active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isCancelling ? 'Cancelling…' : 'Cancel Request'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
