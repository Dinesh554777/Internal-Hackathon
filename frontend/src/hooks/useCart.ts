import { useCartStore } from '@/store/cartStore'
import type { Product } from '@/types'

export function useCart() {
  const {
    items,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
  } = useCartStore()

  return {
    items,
    isOpen,
    addItem: (product: Product, quantity?: number) =>
      addItem(product, quantity),
    removeItem: (productId: string) => removeItem(productId),
    updateQuantity: (productId: string, quantity: number) =>
      updateQuantity(productId, quantity),
    clearCart,
    toggleCart,
    total: useCartStore.getState().getTotal(),
    itemCount: useCartStore.getState().getItemCount(),
  }
}
