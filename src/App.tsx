import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { CategoryProductsPage } from './pages/CategoryProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CartPage } from './pages/CartPage'
import { SearchPage } from './pages/SearchPage'
import { WishlistPage } from './pages/WishlistPage'
import { TrackOrderPage } from './pages/TrackOrderPage'
import { ShippingInfoPage } from './pages/ShippingInfoPage'
import { ReturnsPage } from './pages/ReturnsPage'
import { SizeGuidePage } from './pages/SizeGuidePage'
import { ContactPage } from './pages/ContactPage'

export function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/category/:slug" element={<CategoryProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/favourites" element={<WishlistPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/shipping-info" element={<ShippingInfoPage />} />
            <Route path="/returns-exchanges" element={<ReturnsPage />} />
            <Route path="/size-guide" element={<SizeGuidePage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </BrowserRouter>
      </WishlistProvider>
    </CartProvider>
  )
}

export default App
