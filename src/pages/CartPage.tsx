import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { LiquidButton } from '../components/LiquidButton'
import { ProductDetailDrawer } from '../components/ProductDetailDrawer'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/formatCurrency'
import { PLACEHOLDER_PRODUCT_IMAGE } from '../hooks/queries'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Delete02Icon,
  ShoppingBag01Icon,
  SecurityCheckIcon,
  PackageIcon,
  RefreshIcon,
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
    <div className="min-h-screen bg-white text-black flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="py-6 sm:py-8 lg:py-10">
          <div className="kaira-container">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-black/40">Review Your Items</span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black tracking-tight mt-0.5">
                  Your Shopping Bag
                </h1>
              </div>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-black/50 hover:text-red-500 font-extrabold uppercase tracking-wider transition-colors cursor-pointer rounded-full border border-black/15 px-3 py-1.5"
                >
                  Clear Bag
                </button>
              )}
            </div>

            {items.length === 0 ? (
              /* Empty Bag State */
              <div className="rounded-3xl border border-black/10 bg-neutral-50/70 p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-5 my-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white border border-black/10 text-black/30 shadow-xs">
                  <HugeiconsIcon icon={ShoppingBag01Icon} size={30} />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-xl sm:text-2xl font-black text-black">Your bag is completely empty</h2>
                  <p className="text-xs sm:text-sm font-medium text-black/60 max-w-md mx-auto">
                    Explore our latest collection of luxury essentials, heavyweight tees, and oversized cuts.
                  </p>
                </div>
                <div className="pt-2">
                  <LiquidButton href="/" variant="primary" className="mx-auto">
                    Start Shopping
                  </LiquidButton>
                </div>
              </div>
            ) : (
              /* Two-Column Responsive Layout */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
                
                {/* Left Column: Cart Items List */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                  
                  {/* Items List */}
                  <div className="divide-y divide-black/10 rounded-3xl border border-black/10 bg-white overflow-hidden shadow-xs">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 sm:p-5 flex gap-3.5 sm:gap-6 items-start transition-colors hover:bg-neutral-50/50"
                      >
                        {/* Thumbnail Image */}
                        <Link
                          to={`/product/${item.productId}`}
                          className="relative h-24 w-20 sm:h-28 sm:w-24 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 border border-black/10 block group"
                        >
                          <img
                            src={item.image ?? PLACEHOLDER_PRODUCT_IMAGE}
                            alt={item.name}
                            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          />
                        </Link>

                        {/* Content Area */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch gap-2.5">
                          {/* Top Row: Title & Remove Button */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => setSelectedDrawerProductId(item.productId)}
                                className="block text-left text-sm sm:text-base font-extrabold text-black hover:opacity-75 transition-opacity line-clamp-1 cursor-pointer"
                              >
                                {item.name}
                              </button>
                              {item.subtitle && (
                                <p className="text-[11px] sm:text-xs font-semibold text-black/50 truncate">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>

                            {/* Top Right Quick Remove */}
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="p-1 text-black/40 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                              title="Remove item"
                              aria-label="Remove item"
                            >
                              <HugeiconsIcon icon={Delete02Icon} size={16} />
                            </button>
                          </div>

                          {/* Tags: Size & Color Swatch */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 font-bold text-black/80 border border-black/5">
                              Size: {item.size}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 font-bold text-black/80 border border-black/5">
                              <span
                                className="h-2 w-2 rounded-full border border-black/20"
                                style={{ backgroundColor: item.color.hex }}
                              />
                              {item.color.name}
                            </span>
                          </div>

                          {/* Bottom Row: Price on Left, Quantity Stepper on Right */}
                          <div className="flex items-center justify-between pt-1">
                            {/* Price */}
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base sm:text-lg font-black text-black">
                                {formatCurrency(item.price)}
                              </span>
                              {item.mrp > item.price && (
                                <span className="text-xs font-semibold text-black/40 line-through">
                                  {formatCurrency(item.mrp)}
                                </span>
                              )}
                            </div>

                            {/* Compact Quantity Stepper */}
                            <div className="inline-flex items-center rounded-full border border-black/15 bg-white p-0.5 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-black hover:bg-black/5 transition-colors font-bold text-xs cursor-pointer"
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
                                className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-black hover:bg-black/5 transition-colors font-bold text-xs cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-neutral-50/60 p-3.5">
                      <HugeiconsIcon icon={SecurityCheckIcon} size={20} className="text-black shrink-0" />
                      <div className="text-[11px]">
                        <p className="font-black text-black">100% Genuine</p>
                        <p className="text-black/50">Direct from studio</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-neutral-50/60 p-3.5">
                      <HugeiconsIcon icon={RefreshIcon} size={20} className="text-black shrink-0" />
                      <div className="text-[11px]">
                        <p className="font-black text-black">7-Day Free Returns</p>
                        <p className="text-black/50">Hassle-free pickups</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-neutral-50/60 p-3.5">
                      <HugeiconsIcon icon={PackageIcon} size={20} className="text-black shrink-0" />
                      <div className="text-[11px]">
                        <p className="font-black text-black">Express Delivery</p>
                        <p className="text-black/50">3-5 business days</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Order Summary Card (Sticky on Laptops & Desktops) */}
                <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-4">
                  <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-7 shadow-sm space-y-6">
                    <h2 className="text-xl font-black text-black tracking-tight border-b border-black/10 pb-4">
                      Order Summary
                    </h2>

                    {/* Price Breakdown */}
                    <div className="space-y-3 text-xs sm:text-sm font-semibold text-black/70">
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

                      {/* Total */}
                      <div className="flex justify-between items-baseline border-t border-black/10 pt-4 text-base sm:text-lg font-black text-black">
                        <span>Total Payable</span>
                        <span>{formatCurrency(finalTotal)}</span>
                      </div>
                      {totalDiscount > 0 && (
                        <p className="text-right text-[11px] font-extrabold text-emerald-600">
                          You save {formatCurrency(totalDiscount)} on this order
                        </p>
                      )}
                    </div>

                    {/* Checkout Button */}
                    <div className="pt-2">
                      <LiquidButton
                        onClick={() => navigate('/checkout')}
                        variant="primary"
                        className="w-full justify-center"
                      >
                        Proceed to Checkout
                      </LiquidButton>
                    </div>

                    <div className="text-center">
                      <Link
                        to="/"
                        className="text-xs font-extrabold text-black/60 hover:text-black underline underline-offset-4 transition-colors"
                      >
                        Or Continue Shopping
                      </Link>
                    </div>
                  </div>
                </div>

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
