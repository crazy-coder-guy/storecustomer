import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { realtimeSocket, type RealtimeEvent } from '../lib/realtimeSocket'

// Coarse invalidation, not fine-grained cache patching: an entity change
// just tells every mounted query for that resource to refetch — e.g. an
// admin editing a product's price invalidates ['products']/['product'],
// so the shopper's already-open listing or detail page silently refetches
// and shows the new price without a manual reload.
const ENTITY_QUERY_KEYS: Record<RealtimeEvent['entity'], string[][]> = {
  product: [['products'], ['storefront-products'], ['product'], ['featured-products']],
  category: [['categories'], ['products'], ['storefront-products']],
  color: [['colors'], ['products'], ['storefront-products']],
  size: [['sizes'], ['products'], ['storefront-products']],
  inventory: [['products'], ['storefront-products'], ['product']],
  order: [['orders'], ['order']],
  review: [['product-reviews'], ['reviewable-products']],
  exchange: [['exchange-eligible-items'], ['my-exchange-requests']],
  newsletter: [],
  storefront: [['storefront-settings'], ['featured-products']],
}

export function RealtimeSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    function handleEvent(event: RealtimeEvent) {
      const keys = ENTITY_QUERY_KEYS[event.entity]
      if (!keys) return
      for (const queryKey of keys) {
        queryClient.invalidateQueries({ queryKey })
      }
    }

    realtimeSocket.on('realtime:event', handleEvent)
    return () => {
      realtimeSocket.off('realtime:event', handleEvent)
    }
  }, [queryClient])

  return null
}
