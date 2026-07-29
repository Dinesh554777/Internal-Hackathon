import { create } from 'zustand'
import type { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (product, quantity = 1) =>
    set((state) => {
      const existing = state.items.find((item) => item.productId === product.id)
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        }
      }
      return {
        items: [
          ...state.items,
          {
            id: crypto.randomUUID(),
            productId: product.id,
            product,
            quantity,
          },
        ],
      }
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    })),

  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    })),

  clearCart: () => set({ items: [] }),

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  getTotal: () =>
    get().items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    ),

  getItemCount: () =>
    get().items.reduce((count, item) => count + item.quantity, 0),
}))
