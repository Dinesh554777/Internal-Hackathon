import { Link } from 'react-router-dom'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/utils/format'

export default function Cart() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">Your cart is empty</h1>
        <Link
          to="/products"
          className="inline-block rounded-lg bg-black px-6 py-2 text-white"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Shopping Cart</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-lg border p-4"
          >
            <img
              src={item.product.images[0]}
              alt={item.product.name}
              className="h-20 w-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{item.product.name}</h3>
              <p className="text-sm text-gray-600">
                {formatPrice(item.product.price, item.product.currency)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateQuantity(item.productId, Math.max(0, item.quantity - 1))
                }
                className="rounded border px-2 py-1"
              >
                -
              </button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button
                onClick={() =>
                  updateQuantity(item.productId, item.quantity + 1)
                }
                className="rounded border px-2 py-1"
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeItem(item.productId)}
              className="text-sm text-red-500"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-4">
        <div className="flex items-center justify-between text-xl font-bold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="mt-4 flex gap-4">
          <button
            onClick={clearCart}
            className="rounded-lg border px-6 py-2 text-sm"
          >
            Clear Cart
          </button>
          <Link
            to="/checkout"
            className="rounded-lg bg-black px-6 py-2 text-sm text-white"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
