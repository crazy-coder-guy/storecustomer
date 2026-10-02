import { useState } from 'react'
import { StandaloneHeader } from '../components/StandaloneHeader'
import { ScrollWipeKaira } from '../components/ScrollWipeKaira'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  PackageIcon,
  Search01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  SecurityCheckIcon,
  Alert02Icon,
} from '@hugeicons/core-free-icons'
import { useSeoMeta } from '../hooks/useSeoMeta'
import { trackOrder } from '../services/order.service'
import { getErrorMessage } from '../services/api'
import { formatDate } from '../utils/formatDate'
import { formatCurrency } from '../utils/formatCurrency'
import type { Order, OrderStatus } from '../types'

const PIPELINE: { status: OrderStatus; label: string }[] = [
  { status: 'PENDING', label: 'Order Placed & Confirmed' },
  { status: 'PROCESSING', label: 'Processing' },
  { status: 'SHIPPED', label: 'Shipped' },
  { status: 'DELIVERED', label: 'Delivered' },
]
const PIPELINE_INDEX: Record<OrderStatus, number> = { PENDING: 0, PROCESSING: 1, SHIPPED: 2, DELIVERED: 3, CANCELLED: -1 }

export function TrackOrderPage() {
  useSeoMeta({
    title: 'Track Your Order',
    description: 'Track your KAIIRA order status and delivery progress.',
    path: '/track-order',
  })

  const [orderNumber, setOrderNumber] = useState('')
  const [contact, setContact] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault()
    if (!orderNumber.trim() || !contact.trim()) return
    setLoading(true)
    setError(null)
    setOrder(null)
    try {
      const result = await trackOrder(orderNumber.trim(), contact.trim())
      setOrder(result)
    } catch (err) {
      setError(getErrorMessage(err) || "We couldn't find a matching order.")
    } finally {
      setLoading(false)
    }
  }

  const currentStepIndex = order ? PIPELINE_INDEX[order.status] : -1

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-24">
      <StandaloneHeader title="Order Tracking" />

      <main className="kaira-container max-w-4xl pt-10 sm:pt-16">
        {/* Editorial Split Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pb-12 border-b border-black/10">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-black/15 bg-white px-3.5 py-1 text-xs font-semibold text-black">
              <span>Order Status Lookup</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black leading-[1.08]">
              Track Your Order
            </h1>
            <p className="text-base sm:text-lg text-black/75 font-medium leading-relaxed">
              Enter your order number and the phone or email it was placed under to check its current status.
            </p>
          </div>

          {/* Clean Borderless Form */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-black/60 mb-2">
                  Order Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. #ORD-1001"
                    className="w-full border-b-2 border-black/20 bg-transparent py-3 pl-8 pr-4 text-base font-semibold text-black placeholder:text-black/30 focus:border-black focus:outline-none transition-colors"
                  />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none">
                    <HugeiconsIcon icon={PackageIcon} size={18} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-black/60 mb-2">
                  Phone Number or Email
                </label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="+91 98765 43210 or name@example.com"
                  className="w-full border-b-2 border-black/20 bg-transparent py-3 px-1 text-base font-semibold text-black placeholder:text-black/30 focus:border-black focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto rounded-2xl bg-black px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer shadow-md inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span>Checking Records...</span>
                  ) : (
                    <>
                      <HugeiconsIcon icon={Search01Icon} size={16} />
                      <span>Track Order</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                  <HugeiconsIcon icon={Alert02Icon} size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Live Tracking Result - Clean Editorial View */}
        {order ? (
          <div className="pt-12 space-y-10 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-black/10">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-black/40 block">Order Status</span>
                <h3 className="text-3xl font-black text-black tracking-tight mt-1">{order.orderNumber}</h3>
              </div>
              <div
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-1.5 text-xs font-bold ${
                  order.status === 'CANCELLED'
                    ? 'border-rose-600 bg-rose-600 text-white'
                    : order.status === 'DELIVERED'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-black bg-black text-white'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                <span>{PIPELINE.find((p) => p.status === order.status)?.label ?? order.status}</span>
              </div>
            </div>

            {/* Order Meta Row — real data only */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-b border-black/5 text-sm">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-black/45 block">Order Date</span>
                <span className="font-black text-black mt-1 block">{formatDate(order.createdAt)}</span>
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-black/45 block">Payment Status</span>
                <span className="font-black text-black mt-1 block">
                  {order.paymentStatus === 'PAID' ? 'Paid' : order.paymentStatus === 'REFUNDED' ? 'Refunded' : 'Pending'}
                </span>
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-black/45 block">Items</span>
                <span className="font-black text-black mt-1 block">{order.itemsCount}</span>
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-black/45 block">Total Paid</span>
                <span className="font-black text-black mt-1 block">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>

            {/* Timeline — built from the order's real status, not a fixed script */}
            {order.status === 'CANCELLED' ? (
              <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">
                <HugeiconsIcon icon={Cancel01Icon} size={20} className="shrink-0" />
                <span>This order was cancelled.</span>
              </div>
            ) : (
              <div className="max-w-2xl py-4 space-y-8">
                {PIPELINE.map((step, idx) => {
                  const completed = idx <= currentStepIndex
                  const current = idx === currentStepIndex
                  return (
                    <div key={step.status} className="relative flex gap-5">
                      {idx < PIPELINE.length - 1 && (
                        <div
                          className={`absolute left-3.5 top-8 bottom-0 w-0.5 ${
                            idx < currentStepIndex ? 'bg-black' : 'bg-black/15'
                          }`}
                        />
                      )}

                      <div
                        className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
                          current
                            ? 'border-2 border-black bg-black text-white ring-4 ring-black/10'
                            : completed
                            ? 'bg-black text-white'
                            : 'border border-black/30 bg-white text-black/30'
                        }`}
                      >
                        {completed ? (
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-black/40" />
                        )}
                      </div>

                      <div className="flex-1 pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                          <h4 className={`text-base font-extrabold ${current ? 'text-black font-black' : 'text-black/85'}`}>
                            {step.label}
                          </h4>
                          {step.status === 'PENDING' && (
                            <span className="text-xs font-bold text-black/45">{formatDate(order.createdAt)}</span>
                          )}
                          {step.status === 'DELIVERED' && order.deliveredAt && (
                            <span className="text-xs font-bold text-black/45">{formatDate(order.deliveredAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="pt-4 flex items-center gap-2 text-xs font-medium text-black/60 border-t border-black/10">
              <HugeiconsIcon icon={SecurityCheckIcon} size={18} className="text-black shrink-0" />
              <span>
                Need help with this order? Email{' '}
                <span className="font-bold text-black">hello.kaiiraofficial@gmail.com</span> with your order number.
              </span>
            </div>
          </div>
        ) : (
          <div className="pt-16 pb-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-black/40">Dispatch Speed</span>
              <h4 className="text-lg font-black text-black">Same-Day Dispatch</h4>
              <p className="text-sm text-black/70 font-medium leading-relaxed">
                All confirmed orders placed before 1:00 PM are handed over to our courier partner the very same afternoon.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-black/40">Order Status</span>
              <h4 className="text-lg font-black text-black">Always Up To Date</h4>
              <p className="text-sm text-black/70 font-medium leading-relaxed">
                Look up your order with its order number and the phone or email it was placed under.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-black/40">Customer Support</span>
              <h4 className="text-lg font-black text-black">Need Direct Help?</h4>
              <p className="text-sm text-black/70 font-medium leading-relaxed">
                Reach our support team directly at <span className="font-bold text-black">hello.kaiiraofficial@gmail.com</span> for manual order lookups.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Smooth Scroll Wipe Out KAIRA Text */}
      <ScrollWipeKaira subtitle="Real-time order status, straight from checkout to doorstep." />
    </div>
  )
}
