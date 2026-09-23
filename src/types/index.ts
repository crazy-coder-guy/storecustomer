export type EntityStatus = 'ACTIVE' | 'INACTIVE'
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT'

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
}

export type ImageType = 'PRODUCT' | 'MODEL' | 'LIFESTYLE'

export interface ProductImage {
  id: string
  productId: string
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
  product: Product & { category: Category; images: ProductImage[] }
}
