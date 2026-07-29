import { Link } from 'react-router-dom'
import type { Product } from '@/types'
import { formatPrice, truncate } from '@/utils/format'
import { useCart } from '@/hooks/useCart'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  return (
    <div className="group overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-lg">
      <Link to={`/products/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold">{truncate(product.name, 40)}</h3>
        </Link>
        <p className="mt-1 text-sm text-gray-600">
          {truncate(product.description, 60)}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold">
            {formatPrice(product.price, product.currency)}
          </span>
          <button
            onClick={() => addItem(product)}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white transition-colors hover:bg-gray-800"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
