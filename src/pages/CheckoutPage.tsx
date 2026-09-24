import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { SecurityCheckIcon } from '@hugeicons/core-free-icons'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { LiquidButton } from '../components/LiquidButton'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/formatCurrency'
import { PLACEHOLDER_PRODUCT_IMAGE } from '../hooks/queries'
import { openRazorpayCheckout } from '../utils/razorpay'
import { createOrder } from '../services/order.service'
import { createRazorpayOrder, verifyPayment } from '../services/payment.service'
import { getErrorMessage } from '../services/api'

const schema = z.object({
  customerName: z.string().min(1, 'Full name is required'),
  customerEmail: z.string().email('Enter a valid email'),
  customerPhone: z.string().min(10, 'Enter a valid phone number'),
  shippingAddress: z.string().min(10, 'Enter your complete delivery address'),
})

type CheckoutFormValues = z.infer<typeof schema>

export function CheckoutPage() {
  const navigate = useNavigate()
  const { items, cartCount, subtotal, totalDiscount, deliveryFee, finalTotal, clearCart } = useCart()
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({ resolver: zodResolver(schema) })

  if (items.length === 0) {
    return <Navigate to="/cart" replace />
  }

  async function onSubmit(values: CheckoutFormValues) {
    setIsPlacingOrder(true)
    try {
      // The server cart already stores real variant ids, so no client-side
      // re-resolution is needed here.
      const lineItems = items.map((item) => ({ variantId: item.variantId, quantity: item.quantity }))
      const order = await createOrder({ ...values, items: lineItems })
      const razorpayOrder = await createRazorpayOrder(order.id)

      await openRazorpayCheckout({
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Kaira',
        description: `Order ${razorpayOrder.orderNumber}`,
        order_id: razorpayOrder.razorpayOrderId,
        prefill: {
          name: values.customerName,
          email: values.customerEmail,
          contact: values.customerPhone,
        },
        theme: { color: '#000000' },
        handler: async (response) => {
          try {
            await verifyPayment(order.id, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            clearCart()
            navigate(`/order-confirmation/${order.id}`)
          } catch (err) {
            toast.error(getErrorMessage(err) || 'Payment verification failed. Please contact support.')
          } finally {
            setIsPlacingOrder(false)
          }
        },
        modal: {
          ondismiss: () => {
            setIsPlacingOrder(false)
            toast('Payment cancelled', {
              description: `Your order ${razorpayOrder.orderNumber} was saved — you can retry payment anytime.`,
            })
          },
        },
      })
    } catch (err) {
      setIsPlacingOrder(false)
      toast.error(err instanceof Error ? err.message : getErrorMessage(err) || 'Something went wrong')
    }
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="py-6 sm:py-8 lg:py-10">
          <div className="kaira-container">
            <div className="mb-6">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-black/40">
                Almost There
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black tracking-tight mt-0.5">
                Checkout
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
              {/* Left: Shipping form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="lg:col-span-7 xl:col-span-8 rounded-3xl border border-black/10 bg-white p-6 sm:p-7 shadow-xs space-y-5"
              >
                <h2 className="text-xl font-black text-black tracking-tight border-b border-black/10 pb-4">
                  Delivery Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-black/60">
                      Full Name
                    </label>
                    <input
                      {...register('customerName')}
                      className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm font-medium focus:border-black focus:outline-none"
                      placeholder="Jane Doe"
                    />
                    {errors.customerName && (
                      <p className="mt-1 text-xs text-red-500 font-semibold">{errors.customerName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-black/60">
                      Phone Number
                    </label>
                    <input
                      {...register('customerPhone')}
                      className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm font-medium focus:border-black focus:outline-none"
                      placeholder="98765 43210"
                    />
                    {errors.customerPhone && (
                      <p className="mt-1 text-xs text-red-500 font-semibold">{errors.customerPhone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-black/60">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...register('customerEmail')}
                    className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm font-medium focus:border-black focus:outline-none"
                    placeholder="jane@example.com"
                  />
                  {errors.customerEmail && (
                    <p className="mt-1 text-xs text-red-500 font-semibold">{errors.customerEmail.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-black/60">
                    Shipping Address
                  </label>
                  <textarea
                    rows={3}
                    {...register('shippingAddress')}
                    className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm font-medium focus:border-black focus:outline-none resize-none"
                    placeholder="House no, street, city, state, PIN code"
                  />
                  {errors.shippingAddress && (
                    <p className="mt-1 text-xs text-red-500 font-semibold">{errors.shippingAddress.message}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-neutral-50 border border-black/5 p-3.5 text-[11px] font-semibold text-black/60">
                  <HugeiconsIcon icon={SecurityCheckIcon} size={16} className="shrink-0" />
                  <span>Payments are securely processed by Razorpay. We never store your card details.</span>
                </div>

                <LiquidButton
                  type="submit"
                  variant="primary"
                  disabled={isPlacingOrder}
                  className="w-full justify-center"
                >
                  {isPlacingOrder ? 'Processing…' : `Pay ${formatCurrency(finalTotal)}`}
                </LiquidButton>
              </form>

              {/* Right: Order summary */}
              <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-4">
                <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-7 shadow-sm space-y-6">
                  <h2 className="text-xl font-black text-black tracking-tight border-b border-black/10 pb-4">
                    Order Summary
                  </h2>

                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 items-center">
                        <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100 border border-black/10">
                          <img
                            src={item.image ?? PLACEHOLDER_PRODUCT_IMAGE}
                            alt={item.name}
                            className="h-full w-full object-cover object-top"
                          />
                          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-black text-white">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-black line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-black/50 font-semibold">
                            {item.color.name} / {item.size}
                          </p>
                        </div>
                        <span className="text-xs font-black text-black shrink-0">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm font-semibold text-black/70 border-t border-black/10 pt-4">
                    <div className="flex justify-between">
                      <span>Bag Total ({cartCount} items)</span>
                      <span className="font-black text-black">{formatCurrency(subtotal + totalDiscount)}</span>
                    </div>
                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Bag Discount</span>
                        <span className="font-black">-{formatCurrency(totalDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className="font-black text-black">{formatCurrency(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between items-baseline border-t border-black/10 pt-4 text-base sm:text-lg font-black text-black">
                      <span>Total Payable</span>
                      <span>{formatCurrency(finalTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
