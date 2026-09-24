import { createContext, useContext, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from './AuthContext'
import * as favoriteService from '../services/favorite.service'
import { getErrorMessage } from '../services/api'

interface WishlistContextType {
  wishlistIds: string[]
  wishlistCount: number
  isLoading: boolean
  isWishlistOpen: boolean
  openWishlist: () => void
  closeWishlist: () => void
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (productId: string) => Promise<void>
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => void
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, ensureSignedIn } = useAuth()
  const queryClient = useQueryClient()
  const wishlistKey = ['favorites', user?.uid] as const
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)

  const openWishlist = () => setIsWishlistOpen(true)
  const closeWishlist = () => setIsWishlistOpen(false)

  const { data, isLoading } = useQuery({
    queryKey: wishlistKey,
    queryFn: favoriteService.getFavorites,
    enabled: Boolean(user),
  })

  const wishlistIds = data ?? []

  const addMutation = useMutation({
    mutationFn: (productId: string) => favoriteService.addFavorite(productId),
    onSuccess: (updated) => queryClient.setQueryData(wishlistKey, updated),
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const removeMutation = useMutation({
    mutationFn: (productId: string) => favoriteService.removeFavorite(productId),
    onSuccess: (updated) => queryClient.setQueryData(wishlistKey, updated),
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const clearMutation = useMutation({
    mutationFn: () => favoriteService.clearFavorites(),
    onSuccess: (updated) => queryClient.setQueryData(wishlistKey, updated),
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  function isInWishlist(productId: string) {
    return wishlistIds.includes(productId)
  }

  async function addToWishlist(productId: string) {
    if (isInWishlist(productId)) return
    try {
      await ensureSignedIn()
    } catch {
      toast('Sign in to save items to your wishlist')
      return
    }
    await addMutation.mutateAsync(productId)
    queryClient.invalidateQueries({ queryKey: wishlistKey })
  }

  function removeFromWishlist(productId: string) {
    if (!user) return
    removeMutation.mutate(productId)
  }

  async function toggleWishlist(productId: string) {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId)
    } else {
      await addToWishlist(productId)
    }
  }

  function clearWishlist() {
    if (!user) return
    clearMutation.mutate()
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.length,
        isLoading,
        isWishlistOpen,
        openWishlist,
        closeWishlist,
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
