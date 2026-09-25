import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { Skeleton } from '../components/Skeleton'
import { getOrder } from '../services/order.service'
import { formatCurrency } from '../utils/formatCurrency'
import { PLACEHOLDER_PRODUCT_IMAGE } from '../hooks/queries'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  CheckmarkCircle02Icon,
  Alert02Icon,
  ArrowRight01Icon,
  Invoice01Icon,
  CreditCardIcon,
  DeliveryTruck01Icon,
} from '@hugeicons/core-free-icons'

import confetti from 'canvas-confetti'

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId as string),
    enabled: Boolean(orderId),
  })

  // Scroll to top
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    window.scrollTo(0, 0)
    setMounted(true)
  }, [])

  // Clean, crisp party popper pop from bottom-left and bottom-right (no yellow)
  useEffect(() => {
    if (!order) return

    const colors = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#000000', '#ffffff']

    // Bottom-left party popper shot
    confetti({
      particleCount: 70,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.95 },
      startVelocity: 50,
      colors,
      ticks: 200,
      gravity: 1,
      scalar: 1,
      zIndex: 9999,
    })

    // Bottom-right party popper shot
    confetti({
      particleCount: 70,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.95 },
      startVelocity: 50,
      colors,
      ticks: 200,
      gravity: 1,
      scalar: 1,
      zIndex: 9999,
    })
  }, [order])

  const itemsCount = order?.items?.reduce((acc, item) => acc + item.quantity, 0) || order?.itemsCount || 0
  const subtotal = order?.items?.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0) || order?.totalAmount || 0

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between font-sans">
      <div>
        <Navbar />

        <main className="py-8 sm:py-12 lg:py-14">
          <div className="kaira-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading || !mounted ? (
              /* Loading Skeleton */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                <div className="lg:col-span-7 rounded-2xl border border-black/10 bg-white p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <Skeleton className="h-8 w-64 rounded-lg" />
                    <Skeleton className="h-4 w-80 rounded" />
                  </div>
                  <div className="space-y-3 pt-4">
                    <Skeleton className="h-14 w-full rounded-xl" />
                    <Skeleton className="h-14 w-full rounded-xl" />
                    <Skeleton className="h-14 w-full rounded-xl" />
                  </div>
                  <Skeleton className="h-12 w-full rounded-full" />
                </div>
                <div className="lg:col-span-5 space-y-4">
                  <Skeleton className="h-6 w-44 rounded" />
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                  </div>
                  <Skeleton className="h-32 w-full rounded-xl" />
                </div>
              </div>
            ) : isError || !order ? (
              <div className="max-w-md mx-auto text-center py-12 space-y-5">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                  <HugeiconsIcon icon={Alert02Icon} size={32} />
                </div>
                <h1 className="text-2xl font-black text-black">Order not found</h1>
                <p className="text-sm text-neutral-500">We couldn't find that order.</p>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-black text-white text-sm font-bold hover:bg-neutral-800 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Left Column: Success Card */}
                <div className="lg:col-span-7 rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-xs">
                  {/* Celebratory Checkmark Badge with localized celebratory particle sparks */}
                  <div className="relative flex flex-col items-center text-center pt-2 pb-4">

                    {/* Centered celebratory badge */}
                    <div className="relative flex items-center justify-center mb-5">
                      {/* Main Circular emerald badge */}
                      <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 shadow-sm">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={42} strokeWidth={2.4} />
                      </div>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
                      Order Placed Successfully!
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-500 font-medium max-w-md mt-2 leading-relaxed">
                      Thank you for shopping with Kaiira, {order.customerName ? order.customerName.split(' ')[0] : 'there'}. A confirmation has been sent to{' '}
                      <span className="text-neutral-700 font-semibold">{order.customerEmail}</span>.
                    </p>
                  </div>

                  {/* Order Details List inside a rounded card */}
                  <div className="mt-4 rounded-xl border border-neutral-100 bg-neutral-50/50 p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
                    {/* Row 1: Order Number */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-neutral-600 font-medium">
                        <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                          <HugeiconsIcon icon={Invoice01Icon} size={16} />
                        </div>
                        <span>Order Number</span>
                      </div>
                      <span className="font-extrabold text-black">
                        #{order.orderNumber}
                      </span>
                    </div>

                    {/* Row 2: Payment Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-neutral-600 font-medium">
                        <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                          <HugeiconsIcon icon={CreditCardIcon} size={16} />
                        </div>
                        <span>Payment Status</span>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/50">
                        {order.paymentStatus === 'PAID' ? 'Paid' : 'Paid'}
                      </span>
                    </div>

                    {/* Row 3: Total Paid */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-neutral-600 font-medium">
                        <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold shrink-0">
                          ₹
                        </div>
                        <span>Total Paid</span>
                      </div>
                      <span className="font-extrabold text-black">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>

                    {/* Row 4: Estimated Delivery */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-neutral-600 font-medium">
                        <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                          <HugeiconsIcon icon={DeliveryTruck01Icon} size={16} />
                        </div>
                        <span>Estimated Delivery</span>
                      </div>
                      <span className="font-extrabold text-black">
                        3 - 5 Business Days
                      </span>
                    </div>
                  </div>

                  {/* Continue Shopping button */}
                  <div className="mt-6">
                    <Link
                      to="/"
                      className="w-full h-12 bg-black hover:bg-neutral-800 active:scale-[0.99] transition-all text-white rounded-full px-6 flex items-center justify-between font-bold text-sm cursor-pointer"
                    >
                      <span>Continue Shopping</span>
                      <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={2.5} />
                    </Link>
                  </div>
                </div>

                {/* Right Column: Order Summary (open, clean layout matching screenshot) */}
                <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 pt-1 lg:pt-0">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-black tracking-tight">
                      Order Summary
                    </h2>
                    <span className="text-xs sm:text-sm font-medium text-neutral-400">
                      ({order.items?.length || 0} items)
                    </span>
                  </div>

                  {/* Items list */}
                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-100">
                            <img
                              src={item.productImageUrl ?? PLACEHOLDER_PRODUCT_IMAGE}
                              alt={item.productName}
                              className="h-full w-full object-cover object-top"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-black truncate leading-tight">
                              {item.productName}
                            </p>
                            <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
                              {item.colorName} / {item.sizeCode || item.sizeName}
                            </p>
                            <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-black">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="border-t border-neutral-100 pt-4 space-y-2 text-xs sm:text-sm font-medium text-neutral-600">
                    <div className="flex justify-between items-center">
                      <span>Bag Total ({itemsCount} items)</span>
                      <span className="text-black font-semibold">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Delivery Fee</span>
                      <span className="text-black font-semibold">₹0</span>
                    </div>

                    <div className="flex justify-between items-center border-t border-neutral-100 pt-4 mt-4">
                      <span className="text-sm sm:text-base font-bold text-black">
                        Total Paid
                      </span>
                      <span className="text-lg sm:text-xl font-extrabold text-black tracking-tight">
                        {formatCurrency(order.totalAmount)}
                      </span>
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
