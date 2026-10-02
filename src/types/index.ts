export type EntityStatus = 'ACTIVE' | 'INACTIVE'
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'LAUNCHING_SOON'

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: PaginationMeta
}

export interface ApiError {
  message: string
  code: string
  status: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  badge: string | null
  status: EntityStatus
  createdAt: string
  updatedAt: string
}

export interface Size {
  id: string
  name: string
  code: string
  sortOrder: number
  status: EntityStatus
}

export interface Color {
  id: string
  name: string
  code: string
  hexCode: string
  status: EntityStatus
}

export type ProductFit = 'REGULAR' | 'SLIM' | 'OVERSIZED' | 'RELAXED'
export type NeckType = 'CREW' | 'V_NECK' | 'POLO' | 'ROUND' | 'MOCK'

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  categoryId: string
  productType: string
  basePrice: number
  mrp: number
  badge: string | null
  status: ProductStatus
  createdAt: string
  updatedAt: string
  gsm: number | null
  fabric: string | null
  fit: ProductFit | null
  neckType: NeckType | null
  biowash: boolean
}

export type ImageType = 'PRODUCT' | 'MODEL' | 'LIFESTYLE'

export interface ProductImage {
  id: string
  productId: string
  colorId: string | null
  color: Color | null
  imageUrl: string
  imageType: ImageType
  sortOrder: number
  isPrimary: boolean
  createdAt: string
}

export interface ProductVariant {
  id: string
  productId: string
  colorId: string
  sizeId: string
  sku: string
  price: number | null
  stockQuantity: number
  badge: string | null
  status: EntityStatus
  color?: Color
  size?: Size
}

export interface ProductDetail extends Product {
  category: Category
  images: ProductImage[]
  variants: ProductVariant[]
}

/**
 * The list-products endpoint already includes images and a deduped set of
 * variant colors alongside each product (see backend product.service.ts) —
 * grid views should read straight from this instead of firing a per-card
 * detail request for data that's already here.
 */
export interface ProductListItem extends Product {
  category: Category | null
  images: ProductImage[]
  colors: Color[]
  sizes: Size[]
  inStock: boolean
}

export interface StorefrontSettings {
  id: string
  announcementText: string
  heroTitle: string
  heroSubtitle: string
  updatedAt: string
}

export interface FeaturedProduct {
  id: string
  productId: string
  sortOrder: number
  createdAt: string
  product: Product & { category: Category; images: ProductImage[]; colors: Color[]; inStock: boolean }
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type PaymentStatus = 'PAID' | 'UNPAID' | 'REFUNDED'

export interface CreateOrderInput {
  customerName: string
  customerPhone: string
  doorNumber: string
  streetName: string
  city: string
  state: string
  pincode: string
  items: { variantId: string; quantity: number }[]
  couponCode?: string
}

export interface Address {
  id: string
  userId: string
  name: string
  phone: string
  shippingAddress: string
  doorNumber: string | null
  streetName: string | null
  city: string | null
  state: string | null
  pincode: string | null
  createdAt: string
}

export interface PincodeLookupResult {
  city: string
  state: string
}

export interface OrderItemResponse {
  id: string
  productId: string
  productSlug: string
  productImageUrl: string | null
  productName: string
  colorName: string
  colorHex: string
  sizeName: string
  sizeCode: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  totalAmount: number
  discountAmount: number
  couponCode: string | null
  itemsCount: number
  items: OrderItemResponse[]
  shippingAddress: string
  doorNumber: string | null
  streetName: string | null
  city: string | null
  state: string | null
  pincode: string | null
  createdAt: string
  deliveredAt: string | null
}

export interface RazorpayOrderResponse {
  razorpayOrderId: string
  amount: number
  currency: string
  keyId: string
  orderId: string
  orderNumber: string
}

export interface VerifyPaymentInput {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export interface CartItemResponse {
  id: string
  variantId: string
  productId: string
  name: string
  subtitle: string
  price: number
  mrp: number
  image: string | null
  size: string
  color: { name: string; hex: string }
  quantity: number
  stockQuantity: number
}

export interface CartSummary {
  subtotal: number
  mrpTotal: number
  discount: number
  deliveryFee: number
  couponCode: string | null
  couponDiscount: number
  total: number
  freeDeliveryThreshold: number
}

export interface CartResponse {
  items: CartItemResponse[]
  summary: CartSummary
}

export interface Review {
  id: string
  rating: number
  comment: string
  images: string[]
  video: string | null
  createdAt: string
  reviewerName: string
  reviewerPhoto: string | null
  verifiedPurchase: boolean
}

export interface ReviewSummary {
  average: number
  count: number
  breakdown: Record<'1' | '2' | '3' | '4' | '5', number>
}

export interface ReviewsResponse {
  items: Review[]
  meta: PaginationMeta
  summary: ReviewSummary
}

export interface ReviewableProduct {
  orderId: string
  orderNumber: string
  productId: string
  productName: string
  productImage: string | null
}

export type ExchangeReason = 'DAMAGED' | 'DEFECTIVE' | 'WRONG_ITEM' | 'SIZE_FIT' | 'OTHER'
export type ExchangeRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED'

export interface ExchangeEligibleItem {
  orderItemId: string
  orderId: string
  orderNumber: string
  productId: string
  productName: string
  productImage: string | null
  colorName: string
  colorHex: string
  sizeCode: string
}

export interface ExchangeRequest {
  id: string
  orderId: string
  orderNumber: string
  orderItemId: string
  productId: string
  productName: string
  productImage: string | null
  colorName: string
  colorHex: string
  sizeCode: string
  reason: ExchangeReason
  description: string
  images: string[]
  status: ExchangeRequestStatus
  adminNote: string | null
  createdAt: string
  updatedAt: string
}
