import { useProducts } from '@/hooks/useProducts'
import ProductCard from '@/components/ProductCard'

export default function Home() {
  const { data, isLoading, error } = useProducts({ limit: 8 })

  if (isLoading) return <div className="p-8 text-center">Loading...</div>
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load products
      </div>
    )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to InclusiveCart AI</h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          AI-powered e-commerce designed for everyone. Shop smarter with voice
          commands and personalized recommendations.
        </p>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-semibold">Featured Products</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data?.data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}
