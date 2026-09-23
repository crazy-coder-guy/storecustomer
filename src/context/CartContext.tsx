import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface CartItem {
  id: string
  productId: string
  name: string
  subtitle?: string
  price: number
  mrp: number
  image: string
  size: string
  color: { name: string; hex: string }
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  cartCount: number
  subtotal: number
  totalDiscount: number
  deliveryFee: number
  finalTotal: number
  addToCart: (item: Omit<CartItem, 'id'>) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kaira_cart')
      if (saved) return JSON.parse(saved)
    } catch {
      // fallback
    }
    return []
  })

  useEffect(() => {
    try {
      localStorage.setItem('kaira_cart', JSON.stringify(items))
    } catch {
      // ignore
    }
  }, [items])

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const mrpTotal = items.reduce((sum, item) => sum + item.mrp * item.quantity, 0)
  const totalDiscount = Math.max(0, mrpTotal - subtotal)
  const deliveryFee = items.length === 0 ? 0 : 19
  const finalTotal = subtotal + deliveryFee

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.productId === newItem.productId &&
          i.size === newItem.size &&
          i.color.name === newItem.color.name
      )
      if (existingIdx > -1) {
        const copy = [...prev]
        copy[existingIdx].quantity += newItem.quantity
        return copy
      }
      return [
        ...prev,
        {
          ...newItem,
          id: `${newItem.productId}-${newItem.size}-${newItem.color.name}-${Date.now()}`,
        },
      ]
    })
  }

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id)
      return
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    )
  }

  const clearCart = () => {
    setItems([])
  }

  return (
    <CartContext.Provider
      value={{
        items,
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
