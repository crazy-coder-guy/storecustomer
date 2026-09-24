import { createContext, useContext, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from './AuthContext'
import * as cartService from '../services/cart.service'
import { getErrorMessage } from '../services/api'
import type { CartItemResponse } from '../types'

export type CartItem = CartItemResponse

interface CartContextType {
  items: CartItem[]
  isLoading: boolean
  cartCount: number
  subtotal: number
  totalDiscount: number
  deliveryFee: number
  finalTotal: number
  addToCart: (variantId: string, quantity?: number) => Promise<void>
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, qty: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, ensureSignedIn } = useAuth()
  const queryClient = useQueryClient()
  const cartKey = ['cart', user?.uid] as const

  const { data, isLoading } = useQuery({
    queryKey: cartKey,
    queryFn: cartService.getCart,
    enabled: Boolean(user),
  })

  const items = data ?? []

  const addMutation = useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: string; quantity: number }) =>
      cartService.addCartItem(variantId, quantity),
    onSuccess: (updated) => queryClient.setQueryData(cartKey, updated),
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartService.updateCartItem(itemId, quantity),
    onSuccess: (updated) => queryClient.setQueryData(cartKey, updated),
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => cartService.removeCartItem(itemId),
    onSuccess: (updated) => queryClient.setQueryData(cartKey, updated),
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const clearMutation = useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: (updated) => queryClient.setQueryData(cartKey, updated),
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const mrpTotal = items.reduce((sum, item) => sum + item.mrp * item.quantity, 0)
  const totalDiscount = Math.max(0, mrpTotal - subtotal)
  const deliveryFee = items.length === 0 ? 0 : 19
  const finalTotal = subtotal + deliveryFee

  async function addToCart(variantId: string, quantity = 1) {
    try {
      await ensureSignedIn()
    } catch {
      toast('Sign in to add items to your cart')
      return
    }
    await addMutation.mutateAsync({ variantId, quantity })
    queryClient.invalidateQueries({ queryKey: cartKey })
  }

  function removeFromCart(itemId: string) {
    removeMutation.mutate(itemId)
  }

  function updateQuantity(itemId: string, qty: number) {
    updateMutation.mutate({ itemId, quantity: qty })
  }

  function clearCart() {
    if (!user) return
    clearMutation.mutate()
  }

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        cartCount,
        subtotal,
        totalDiscount,
        deliveryFee,
        finalTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
