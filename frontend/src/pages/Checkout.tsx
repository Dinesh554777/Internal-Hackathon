import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/utils/format'
import type { Address } from '@/types'

export default function Checkout() {
  const { items, total } = useCart()
  const [address, setAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border p-4">
          <h2 className="mb-4 font-semibold">Shipping Address</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              placeholder="Street"
              className="col-span-full rounded-lg border px-3 py-2"
              value={address.street}
              onChange={(e) =>
                setAddress({ ...address, street: e.target.value })
              }
              required
            />
            <input
              placeholder="City"
              className="rounded-lg border px-3 py-2"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              required
            />
            <input
              placeholder="State"
              className="rounded-lg border px-3 py-2"
              value={address.state}
              onChange={(e) =>
                setAddress({ ...address, state: e.target.value })
              }
              required
            />
            <input
              placeholder="ZIP Code"
              className="rounded-lg border px-3 py-2"
              value={address.zipCode}
              onChange={(e) =>
                setAddress({ ...address, zipCode: e.target.value })
              }
              required
            />
            <input
              placeholder="Country"
              className="rounded-lg border px-3 py-2"
              value={address.country}
              onChange={(e) =>
                setAddress({ ...address, country: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="mb-4 font-semibold">Order Summary</h2>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between py-2 text-sm">
              <span>
                {item.product.name} x {item.quantity}
              </span>
              <span>{formatPrice(item.product.price * item.quantity)}</span>
            </div>
          ))}
          <div className="mt-4 flex justify-between border-t pt-4 font-bold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-black py-3 text-white"
        >
          Place Order
        </button>
      </form>
    </div>
  )
}
