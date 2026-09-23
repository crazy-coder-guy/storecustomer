import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface WishlistContextType {
  wishlistIds: string[]
  wishlistCount: number
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (productId: string) => void
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

// Wishlist ids now refer to real product UUIDs from the backend, so there is
// no meaningful hardcoded default set — it simply starts empty.
const INITIAL_WISHLIST_IDS: string[] = []

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kaira_wishlist')
      if (saved) return JSON.parse(saved)
    } catch {
      // fallback
    }
    return INITIAL_WISHLIST_IDS
  })

  useEffect(() => {
    try {
      localStorage.setItem('kaira_wishlist', JSON.stringify(wishlistIds))
    } catch {
      // ignore
    }
  }, [wishlistIds])

  const isInWishlist = (productId: string) => wishlistIds.includes(productId)

  const addToWishlist = (productId: string) => {
    setWishlistIds((prev) => (prev.includes(productId) ? prev : [...prev, productId]))
  }

  const removeFromWishlist = (productId: string) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId))
  }

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const clearWishlist = () => {
    setWishlistIds([])
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.length,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
