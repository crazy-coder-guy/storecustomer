import { useParams, Navigate } from 'react-router-dom'
import { useProductDetail } from '../hooks/queries'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { Skeleton } from './Skeleton'

/**
 * Old `/product/:id` links (shared before the slug-based URL existed, or
 * still used internally in account-area pages) resolve the product by id
 * and 301-equivalent-redirect to its canonical `/products/:slug` URL, so
 * nothing that ever linked to the old path 404s.
 */
export function LegacyProductRedirect() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading, isError } = useProductDetail(id)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <Navbar />
        <main className="py-24 max-w-md mx-auto">
          <Skeleton className="h-8 w-48 mx-auto rounded" />
        </main>
        <Footer />
      </div>
    )
  }

  if (isError || !product) {
    return <Navigate to="/products" replace />
  }

  return <Navigate to={`/products/${product.slug}`} replace />
}
