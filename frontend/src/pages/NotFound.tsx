import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-4 text-6xl font-bold">404</h1>
      <p className="mb-8 text-lg text-gray-600">
        The page you are looking for does not exist.
      </p>
      <Link to="/" className="rounded-lg bg-black px-6 py-2 text-white">
        Go Home
      </Link>
    </div>
  )
}
