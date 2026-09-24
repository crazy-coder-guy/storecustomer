import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'

export function WishlistPage() {
  const navigate = useNavigate()
  const { openWishlist } = useWishlist()

  useEffect(() => {
    openWishlist()
    navigate('/', { replace: true })
  }, [openWishlist, navigate])

  return null
}
