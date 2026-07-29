import { create } from 'zustand'
import type { Product } from '@/types'

interface WishlistState {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  addItem: (product) =>
    set((state) => {
      if (state.items.find((item) => item.id === product.id)) return state
      return { items: [...state.items, product] }
    }),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    })),
  isInWishlist: (productId) =>
    get().items.some((item) => item.id === productId),
  clearWishlist: () => set({ items: [] }),
}))
