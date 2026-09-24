import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { LiquidButton } from '../components/LiquidButton'
import { Skeleton } from '../components/Skeleton'
import { getOrder } from '../services/order.service'
import { formatCurrency } from '../utils/formatCurrency'
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkCircle02Icon, Alert02Icon } from '@hugeicons/core-free-icons'

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId as string),
    enabled: Boolean(orderId),
  })

  // Scroll to top so the confirmation is immediately visible after redirect.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    window.scrollTo(0, 0)
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 sm:py-20 px-4">
        {isLoading || !mounted ? (
          /* Skeleton shaped like the confirmation card below */
          <div className="max-w-lg w-full text-center space-y-6">
            <Skeleton className="mx-auto h-20 w-20 rounded-full" />
            <div className="space-y-2 flex flex-col items-center">
              <Skeleton className="h-7 w-3/4 rounded" />
              <Skeleton className="h-3.5 w-full rounded" />
              <Skeleton className="h-3.5 w-2/3 rounded" />
            </div>
            <div className="rounded-2xl border border-black/10 bg-neutral-50 p-5 text-left space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-3.5 w-28 rounded" />
                  <Skeleton className="h-3.5 w-20 rounded" />
                </div>
              ))}
              <div className="border-t border-black/10 pt-3 space-y-2">
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-4/5 rounded" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        ) : isError || !order ? (
          <div className="max-w-md w-full text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-200">
              <HugeiconsIcon icon={Alert02Icon} size={32} />
            </div>
            <h1 className="text-2xl font-black text-black">Order not found</h1>
            <p className="text-sm text-black/50">We couldn't find that order.</p>
            <LiquidButton href="/" variant="primary" className="mx-auto">
              Continue Shopping
            </LiquidButton>
          </div>
        ) : (
          <div className="max-w-lg w-full text-center space-y-6 animate-fade-in-up">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={42} strokeWidth={2.4} />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-black">Order Placed Successfully!</h1>
              <p className="text-sm text-black/60 font-medium">
                Thank you for shopping with Kaira, {order.customerName.split(' ')[0]}. A confirmation has
                been sent to {order.customerEmail}.
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-neutral-50 p-5 text-left text-xs space-y-3">
              <div className="flex justify-between font-bold">
                <span className="text-black/60">Order Number</span>
                <span>{order.orderNumber}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-black/60">Payment Status</span>
                <span className={order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}>
                  {order.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-black/60">Total Paid</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-black/60">Estimated Delivery</span>
                <span>3 - 5 Business Days</span>
              </div>
              <div className="border-t border-black/10 pt-3 space-y-1.5">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-black/70">
                    <span>
                      {item.productName} ({item.colorName}/{item.sizeCode}) x{item.quantity}
                    </span>
                    <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <LiquidButton href="/" variant="primary" className="w-full justify-center">
              Continue Shopping
            </LiquidButton>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
