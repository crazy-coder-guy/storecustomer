import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Alert02Icon,
  PackageIcon,
  CheckmarkCircle02Icon,
  DeliveryTruck01Icon,
  Clock01Icon,
  Cancel01Icon,
  Location01Icon,
  Copy01Icon,
  Download01Icon,
} from '@hugeicons/core-free-icons'
import { toast } from 'sonner'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { LiquidButton } from '../components/LiquidButton'
import { Skeleton } from '../components/Skeleton'
import { getOrder } from '../services/order.service'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import { openPrintableInvoice } from '../utils/invoice'
import type { OrderStatus } from '../types'

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; badgeClass: string; dotClass: string; icon: typeof Clock01Icon }
> = {
  PENDING: {
    label: 'Order Placed',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/60',
    dotClass: 'bg-amber-500',
    icon: Clock01Icon,
  },
  PROCESSING: {
    label: 'Processing',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200/60',
    dotClass: 'bg-blue-500',
    icon: PackageIcon,
  },
  SHIPPED: {
    label: 'In Transit',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200/60',
    dotClass: 'bg-purple-500',
    icon: DeliveryTruck01Icon,
  },
  DELIVERED: {
    label: 'Delivered',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
    dotClass: 'bg-emerald-500',
    icon: CheckmarkCircle02Icon,
  },
  CANCELLED: {
    label: 'Cancelled',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200/60',
    dotClass: 'bg-rose-500',
    icon: Cancel01Icon,
  },
}

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId as string),
    enabled: Boolean(orderId),
  })

  const itemsTotal = order?.items?.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) ?? 0
  const deliveryFee = order ? Math.max(0, order.totalAmount - itemsTotal) : 0

  function handleCopyOrderNumber(orderNumber: string) {
    navigator.clipboard.writeText(orderNumber)
    toast.success('Order number copied to clipboard')
  }

  const statusMeta = order ? STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING : null

  // Tracking milestones computation
  const milestones = [
    { label: 'Order Placed', desc: 'Verified & Registered', active: true },
    {
      label: 'Packed & Checked',
      desc: 'Quality check & packaging',
      active: order ? ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) : false,
    },
    {
      label: 'In Transit',
      desc: 'Courier handover & logistics',
      active: order ? ['SHIPPED', 'DELIVERED'].includes(order.status) : false,
    },
    {
      label: 'Delivered',
      desc: 'Handed over at doorstep',
      active: order?.status === 'DELIVERED',
    },
  ]

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between selection:bg-black selection:text-white font-sans">
      <div>
        <Navbar />

        <main className="py-6 sm:py-10">
          <div className="kaira-container max-w-5xl mx-auto px-4 sm:px-6">
          

            {isLoading ? (
              /* Skeleton shaped like the order header + items/summary layout below */
              <div className="py-8 space-y-12">
                <div className="space-y-4 pb-8 border-b border-black/10">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-32 rounded" />
                      <Skeleton className="h-9 w-56 rounded" />
                      <Skeleton className="h-7 w-32 rounded" />
                    </div>
                    <Skeleton className="h-8 w-40 rounded-2xl" />
                  </div>
                  <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-1.5 w-full rounded-full" />
                        <Skeleton className="h-3 w-20 rounded" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                  <div className="lg:col-span-7 space-y-6">
                    <Skeleton className="h-4 w-40 rounded" />
                    <div className="space-y-5">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-5">
                          <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl shrink-0" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4 rounded" />
                            <Skeleton className="h-3 w-1/2 rounded" />
                            <Skeleton className="h-3 w-1/3 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-5 space-y-6">
                    <Skeleton className="h-4 w-48 rounded" />
                    <div className="space-y-2.5">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-3.5 w-full rounded" />
                      ))}
                    </div>
                    <Skeleton className="h-24 w-full rounded-xl" />
                  </div>
                </div>
              </div>
            ) : isError || !order ? (
              <div className="py-20 text-center max-w-md mx-auto space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                  <HugeiconsIcon icon={Alert02Icon} size={32} />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight leading-tight">
                  Order Not Found
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-black/60">
                  We couldn't retrieve this order reference. It may have expired or was created under another account.
                </p>
                <LiquidButton href="/orders" variant="primary" className="mx-auto">
                  Back to My Orders
                </LiquidButton>
              </div>
            ) : (
              <div className="py-8 space-y-12">
                
                {/* 1. Editorial Header Section (Matching ProductDetailPage Typography) */}
                <div className="space-y-4 pb-8 border-b border-black/10">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-widest text-black/50">
                          Order Breakdown
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight leading-tight">
                          {order.orderNumber}
                        </h1>
                        <button
                          type="button"
                          onClick={() => handleCopyOrderNumber(order.orderNumber)}
                          className="h-8 w-8 rounded-full border border-black/10 hover:border-black flex items-center justify-center text-black/50 hover:text-black transition-colors cursor-pointer"
                          title="Copy order number"
                        >
                          <HugeiconsIcon icon={Copy01Icon} size={14} />
                        </button>
                      </div>

                      {/* Pricing matching ProductDetailPage */}
                      <div className="space-y-0.5">
                        <div className="flex items-baseline gap-3">
                          <span className="text-3xl font-black text-black">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-black/60 block">
                          Confirmed on {formatDate(order.createdAt)} · {order.itemsCount} {order.itemsCount === 1 ? 'piece' : 'pieces'} ordered · Price incl. of all taxes
                        </span>
                      </div>
                    </div>

                    {/* Status Badges & Invoice Button */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {statusMeta && (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-2xl border px-4 py-1.5 text-xs font-bold ${statusMeta.badgeClass}`}
                        >
                          <span className={`h-2 w-2 rounded-full ${statusMeta.dotClass}`} />
                          <HugeiconsIcon icon={statusMeta.icon} size={14} />
                          <span>{statusMeta.label}</span>
                        </span>
                      )}

                      <span
                        className={`rounded-2xl px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                        }`}
                      >
                        {order.paymentStatus === 'PAID' ? 'Payment Verified' : 'Payment Pending'}
                      </span>

                      <button
                        type="button"
                        onClick={() => openPrintableInvoice(order)}
                        className="inline-flex items-center gap-1.5 rounded-2xl border border-black/20 bg-white hover:bg-black hover:text-white px-4 py-1.5 text-xs font-bold text-black transition-all cursor-pointer shadow-2xs active:scale-95"
                        title="Download / Print Official Invoice"
                      >
                        <HugeiconsIcon icon={Download01Icon} size={14} />
                        <span>Download Invoice</span>
                      </button>
                    </div>
                  </div>

                  {/* Visual Timeline Steps (Minimal Line Indicator) */}
                  <div className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                      {milestones.map((step, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                step.active ? 'bg-black w-full' : 'w-0'
                              }`}
                            />
                          </div>
                          <div>
                            <p
                              className={`text-xs font-extrabold uppercase tracking-wider ${
                                step.active ? 'text-black' : 'text-black/35'
                              }`}
                            >
                              {step.label}
                            </p>
                            <p className="text-xs text-black/50 font-semibold hidden sm:block mt-0.5">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Purchased Items & Summary (Borderless Editorial Split Layout) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                  
                  {/* Left Column: Items List */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-black/10">
                      <h2 className="text-xs font-extrabold uppercase tracking-wider text-black">
                        Purchased Items ({order.items?.length || 0})
                      </h2>
                      <span className="text-xs font-semibold text-black/50">
                        High-density heavyweight garments
                      </span>
                    </div>

                    <div className="divide-y divide-black/10">
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-5 py-5 first:pt-0 last:pb-0"
                        >
                          {/* Garment Image */}
                          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-neutral-100 border border-black/10 overflow-hidden shrink-0 flex items-center justify-center">
                            {item.productImageUrl ? (
                              <img
                                src={item.productImageUrl}
                                alt={item.productName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <HugeiconsIcon icon={PackageIcon} size={28} className="text-black/30" />
                            )}
                          </div>

                          {/* Garment Meta matching ProductDetailPage */}
                          <div className="min-w-0 flex-1 space-y-1">
                            <h3 className="text-base sm:text-lg font-black text-black tracking-tight leading-snug truncate">
                              {item.productName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-black/60">
                              <span className="flex items-center gap-1.5">
                                <span
                                  className="h-2.5 w-2.5 rounded-full border border-black/20"
                                  style={{ backgroundColor: item.colorHex || '#000' }}
                                />
                                <span>{item.colorName}</span>
                              </span>
                              <span>•</span>
                              <span className="font-extrabold text-black/80">Size: {item.sizeCode}</span>
                              <span>•</span>
                              <span>Qty: {item.quantity}</span>
                            </div>
                            <p className="text-xs font-semibold text-black/50">
                              Unit price: {formatCurrency(item.unitPrice)}
                            </p>
                          </div>

                          {/* Line Subtotal */}
                          <div className="shrink-0 text-right">
                            <span className="text-base sm:text-lg font-black text-black">
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Financial Breakdown & Delivery Destination */}
                  <div className="lg:col-span-5 space-y-8">
                    
                    {/* Payment & Invoice Breakdown */}
                    <div className="space-y-4 pb-6 border-b border-black/10">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-black">
                        Payment & Pricing Summary
                      </h3>
                      
                      <div className="space-y-2.5 text-xs sm:text-sm font-semibold text-black/70">
                        <div className="flex justify-between">
                          <span>Items Total</span>
                          <span className="font-bold text-black">{formatCurrency(itemsTotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery</span>
                          <span className={deliveryFee === 0 ? 'font-bold text-emerald-600 uppercase text-xs' : 'font-bold text-black'}>
                            {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST & Taxes</span>
                          <span className="text-black/50">Included</span>
                        </div>
                        
                        <div className="flex justify-between items-baseline pt-4 border-t border-black/10">
                          <span className="text-base font-bold text-black">Total Paid</span>
                          <span className="text-2xl sm:text-3xl font-black text-black">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address Details */}
                    <div className="space-y-3 pb-6 border-b border-black/10">
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={Location01Icon} size={16} className="text-black/60" />
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-black">
                          Shipping Destination
                        </h3>
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-black/75 space-y-1 pl-6 leading-relaxed">
                        <p className="font-black text-black">{order.customerName}</p>
                        <p className="text-black/70">{order.shippingAddress}</p>
                        <p className="pt-1 text-black/60">{order.customerPhone}</p>
                        <p className="text-black/60">{order.customerEmail}</p>
                      </div>
                    </div>

                    {/* Customer Support & Assistance */}
                    <div className="space-y-2 text-xs text-black/60 pl-6 border-l-2 border-black/10">
                      <p className="font-bold text-black">Need assistance with this order?</p>
                      <p className="font-medium">
                        Reach out to our support team at{' '}
                        <a
                          href="mailto:hello.kaiiraofficial@gmail.com"
                          className="font-bold text-black underline underline-offset-2"
                        >
                          hello.kaiiraofficial@gmail.com
                        </a>{' '}
                        quoting reference #{order.orderNumber}.
                      </p>
                    </div>

                  </div>

                </div>

              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
