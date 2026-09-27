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
  // Stock is what a cart's own quantity caps and warnings are based on, so
  // an already-open cart needs to refetch too when it changes elsewhere.
  inventory: [['products'], ['storefront-products'], ['product'], ['cart']],
  order: [['orders'], ['order']],
  review: [['product-reviews'], ['reviewable-products']],
  exchange: [['exchange-eligible-items'], ['my-exchange-requests']],
  newsletter: [],
  storefront: [['storefront-settings'], ['featured-products']],
  cart: [['cart']],
}

export function RealtimeSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Debounced, not immediate: a burst of events (e.g. an admin bulk-editing
    // several variants) would otherwise fire invalidateQueries once per
    // event, each restarting the same query's in-flight refetch — which can
    // stack up to several seconds before it finally settles. Coalescing
    // everything within a short window into one invalidate per key lets a
    // burst resolve about as fast as a single change does.
    const pendingKeys = new Map<string, string[]>()
    let timer: ReturnType<typeof setTimeout> | null = null

    function flush() {
      timer = null
      for (const queryKey of pendingKeys.values()) {
        queryClient.invalidateQueries({ queryKey })
      }
      pendingKeys.clear()
    }

    function handleEvent(event: RealtimeEvent) {
      const keys = ENTITY_QUERY_KEYS[event.entity]
      if (!keys) return
      for (const queryKey of keys) pendingKeys.set(JSON.stringify(queryKey), queryKey)
      if (!timer) timer = setTimeout(flush, 250)
    }

    realtimeSocket.on('realtime:event', handleEvent)
    return () => {
      realtimeSocket.off('realtime:event', handleEvent)
      if (timer) clearTimeout(timer)
    }
  }, [queryClient])

  return null
}
