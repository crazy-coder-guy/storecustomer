import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { ProductDetailDrawer } from '../components/ProductDetailDrawer'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/formatCurrency'
import { PLACEHOLDER_PRODUCT_IMAGE } from '../hooks/queries'
import { Reveal } from '../components/Reveal'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Delete02Icon,
  ShoppingBag01Icon,
  SecurityCheckIcon,
  DeliveryTruck01Icon,
  RefreshIcon,
  CustomerService01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Tag01Icon,
} from '@hugeicons/core-free-icons'

export function CartPage() {
  const navigate = useNavigate()
  const {
    items,
    cartCount,
    subtotal,
    totalDiscount,
    deliveryFee,
    finalTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart()

  const [selectedDrawerProductId, setSelectedDrawerProductId] = useState<string | null>(null)



  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between selection:bg-black selection:text-white font-sans">
      <div>
        <Navbar />

        <main className="py-6 sm:py-8 pb-28 lg:pb-8">
          <div className="kaira-container max-w-7xl mx-auto px-4 sm:px-6">
            
            {/* Header: Title with count & Review text, Clear Bag on top right */}
            <Reveal animation="fade-down" duration={500}>
              <div className="flex items-start justify-between pb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-tight">
                    Your Shopping Bag ({cartCount})
                  </h1>
                  <p className="text-xs sm:text-sm font-semibold text-black/50 mt-1">
                    Review your items and proceed to checkout
                  </p>
                </div>

                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-neutral-50 hover:bg-black hover:text-white px-3.5 py-1.5 text-xs font-bold text-black transition-all cursor-pointer shadow-2xs active:scale-95 group"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={14} className="text-black/60 group-hover:text-white transition-colors" />
                    <span className="tracking-wider text-[11px]">CLEAR BAG</span>
                  </button>
                )}
              </div>
            </Reveal>

            {items.length === 0 ? (
              /* Empty Bag State */
              <div className="rounded-3xl border border-black/10 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 my-8">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 border border-black/10 text-black/40">
                  <HugeiconsIcon icon={ShoppingBag01Icon} size={28} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-black">Your bag is completely empty</h2>
                  <p className="text-xs sm:text-sm font-semibold text-black/55 max-w-sm mx-auto">
                    Explore our latest collection of heavyweight essentials and oversized apparel.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center rounded-full bg-black px-6 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 transition-all"
                  >
                    Start Shopping
                  </Link>
                </div>
              </div>
            ) : (
              /* Two-Column Responsive Layout with compact gaps and streamlined styling */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
                
                {/* Left Column: Cart Items List */}
                <div className="lg:col-span-7 xl:col-span-8 divide-y divide-black/10">
                  {items.map((item, idx) => {
                    const hasDiscount = item.mrp && item.mrp > item.price
                    const discountPercent = hasDiscount
                      ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
                      : 0

                    return (
                      <Reveal
                        key={item.id}
                        animation="fade-up"
                        delay={Math.min(idx * 50, 200)}
                        duration={500}
                      >
                        <div className="py-4 sm:py-6 px-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 sm:gap-4">
                          
                          {/* 1. Left: Product Image & Details */}
                          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                            {/* Product Image */}
                            <Link
                              to={`/product/${item.productId}`}
                              className="relative h-20 w-16 sm:h-24 sm:w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100 border border-black/10 block group shadow-2xs"
                            >
                              <img
                                src={item.image ?? PLACEHOLDER_PRODUCT_IMAGE}
                                alt={item.name}
                                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                              />
                            </Link>

                            {/* Info */}
                            <div className="min-w-0 flex-1 space-y-1">
                              {/* Title */}
                              <button
                                type="button"
                                onClick={() => setSelectedDrawerProductId(item.productId)}
                                className="block text-left text-sm sm:text-lg font-black text-black hover:opacity-75 transition-opacity truncate leading-snug cursor-pointer"
                              >
                                {item.name}
                              </button>

                              {/* Category Subtitle */}
                              <p className="text-[11px] sm:text-xs font-semibold text-black/50">
                                {item.subtitle || 'Oversized'}
                              </p>

                              {/* Size & Color Pills */}
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
                                {/* Size pill */}
                                <span className="inline-flex items-center rounded-full border border-black/15 bg-neutral-50 px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-black">
                                  Size: {item.size}
                                </span>

                                {/* Color pill */}
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-neutral-50 px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-black">
                                  <span
                                    className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full border border-black/20"
                                    style={{ backgroundColor: item.color.hex || '#000' }}
                                  />
                                  <span>{item.color.name || 'Black'}</span>
                                </span>

                                {/* In Stock status */}
                                <span className="inline-flex items-center gap-1 pl-1 text-[10px] sm:text-[11px] font-bold text-black">
                                  <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
                                  <span>In Stock</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 2. Middle & Right: Compact Stepper + Price + Trash */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 shrink-0 pl-19.5 sm:pl-0">
                            
                            {/* Stepper */}
                            <div className="inline-flex items-center rounded-full border border-black/20 bg-white p-0.5 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-black hover:bg-black/5 transition-colors font-bold text-xs sm:text-sm cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                -
                              </button>
                              <span className="w-6 sm:w-7 text-center text-xs font-black text-black">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-black hover:bg-black/5 transition-colors font-bold text-xs sm:text-sm cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>

                            {/* Price Breakdown */}
                            <div className="text-right">
                              <div className="flex items-baseline gap-1.5 justify-end flex-wrap">
                                <span className="text-sm sm:text-lg font-black text-black">
                                  {formatCurrency(item.price)}
                                </span>
                                {hasDiscount && (
                                  <span className="text-[11px] sm:text-xs font-semibold text-black/40 line-through">
                                    {formatCurrency(item.mrp)}
                                  </span>
                                )}
                                {discountPercent > 0 && (
                                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide text-red-600">
                                    {discountPercent}% OFF
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Delete trash button */}
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="text-black/35 hover:text-red-600 transition-colors p-1.5 rounded-full cursor-pointer hover:bg-neutral-100"
                              title="Remove item"
                              aria-label="Remove item"
                            >
                              <HugeiconsIcon icon={Delete02Icon} size={16} />
                            </button>
                          </div>

                        </div>
                      </Reveal>
                    )
                  })}
                </div>

                {/* Right Column: Unified Seamless Summary (No nested card boxes) */}
                <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
                  <Reveal animation="fade-left" duration={600}>
                    <div className="space-y-5 lg:pl-6">
                      
                      {/* Section Title */}
                      <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                        Order Summary
                      </h2>

                      {/* Line Breakdown without card borders */}
                      <div className="space-y-3.5 text-sm font-semibold text-black/65">
                        <div className="flex justify-between items-center">
                          <span>Subtotal ({cartCount} items)</span>
                          <span className="font-bold text-base text-black">{formatCurrency(subtotal + totalDiscount)}</span>
                        </div>

                        {totalDiscount > 0 && (
                          <div className="flex justify-between items-center text-black">
                            <span className="font-semibold">Discount</span>
                            <span className="font-black text-base">-{formatCurrency(totalDiscount)}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <span>Delivery Fee</span>
                          <span className="font-bold text-base text-black">
                            {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
                          </span>
                        </div>

                        {/* Total Payable */}
                        <div className="flex justify-between items-baseline border-t border-b border-black/10 py-3.5 text-lg sm:text-xl font-black text-black">
                          <span>Total Payable</span>
                          <span>{formatCurrency(finalTotal)}</span>
                        </div>
                      </div>

                      {/* Premium Green Savings Pill */}
                      {totalDiscount > 0 && (
                        <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 flex items-center gap-2.5 text-xs sm:text-sm font-bold text-emerald-800 shadow-2xs">
                          <HugeiconsIcon icon={Tag01Icon} size={18} className="text-emerald-700 shrink-0" />
                          <span>You're saving {formatCurrency(totalDiscount)} on this order!</span>
                        </div>
                      )}

                      {/* Proceed to Checkout Button & Continue Shopping */}
                      <div className="space-y-3 pt-1">
                        <button
                          type="button"
                          onClick={() => navigate('/checkout')}
                          className="w-full flex items-center justify-between rounded-full bg-black py-2.5 pl-6 pr-2 text-sm sm:text-base font-extrabold text-white hover:bg-neutral-800 transition-all shadow-md active:scale-98 cursor-pointer"
                        >
                          <span>Proceed to Checkout</span>
                          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white text-black shadow-xs">
                            <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.5} />
                          </div>
                        </button>

                        <div className="text-center">
                          <Link
                            to="/"
                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-black/60 hover:text-black transition-colors"
                          >
                            <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
                            <span>Continue Shopping</span>
                          </Link>
                        </div>
                      </div>

                      {/* Trust Features seamlessly below */}
                      <div className="pt-5 border-t border-black/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="space-y-1">
                          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-black">
                            <HugeiconsIcon icon={DeliveryTruck01Icon} size={16} />
                          </div>
                          <p className="text-xs font-black text-black">Free Shipping</p>
                          <p className="text-[10px] text-black/50">Orders &gt; ₹1,999</p>
                        </div>

                        <div className="space-y-1">
                          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-black">
                            <HugeiconsIcon icon={RefreshIcon} size={16} />
                          </div>
                          <p className="text-xs font-black text-black">7-Day Returns</p>
                          <p className="text-[10px] text-black/50">Hassle free</p>
                        </div>

                        <div className="space-y-1">
                          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-black">
                            <HugeiconsIcon icon={SecurityCheckIcon} size={16} />
                          </div>
                          <p className="text-xs font-black text-black">Secure Payment</p>
                          <p className="text-[10px] text-black/50">100% secure</p>
                        </div>

                        <div className="space-y-1">
                          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-black">
                            <HugeiconsIcon icon={CustomerService01Icon} size={16} />
                          </div>
                          <p className="text-xs font-black text-black">24/7 Support</p>
                          <p className="text-[10px] text-black/50">We're here</p>
                        </div>
                      </div>

                    </div>
                  </Reveal>
                </div>

                {/* Floating Bottom Bar for Mobile View */}
                {items.length > 0 && (
                  <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-black/10 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                    <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
                      <div>
                        <span className="block text-[10px] font-bold text-black/50 uppercase tracking-wider">
                          Total Payable
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-black text-black">
                            {formatCurrency(finalTotal)}
                          </span>
                          {totalDiscount > 0 && (
                            <span className="text-[10px] font-bold text-emerald-700">
                              (Save {formatCurrency(totalDiscount)})
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate('/checkout')}
                        className="flex-1 max-w-[210px] flex items-center justify-between rounded-full bg-black py-2 pl-4 pr-1.5 text-xs sm:text-sm font-extrabold text-white active:scale-95 transition-all shadow-md cursor-pointer"
                      >
                        <span>Proceed to Pay</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-xs">
                          <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2.5} />
                        </div>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />

      {/* Slide-over Product Details Drawer */}
      <ProductDetailDrawer
        productId={selectedDrawerProductId}
        isOpen={Boolean(selectedDrawerProductId)}
        onClose={() => setSelectedDrawerProductId(null)}
      />
    </div>
  )
}

