import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  PackageIcon,
  ArrowRight01Icon,
  Search01Icon,
  Download01Icon,
  GoogleIcon,
  ShoppingBag01Icon,
  CheckmarkCircle02Icon,
  DeliveryTruck01Icon,
  Clock01Icon,
  Cancel01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  StarIcon,
} from '@hugeicons/core-free-icons'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { LiquidButton } from '../components/LiquidButton'
import { WriteReviewModal } from '../components/WriteReviewModal'
import { useAuth } from '../context/AuthContext'
import { useReviewableProducts } from '../hooks/queries'
import { listMyOrders } from '../services/order.service'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import { openPrintableInvoice } from '../utils/invoice'
import type { Order, OrderStatus } from '../types'

type FilterTab = 'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED'

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

export function OrdersPage() {
  const { user, isLoading: authLoading, signInWithGoogle } = useAuth()
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({})
  const [reviewTarget, setReviewTarget] = useState<{
    productId: string
    orderId: string
    productName: string
    productImage: string | null
  } | null>(null)

  const { data: reviewableProducts = [] } = useReviewableProducts(Boolean(user))
  const reviewableProductIds = useMemo(
    () => new Set(reviewableProducts.map((r) => r.productId)),
    [reviewableProducts]
  )

  function toggleOrderExpand(orderId: string) {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }))
  }

  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['orders', 'mine', user?.uid],
    queryFn: listMyOrders,
    enabled: Boolean(user),
  })

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

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (activeTab === 'ACTIVE') {
        if (!['PENDING', 'PROCESSING', 'SHIPPED'].includes(order.status)) return false
      } else if (activeTab === 'DELIVERED') {
        if (order.status !== 'DELIVERED') return false
      } else if (activeTab === 'CANCELLED') {
        if (order.status !== 'CANCELLED') return false
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchesOrderNumber = order.orderNumber.toLowerCase().includes(query)
        const matchesItem = order.items?.some(
          (item) =>
            item.productName.toLowerCase().includes(query) ||
            item.colorName.toLowerCase().includes(query) ||
            item.sizeCode.toLowerCase().includes(query)
        )
        return matchesOrderNumber || matchesItem
      }

      return true
    })
  }, [orders, activeTab, searchQuery])

  // Download / Print Order Receipt / Invoice Summary with Garment Images
  function handleDownloadInvoice(e: React.MouseEvent, order: Order) {
    e.preventDefault()
    e.stopPropagation()
    openPrintableInvoice(order)
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between font-sans">
      <div>
        <Navbar />

        <main className="py-6 sm:py-10">
          <div className="kaira-container max-w-5xl mx-auto px-4 sm:px-6">

            {/* Top Section: Category Eyebrow, Title & Subtitle matching ProductDetailPage */}
            <div className="space-y-4 pb-6 border-b border-black/10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-black/50">
                    Order History
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight leading-tight">
                  My Orders
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-black/60">
                  Review purchase history, status milestones, and product details.
                </p>
              </div>

              {/* Status Tabs directly at the top with Search */}
              {user && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  {/* Status Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {(
                      [
                        { id: 'ALL', label: 'All Orders', count: orders.length },
                        {
                          id: 'ACTIVE',
                          label: 'Active & In Transit',
                          count: orders.filter((o) =>
                            ['PENDING', 'PROCESSING', 'SHIPPED'].includes(o.status)
                          ).length,
                        },
                        {
                          id: 'DELIVERED',
                          label: 'Delivered',
                          count: orders.filter((o) => o.status === 'DELIVERED').length,
                        },
                        {
                          id: 'CANCELLED',
                          label: 'Cancelled',
                          count: orders.filter((o) => o.status === 'CANCELLED').length,
                        },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold uppercase transition-all whitespace-nowrap cursor-pointer ${activeTab === tab.id
                            ? 'bg-black text-white shadow-md'
                            : 'bg-white border border-black/20 text-black hover:border-black'
                          }`}
                      >
                        <span>{tab.label}</span>
                        <span
                          className={`rounded-2xl px-1.5 py-0.2 text-[10px] font-black ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-black/10 text-black/70'
                            }`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Search within orders */}
                  <div className="relative min-w-[240px]">
                    <HugeiconsIcon
                      icon={Search01Icon}
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none"
                    />
                    <input
                      type="text"
                      placeholder="Search order # or item name…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-black/20 bg-white pl-9 pr-8 py-2.5 text-xs font-semibold text-black placeholder:text-black/40 focus:border-black focus:outline-none transition-colors"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Content Body */}
            {authLoading || isLoading ? (
              /* Loading Skeletons */
              <div className="py-8 divide-y divide-black/10">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="py-6 space-y-4 animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-48 rounded bg-neutral-100" />
                      <div className="h-6 w-24 rounded-2xl bg-neutral-100" />
                    </div>
                    <div className="h-20 rounded-xl bg-neutral-50" />
                  </div>
                ))}
              </div>
            ) : !user ? (
              /* Signed-out state */
              <div className="my-14 rounded-3xl border border-black/10 bg-neutral-50/60 p-8 sm:p-14 text-center max-w-xl mx-auto space-y-6">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white border border-black/10 text-black/50 shadow-2xs">
                  <HugeiconsIcon icon={PackageIcon} size={36} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight leading-tight">
                    Sign in to view orders
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold text-black/60 max-w-sm mx-auto leading-relaxed">
                    Your order history, shipping progress, and invoices are securely tied to your Google account.
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
            ) : isError ? (
              /* Error State */
              <div className="my-14 rounded-3xl border border-rose-200 bg-rose-50/40 p-8 sm:p-12 text-center max-w-md mx-auto space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <HugeiconsIcon icon={Cancel01Icon} size={26} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-black">Couldn't load your orders</h2>
                  <p className="text-xs sm:text-sm font-semibold text-black/60">
                    We encountered an issue synchronizing your order history.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-2 rounded-2xl border border-black bg-black px-5 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 transition-all cursor-pointer"
                >
                  <span>Try Again</span>
                </button>
              </div>
            ) : orders.length === 0 ? (
              /* Empty Orders State */
              <div className="my-14 rounded-3xl border border-black/10 bg-neutral-50/60 p-8 sm:p-16 text-center max-w-xl mx-auto space-y-6">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white border border-black/10 text-black/40 shadow-2xs">
                  <HugeiconsIcon icon={ShoppingBag01Icon} size={36} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight leading-tight">
                    No orders placed yet
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold text-black/60 max-w-md mx-auto leading-relaxed">
                    Explore our collection of heavyweight essentials and everyday apparel.
                  </p>
                </div>
                <LiquidButton href="/" variant="primary" className="mx-auto">
                  Explore Collections
                </LiquidButton>
              </div>
            ) : (
              /* Editorial Seamless List Layout (NO CARDS VIEW) */
              <div className="pt-2 pb-16">
                {/* Search Match Result Notice */}
                {searchQuery && (
                  <p className="text-xs font-semibold text-black/60 py-3">
                    Found {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} matching "{searchQuery}"
                  </p>
                )}

                {filteredOrders.length === 0 ? (
                  <div className="py-16 text-center space-y-3 border-b border-black/10">
                    <p className="text-base font-bold text-black">No orders match your filter criteria.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('ALL')
                        setSearchQuery('')
                      }}
                      className="text-xs font-extrabold uppercase tracking-wider text-black underline underline-offset-4 cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-black/10">
                    {filteredOrders.map((order) => {
                      const statusMeta = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING

                      return (
                        <div
                          key={order.id}
                          className="py-7 sm:py-9 transition-colors group"
                        >
                          {/* Top Meta Header Row */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-black/60">
                              <div>
                                <span className="text-xs font-black uppercase tracking-widest text-black/50 block">
                                  Order Placed
                                </span>
                                <span className="text-sm font-bold text-black">
                                  {formatDate(order.createdAt)}
                                </span>
                              </div>
                              <span className="text-black/15">|</span>
                              <div>
                                <span className="text-xs font-black uppercase tracking-widest text-black/50 block">
                                  Order Number
                                </span>
                                <span className="text-sm font-black text-black tracking-tight">
                                  {order.orderNumber}
                                </span>
                              </div>
                              <span className="text-black/15">|</span>
                              <div>
                                <span className="text-xs font-black uppercase tracking-widest text-black/50 block">
                                  Total Paid
                                </span>
                                <span className="text-lg font-black text-black">
                                  {formatCurrency(order.totalAmount)}
                                </span>
                              </div>
                            </div>

                            {/* Status Badges */}
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-1 text-xs font-bold tracking-wide ${statusMeta.badgeClass}`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dotClass}`} />
                                <HugeiconsIcon icon={statusMeta.icon} size={14} />
                                <span>{statusMeta.label}</span>
                              </span>

                              <span
                                className={`rounded-2xl px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider ${order.paymentStatus === 'PAID'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                                  }`}
                              >
                                {order.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
                              </span>
                            </div>
                          </div>

                          {/* Line Items List with Compact Expandable View */}
                          {(() => {
                            const items = order.items || []
                            const isExpanded = Boolean(expandedOrders[order.id])
                            const showCollapsible = items.length > 2
                            const visibleItems = showCollapsible && !isExpanded ? items.slice(0, 2) : items

                            return (
                              <div className="py-2">
                                <div className="space-y-3.5">
                                  {visibleItems.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center gap-4 sm:gap-5"
                                    >
                                      {/* Thumbnail - Clickable to Product Detail */}
                                      <Link
                                        to={`/product/${item.productId}`}
                                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-neutral-100 border border-black/10 overflow-hidden shrink-0 flex items-center justify-center group cursor-pointer hover:border-black/30 transition-all"
                                        title={`View ${item.productName}`}
                                      >
                                        {item.productImageUrl ? (
                                          <img
                                            src={item.productImageUrl}
                                            alt={item.productName}
                                            className="h-full w-full object-cover pointer-events-none select-none transition-transform duration-300 group-hover:scale-105"
                                            draggable={false}
                                          />
                                        ) : (
                                          <HugeiconsIcon
                                            icon={PackageIcon}
                                            size={24}
                                            className="text-black/30"
                                          />
                                        )}
                                      </Link>

                                      {/* Item Info */}
                                      <div className="min-w-0 flex-1 space-y-1">
                                        <Link
                                          to={`/product/${item.productId}`}
                                          className="group block"
                                        >
                                          <h4 className="text-base sm:text-lg font-black text-black tracking-tight leading-snug truncate group-hover:text-black/75 hover:underline underline-offset-2 transition-colors">
                                            {item.productName}
                                          </h4>
                                        </Link>
                                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-black/60">
                                          <span className="flex items-center gap-1.5">
                                            <span
                                              className="h-2.5 w-2.5 rounded-full border border-black/20"
                                              style={{ backgroundColor: item.colorHex || '#000' }}
                                            />
                                            <span>{item.colorName}</span>
                                          </span>
                                          <span>•</span>
                                          <span className="font-extrabold text-black/80">
                                            Size: {item.sizeCode}
                                          </span>
                                          <span>•</span>
                                          <span>Qty: {item.quantity}</span>
                                        </div>
                                        <p className="text-base font-black text-black">
                                          {formatCurrency(item.unitPrice * item.quantity)}
                                        </p>
                                        {order.status === 'DELIVERED' && reviewableProductIds.has(item.productId) && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setReviewTarget({
                                                productId: item.productId,
                                                orderId: order.id,
                                                productName: item.productName,
                                                productImage: item.productImageUrl,
                                              })
                                            }
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-black/15 px-3 py-1.5 text-xs font-bold text-black hover:border-black hover:bg-black hover:text-white transition-all cursor-pointer"
                                          >
                                            <HugeiconsIcon icon={StarIcon} size={13} />
                                            <span>Rate & Review</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Show More / Show Less Toggle when an order has many items */}
                                {showCollapsible && (
                                  <div className="pt-3">
                                    <button
                                      type="button"
                                      onClick={() => toggleOrderExpand(order.id)}
                                      className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black/80 hover:text-black bg-neutral-100/90 hover:bg-neutral-200/80 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
                                    >
                                      <HugeiconsIcon
                                        icon={isExpanded ? ArrowUp01Icon : ArrowDown01Icon}
                                        size={14}
                                      />
                                      <span>
                                        {isExpanded
                                          ? 'Show Less'
                                          : `+ ${items.length - 2} More Items`}
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )
                          })()}

                          {/* Order Bottom Action Row */}
                          <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="text-xs font-medium text-black/60 max-w-md truncate">
                              <span className="font-bold text-black">Shipping to: </span>
                              {order.customerName} · {order.shippingAddress}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => handleDownloadInvoice(e, order)}
                                className="inline-flex items-center gap-1.5 rounded-2xl border border-black/15 bg-white px-3.5 py-1.5 text-xs font-bold text-black hover:border-black hover:bg-black hover:text-white transition-all cursor-pointer active:scale-95"
                                title="Download Order Invoice"
                              >
                                <HugeiconsIcon icon={Download01Icon} size={14} />
                                <span>Invoice</span>
                              </button>

                              <Link
                                to={`/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}`}
                                className="inline-flex items-center gap-1.5 rounded-2xl border border-black/15 bg-white hover:bg-black/5 px-3.5 py-1.5 text-xs font-bold text-black transition-colors"
                              >
                                <HugeiconsIcon icon={DeliveryTruck01Icon} size={14} />
                                <span>Track</span>
                              </Link>

                              <Link
                                to={`/orders/${order.id}`}
                                className="inline-flex items-center gap-1.5 rounded-2xl bg-black hover:bg-neutral-800 text-white px-4 py-1.5 text-xs font-bold transition-all"
                              >
                                <span>Order Details</span>
                                <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />

      {reviewTarget && (
        <WriteReviewModal
          isOpen={Boolean(reviewTarget)}
          onClose={() => setReviewTarget(null)}
          productId={reviewTarget.productId}
          orderId={reviewTarget.orderId}
          productName={reviewTarget.productName}
          productImage={reviewTarget.productImage}
        />
      )}
    </div>
  )
}
