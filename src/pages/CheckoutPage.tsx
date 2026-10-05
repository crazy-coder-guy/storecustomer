import { useEffect, useRef, useState } from 'react'
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
  Loading03Icon,
} from '@hugeicons/core-free-icons'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatSizeCode } from '../utils/formatSize'
import { useAddresses } from '../hooks/queries'
import { formatCurrency } from '../utils/formatCurrency'
import { PLACEHOLDER_PRODUCT_IMAGE } from '../hooks/queries'
import { openRazorpayCheckout } from '../utils/razorpay'
import { cancelOrder, createOrder, syncPaymentStatus } from '../services/order.service'
import { createRazorpayOrder, verifyPayment } from '../services/payment.service'
import { lookupPincode } from '../services/pincode.service'
import { getErrorMessage } from '../services/api'
import { useSeoMeta } from '../hooks/useSeoMeta'
import { trackPixelEvent } from '../lib/metaPixel'
import type { Address } from '../types'

const schema = z.object({
  customerName: z.string().min(1, 'Full name is required'),
  customerPhone: z.string().min(10, 'Enter a valid phone number'),
  doorNumber: z.string().min(1, 'House / door number is required'),
  streetName: z.string().min(1, 'Street / area name is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
})

type CheckoutFormValues = z.infer<typeof schema>

/** Falls back to the legacy single-line address for any address saved
 *  before structured fields existed. */
function addressSummaryLine(address: Address) {
  if (address.doorNumber && address.streetName && address.city) {
    return `${address.doorNumber}, ${address.streetName}, ${address.city}${address.pincode ? ` - ${address.pincode}` : ''}`
  }
  return address.shippingAddress
}

// Survives a full page reload (unlike component state) — if the customer
// reloads or closes the tab mid-payment, the success callback never runs,
// so on the next visit to /checkout this is how we know an order is still
// in flight and needs to be resolved (confirmed paid, or abandoned) before
// starting a fresh one.
const PENDING_ORDER_KEY = 'kaiira_pending_order_id'

export function CheckoutPage() {
  useSeoMeta({ title: 'Checkout', robots: 'noindex, nofollow' })

  const navigate = useNavigate()
  const { user } = useAuth()
  const { items, cartCount, subtotal, totalDiscount, deliveryFee, finalTotal, couponCode, couponDiscount, clearCart } =
    useCart()
  const { data: savedAddresses } = useAddresses(Boolean(user))
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [isResumingOrder, setIsResumingOrder] = useState(true)
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new' | null>(null)

  // On arriving at checkout (including a fresh reload), resolve any order
  // left behind by a previous attempt that never got to the success/dismiss
  // callback — if Razorpay actually captured it, go straight to the
  // confirmation page instead of letting the customer pay twice; otherwise
  // cancel the abandoned attempt so it doesn't linger as a dead order.
  useEffect(() => {
    const pendingOrderId = localStorage.getItem(PENDING_ORDER_KEY)
    if (!pendingOrderId) {
      setIsResumingOrder(false)
      return
    }
    syncPaymentStatus(pendingOrderId)
      .then((order) => {
        localStorage.removeItem(PENDING_ORDER_KEY)
        if (order.paymentStatus === 'PAID') {
          clearCart()
          navigate(`/order-confirmation/${order.id}`, { replace: true })
          return
        }
        cancelOrder(pendingOrderId).catch(() => {})
      })
      .catch(() => localStorage.removeItem(PENDING_ORDER_KEY))
      .finally(() => setIsResumingOrder(false))
    // Only ever check the one pending id found on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({ resolver: zodResolver(schema) })

  const [isLookingUpPincode, setIsLookingUpPincode] = useState(false)
  const pincodeLookupSeq = useRef(0)
  const watchedPincode = watch('pincode')

  // Looks up city/state as soon as a valid 6-digit pincode is typed — the
  // shopper only has to type the number once, not retype their city/state.
  // A sequence guard discards a stale response if they keep editing digits
  // before the first lookup returns.
  useEffect(() => {
    if (!watchedPincode || !/^\d{6}$/.test(watchedPincode)) return
    const seq = ++pincodeLookupSeq.current
    setIsLookingUpPincode(true)
    lookupPincode(watchedPincode)
      .then((result) => {
        if (seq !== pincodeLookupSeq.current) return
        setValue('city', result.city, { shouldValidate: true })
        setValue('state', result.state, { shouldValidate: true })
      })
      .catch(() => {
        // An unrecognized pincode just means the shopper fills city/state
        // in by hand — not worth interrupting checkout with an error toast.
      })
      .finally(() => {
        if (seq === pincodeLookupSeq.current) setIsLookingUpPincode(false)
      })
  }, [watchedPincode, setValue])

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
    setValue('doorNumber', address.doorNumber ?? '')
    setValue('streetName', address.streetName ?? '')
    setValue('pincode', address.pincode ?? '')
    setValue('city', address.city ?? '')
    setValue('state', address.state ?? '')
  }

  function selectNewAddress() {
    setSelectedAddressId('new')
    setValue('customerName', '')
    setValue('customerPhone', '')
    setValue('doorNumber', '')
    setValue('streetName', '')
    setValue('pincode', '')
    setValue('city', '')
    setValue('state', '')
  }

  const isUsingSavedAddress = selectedAddressId !== null && selectedAddressId !== 'new'

  const hasStockIssue = items.some((item) => item.stockQuantity === 0 || item.quantity > item.stockQuantity)

  // Fires once the checkout page is actually usable (not mid-resume, cart
  // intact) — not on every re-render as the form state changes.
  const hasFiredInitiateCheckout = useRef(false)
  useEffect(() => {
    if (hasFiredInitiateCheckout.current) return
    if (isResumingOrder || items.length === 0 || hasStockIssue) return
    hasFiredInitiateCheckout.current = true
    trackPixelEvent('InitiateCheckout', {
      content_ids: items.map((item) => item.variantId),
      num_items: cartCount,
      value: finalTotal,
      currency: 'INR',
    })
  }, [isResumingOrder, items, hasStockIssue, cartCount, finalTotal])

  // Block the form while we resolve a leftover order from a previous,
  // interrupted checkout attempt — otherwise a reload mid-payment could let
  // the customer submit a second order before we know the first one's fate.
  if (isResumingOrder) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col justify-between">
        <div>
          <Navbar />
          <main className="py-24 flex items-center justify-center">
            <p className="text-sm font-semibold text-black/50">Checking your last payment attempt…</p>
          </main>
        </div>
        <Footer />
      </div>
    )
  }

  if (items.length === 0 || hasStockIssue) {
    return <Navigate to="/cart" replace />
  }

  async function onSubmit(values: CheckoutFormValues) {
    setIsPlacingOrder(true)
    // Set once the order exists, so a failure/cancel anywhere after this
    // point can clean it up instead of leaving a dead PENDING/UNPAID order
    // behind for every retried checkout attempt.
    let createdOrderId: string | null = null
    try {
      // The server cart already stores real variant ids, so no client-side
      // re-resolution is needed here.
      const lineItems = items.map((item) => ({ variantId: item.variantId, quantity: item.quantity }))
      const order = await createOrder({ ...values, items: lineItems, couponCode: couponCode ?? undefined })
      createdOrderId = order.id
      // Persisted so a reload before the success/dismiss callback fires
      // (the exact gap where "payment went through but the order never
      // updated" happens) can still be resolved — see the resume effect above.
      localStorage.setItem(PENDING_ORDER_KEY, order.id)
      const razorpayOrder = await createRazorpayOrder(order.id)
      trackPixelEvent('AddPaymentInfo', {
        content_ids: items.map((item) => item.variantId),
        num_items: cartCount,
        value: finalTotal,
        currency: 'INR',
      })

      // Build dynamic description showing the exact items/garments being purchased
      const itemsSummary = items
        .map((item) => `${item.name}${item.size ? ` (${item.size})` : ''} x${item.quantity}`)
        .join(', ')
      const purchaseDescription =
        itemsSummary.length > 80
          ? `${itemsSummary.slice(0, 77)}...`
          : itemsSummary || `Order ${razorpayOrder.orderNumber}`

      await openRazorpayCheckout({
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'KAIIRA',
        description: purchaseDescription,
        image: 'https://kaiira.in/icon-512.png',
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
            localStorage.removeItem(PENDING_ORDER_KEY)
            trackPixelEvent('Purchase', {
              content_ids: items.map((item) => item.variantId),
              num_items: cartCount,
              value: finalTotal,
              currency: 'INR',
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
            // Razorpay can fire `ondismiss` even once a payment briefly
            // succeeded (e.g. the handler callback hadn't run yet) — check
            // directly with Razorpay before assuming this was really a
            // cancellation, so a payment that actually went through never
            // gets its order cancelled out from under it.
            syncPaymentStatus(order.id)
              .then((synced) => {
                localStorage.removeItem(PENDING_ORDER_KEY)
                if (synced.paymentStatus === 'PAID') {
                  clearCart()
                  navigate(`/order-confirmation/${order.id}`)
                  return
                }
                void cancelOrder(order.id).catch(() => {})
                toast('Payment cancelled', {
                  description: `Order ${razorpayOrder.orderNumber} wasn't placed — your bag is unchanged, retry whenever you're ready.`,
                })
              })
              .catch(() => {
                localStorage.removeItem(PENDING_ORDER_KEY)
                void cancelOrder(order.id).catch(() => {})
              })
          },
        },
      })
    } catch (err) {
      setIsPlacingOrder(false)
      // The order itself was created but something after that (getting a
      // Razorpay order, opening the checkout modal) failed — cancel it so
      // retrying doesn't pile up another dead PENDING/UNPAID order.
      if (createdOrderId) {
        localStorage.removeItem(PENDING_ORDER_KEY)
        void cancelOrder(createdOrderId).catch(() => {})
      }
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
                Complete your details to place your order.
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
                              <p className="text-[11px] text-neutral-600 line-clamp-2 mt-0.5">{addressSummaryLine(address)}</p>
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

                  {/* House/Door Number & Street */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                        House / Door No. &amp; Building
                      </label>
                      <div className="relative flex items-center">
                        <HugeiconsIcon
                          icon={Location01Icon}
                          size={18}
                          className="absolute left-3.5 text-neutral-400 pointer-events-none"
                        />
                        <input
                          {...register('doorNumber')}
                          readOnly={isUsingSavedAddress}
                          className={`w-full h-11 rounded-xl border border-neutral-200 pl-10 pr-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black transition-colors ${
                            isUsingSavedAddress ? 'bg-neutral-50 cursor-not-allowed' : 'bg-white'
                          }`}
                          placeholder="44/1, Shree Apartments"
                        />
                      </div>
                      {errors.doorNumber && (
                        <p className="mt-1 text-xs text-red-500 font-medium">{errors.doorNumber.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                        Street / Area Name
                      </label>
                      <div className="relative flex items-center">
                        <input
                          {...register('streetName')}
                          readOnly={isUsingSavedAddress}
                          className={`w-full h-11 rounded-xl border border-neutral-200 px-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black transition-colors ${
                            isUsingSavedAddress ? 'bg-neutral-50 cursor-not-allowed' : 'bg-white'
                          }`}
                          placeholder="Pilliyar Kovil Street, Rangapuram"
                        />
                      </div>
                      {errors.streetName && (
                        <p className="mt-1 text-xs text-red-500 font-medium">{errors.streetName.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Pincode, City & State */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                        Pincode
                      </label>
                      <div className="relative flex items-center">
                        <input
                          {...register('pincode')}
                          inputMode="numeric"
                          maxLength={6}
                          readOnly={isUsingSavedAddress}
                          className={`w-full h-11 rounded-xl border border-neutral-200 px-3.5 pr-9 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black transition-colors ${
                            isUsingSavedAddress ? 'bg-neutral-50 cursor-not-allowed' : 'bg-white'
                          }`}
                          placeholder="636004"
                        />
                        {isLookingUpPincode && (
                          <HugeiconsIcon
                            icon={Loading03Icon}
                            size={16}
                            className="absolute right-3 text-neutral-400 animate-spin pointer-events-none"
                          />
                        )}
                      </div>
                      {errors.pincode && (
                        <p className="mt-1 text-xs text-red-500 font-medium">{errors.pincode.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                        City
                      </label>
                      <input
                        {...register('city')}
                        readOnly={isUsingSavedAddress}
                        className={`w-full h-11 rounded-xl border border-neutral-200 px-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black transition-colors ${
                          isUsingSavedAddress ? 'bg-neutral-50 cursor-not-allowed' : 'bg-white'
                        }`}
                        placeholder="Auto-filled from pincode"
                      />
                      {errors.city && <p className="mt-1 text-xs text-red-500 font-medium">{errors.city.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                        State
                      </label>
                      <input
                        {...register('state')}
                        readOnly={isUsingSavedAddress}
                        className={`w-full h-11 rounded-xl border border-neutral-200 px-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black transition-colors ${
                          isUsingSavedAddress ? 'bg-neutral-50 cursor-not-allowed' : 'bg-white'
                        }`}
                        placeholder="Auto-filled from pincode"
                      />
                      {errors.state && <p className="mt-1 text-xs text-red-500 font-medium">{errors.state.message}</p>}
                    </div>
                  </div>

                  {/* Hidden inputs when using saved address so form validation and values pass cleanly */}
                  {isUsingSavedAddress && (
                    <>
                      <input type="hidden" {...register('customerName')} />
                      <input type="hidden" {...register('customerPhone')} />
                      <input type="hidden" {...register('doorNumber')} />
                      <input type="hidden" {...register('streetName')} />
                      <input type="hidden" {...register('pincode')} />
                      <input type="hidden" {...register('city')} />
                      <input type="hidden" {...register('state')} />
                    </>
                  )}

                  {/* Security badge banner */}
                  <div className="flex items-center gap-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100 px-4 py-3 text-xs text-neutral-500">
                    <HugeiconsIcon icon={SecurityCheckIcon} size={17} className="shrink-0 text-neutral-400" />
                    <span>Payments are securely processed by Razorpay. We never store your card details.</span>
                  </div>

                  {/* Submit Button: Pay {finalTotal} with inner arrow button */}
                  <button
                    type="submit"
                    disabled={isPlacingOrder}
                    className="w-full h-12 bg-black hover:bg-neutral-800 active:scale-[0.99] transition-all text-white rounded-2xl pl-6 pr-2.5 flex items-center justify-between font-bold text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                  >
                    <span>{isPlacingOrder ? 'Processing…' : `Pay ${formatCurrency(finalTotal)}`}</span>
                    <span className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center shrink-0">
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
                            {item.color ? `${item.color.name} / ` : ''}{formatSizeCode(item.size)}
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

                  {couponDiscount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-medium">
                      <span>Coupon ({couponCode})</span>
                      <span className="font-semibold">-{formatCurrency(couponDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span>Delivery Fee</span>
                    <span className="text-black font-semibold">
                      {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
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
