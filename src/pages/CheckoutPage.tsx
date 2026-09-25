import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  SecurityCheckIcon,
  CheckmarkCircle02Icon,
  UserIcon,
  CallIcon,
  Mail01Icon,
  Location01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useAddresses } from '../hooks/queries'
import { formatCurrency } from '../utils/formatCurrency'
import { PLACEHOLDER_PRODUCT_IMAGE } from '../hooks/queries'
import { openRazorpayCheckout } from '../utils/razorpay'
import { createOrder } from '../services/order.service'
import { createRazorpayOrder, verifyPayment } from '../services/payment.service'
import { getErrorMessage } from '../services/api'
import type { Address } from '../types'

const schema = z.object({
  customerName: z.string().min(1, 'Full name is required'),
  customerPhone: z.string().min(10, 'Enter a valid phone number'),
  shippingAddress: z.string().min(10, 'Enter your complete delivery address'),
})

type CheckoutFormValues = z.infer<typeof schema>

export function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items, cartCount, subtotal, totalDiscount, deliveryFee, finalTotal, clearCart } = useCart()
  const { data: savedAddresses } = useAddresses(Boolean(user))
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new' | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({ resolver: zodResolver(schema) })

  // Default to the most recently used saved address; fall back to the
  // editable "new address" form when the shopper has none saved yet.
  useEffect(() => {
    if (selectedAddressId !== null) return
    if (savedAddresses && savedAddresses.length > 0) {
      selectAddress(savedAddresses[0])
    } else if (savedAddresses) {
      setSelectedAddressId('new')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedAddresses])

  function selectAddress(address: Address) {
    setSelectedAddressId(address.id)
    setValue('customerName', address.name)
    setValue('customerPhone', address.phone)
    setValue('shippingAddress', address.shippingAddress)
  }

  function selectNewAddress() {
    setSelectedAddressId('new')
    setValue('customerName', '')
    setValue('customerPhone', '')
    setValue('shippingAddress', '')
  }

  const isUsingSavedAddress = selectedAddressId !== null && selectedAddressId !== 'new'

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
        name: 'Kaiira',
        description: `Order ${razorpayOrder.orderNumber}`,
        order_id: razorpayOrder.razorpayOrderId,
        prefill: {
          name: values.customerName,
          email: user?.email ?? '',
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
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
                Checkout
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1">
                Almost there! Complete your details to place your order.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Delivery Details card */}
              <div className="lg:col-span-7 rounded-2xl border border-black/10 bg-white p-6 sm:p-7 shadow-xs">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <h2 className="text-base sm:text-lg font-bold text-black border-b border-black/5 pb-3">
                    Delivery Details
                  </h2>

                  {/* Saved addresses picker if available */}
                  {savedAddresses && savedAddresses.length > 0 && (
                    <div className="space-y-2 pb-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-neutral-700">
                          Saved Addresses
                        </label>
                        {selectedAddressId !== 'new' && (
                          <button
                            type="button"
                            onClick={selectNewAddress}
                            className="text-xs font-bold text-black underline underline-offset-2 hover:opacity-75 cursor-pointer"
                          >
                            + Enter New Address
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {savedAddresses.map((address) => (
                          <button
                            key={address.id}
                            type="button"
                            onClick={() => selectAddress(address)}
                            className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer flex justify-between items-start ${
                              selectedAddressId === address.id
                                ? 'border-black bg-neutral-50'
                                : 'border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <p className="text-xs font-bold text-black truncate">{address.name}</p>
                              <p className="text-[11px] text-neutral-500 font-medium">{address.phone}</p>
                              <p className="text-[11px] text-neutral-600 line-clamp-2 mt-0.5">{address.shippingAddress}</p>
                            </div>
                            {selectedAddressId === address.id && (
                              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-black shrink-0 mt-0.5" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Full Name & Phone Number in 2-column grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                        Full Name
                      </label>
                      <div className="relative flex items-center">
                        <HugeiconsIcon
                          icon={UserIcon}
                          size={18}
                          className="absolute left-3.5 text-neutral-400 pointer-events-none"
                        />
                        <input
                          {...register('customerName')}
                          readOnly={isUsingSavedAddress}
                          className={`w-full h-11 rounded-xl border border-neutral-200 pl-10 pr-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black transition-colors ${
                            isUsingSavedAddress ? 'bg-neutral-50 cursor-not-allowed' : 'bg-white'
                          }`}
                          placeholder="Jane Doe"
                        />
                      </div>
                      {errors.customerName && (
                        <p className="mt-1 text-xs text-red-500 font-medium">{errors.customerName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative flex items-center">
                        <HugeiconsIcon
                          icon={CallIcon}
                          size={18}
                          className="absolute left-3.5 text-neutral-400 pointer-events-none"
                        />
                        <input
                          {...register('customerPhone')}
                          readOnly={isUsingSavedAddress}
                          className={`w-full h-11 rounded-xl border border-neutral-200 pl-10 pr-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black transition-colors ${
                            isUsingSavedAddress ? 'bg-neutral-50 cursor-not-allowed' : 'bg-white'
                          }`}
                          placeholder="98765 43210"
                        />
                      </div>
                      {errors.customerPhone && (
                        <p className="mt-1 text-xs text-red-500 font-medium">{errors.customerPhone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <HugeiconsIcon
                        icon={Mail01Icon}
                        size={18}
                        className="absolute left-3.5 text-neutral-400 pointer-events-none"
                      />
                      <input
                        type="email"
                        readOnly
                        value={user?.email ?? ''}
                        className="w-full h-11 rounded-xl border border-neutral-200 pl-10 pr-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 bg-neutral-50 cursor-not-allowed focus:outline-none"
                        placeholder="jane@example.com"
                      />
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                      Shipping Address
                    </label>
                    <div className="relative flex items-center">
                      <HugeiconsIcon
                        icon={Location01Icon}
                        size={18}
                        className="absolute left-3.5 text-neutral-400 pointer-events-none"
                      />
                      <input
                        {...register('shippingAddress')}
                        readOnly={isUsingSavedAddress}
                        className={`w-full h-11 rounded-xl border border-neutral-200 pl-10 pr-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black transition-colors ${
                          isUsingSavedAddress ? 'bg-neutral-50 cursor-not-allowed' : 'bg-white'
                        }`}
                        placeholder="House no, street, city, state, PIN code"
                      />
                    </div>
                    {errors.shippingAddress && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{errors.shippingAddress.message}</p>
                    )}
                  </div>

                  {/* Hidden inputs when using saved address so form validation and values pass cleanly */}
                  {isUsingSavedAddress && (
                    <>
                      <input type="hidden" {...register('customerName')} />
                      <input type="hidden" {...register('customerPhone')} />
                      <input type="hidden" {...register('shippingAddress')} />
                    </>
                  )}

                  {/* Security badge banner */}
                  <div className="flex items-center gap-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100 px-4 py-3 text-xs text-neutral-500">
                    <HugeiconsIcon icon={SecurityCheckIcon} size={17} className="shrink-0 text-neutral-400" />
                    <span>Payments are securely processed by Razorpay. We never store your card details.</span>
                  </div>

                  {/* Submit Button: Pay {finalTotal} with inner circular arrow button */}
                  <button
                    type="submit"
                    disabled={isPlacingOrder}
                    className="w-full h-12 bg-black hover:bg-neutral-800 active:scale-[0.99] transition-all text-white rounded-full pl-6 pr-2 flex items-center justify-between font-bold text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span>{isPlacingOrder ? 'Processing…' : `Pay ${formatCurrency(finalTotal)}`}</span>
                    <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shrink-0">
                      <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.5} />
                    </span>
                  </button>
                </form>
              </div>

              {/* Right Column: Order Summary (open, clean style matching screenshot) */}
              <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 pt-1 lg:pt-0">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-black tracking-tight">
                    Order Summary
                  </h2>
                  <span className="text-xs sm:text-sm font-medium text-neutral-400">
                    ({cartCount} items)
                  </span>
                </div>

                {/* Items list */}
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-100">
                          <img
                            src={item.image ?? PLACEHOLDER_PRODUCT_IMAGE}
                            alt={item.name}
                            className="h-full w-full object-cover object-top"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-black truncate leading-tight">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
                            {item.color.name} / {item.size}
                          </p>
                          <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                            {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs sm:text-sm font-bold text-black">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Breakdown */}
                <div className="border-t border-neutral-100 pt-4 space-y-2 text-xs sm:text-sm font-medium text-neutral-600">
                  <div className="flex justify-between items-center">
                    <span>Bag Total ({cartCount} items)</span>
                    <span className="text-black font-semibold">
                      {formatCurrency(subtotal + totalDiscount)}
                    </span>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-medium">
                      <span>Bag Discount</span>
                      <span className="font-semibold">-{formatCurrency(totalDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span>Delivery Fee</span>
                    <span className="text-black font-semibold">
                      {deliveryFee === 0 ? '₹0' : formatCurrency(deliveryFee)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t border-neutral-100 pt-4 mt-4">
                    <span className="text-sm sm:text-base font-bold text-black">
                      Total Payable
                    </span>
                    <span className="text-lg sm:text-xl font-extrabold text-black tracking-tight">
                      {formatCurrency(finalTotal)}
                    </span>
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
