export type UserRole = 'customer' | 'admin' | 'accessibility_tester'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  is_active: boolean
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  currency: string
  images: string[]
  category_id: string
  category_name: string
  category_slug: string
  tags: string[]
  stock: number
  rating: number
  review_count: number
  in_wishlist?: boolean
  brand?: string
  originalPrice?: number
  isNew?: boolean
  discount?: number
  delivery?: string
  specifications?: Record<string, string>
  features?: string[]
  createdAt: string
  updatedAt?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  display_order: number
  product_count: number
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  user_id: string
  user_name: string
  product_id: string
  rating: number
  title: string
  comment: string
  created_at: string
}

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  total: number
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: Address
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  productId: string
  product: Product
  quantity: number
  price: number
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

export interface ApiResponse<T> {
  data: T
  message: string
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}
