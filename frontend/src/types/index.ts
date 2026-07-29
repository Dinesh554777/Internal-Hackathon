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
  description: string
  price: number
  currency: string
  images: string[]
  category: string
  tags: string[]
  stock: number
  rating: number
  createdAt: string
  updatedAt: string
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
  totalPages: number
}
