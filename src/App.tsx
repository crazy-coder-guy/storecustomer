import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { PromptSlotProvider } from './context/PromptSlotContext'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { AccountPage } from './pages/AccountPage'
import { CategoryProductsPage } from './pages/CategoryProductsPage'
import { AllProductsPage } from './pages/AllProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrderConfirmationPage } from './pages/OrderConfirmationPage'
import { OrdersPage } from './pages/OrdersPage'
import { OrderDetailPage } from './pages/OrderDetailPage'
import { SearchPage } from './pages/SearchPage'
import { WishlistPage } from './pages/WishlistPage'
import { TrackOrderPage } from './pages/TrackOrderPage'
import { ShippingInfoPage } from './pages/ShippingInfoPage'
import { ReturnsPage } from './pages/ReturnsPage'
import { SizeGuidePage } from './pages/SizeGuidePage'
import { ContactPage } from './pages/ContactPage'
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'
import { TermsOfServicePage } from './pages/TermsOfServicePage'
import { SecurityPage } from './pages/SecurityPage'
import { GoogleOneTapPrompt } from './components/GoogleOneTapPrompt'
import { NotificationPermissionPrompt } from './components/NotificationPermissionPrompt'
import { InstallAppPrompt } from './components/InstallAppPrompt'
import { ScrollManager } from './components/ScrollManager'
import { HapticFeedback } from './components/HapticFeedback'

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <PromptSlotProvider>
          <HapticFeedback />
          <WishlistProvider>
            <BrowserRouter>
              <ScrollManager />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/products" element={<AllProductsPage />} />
                <Route path="/category/:slug" element={<CategoryProductsPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:orderId" element={<OrderDetailPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/favourites" element={<WishlistPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                <Route path="/terms" element={<TermsOfServicePage />} />
                <Route path="/security" element={<SecurityPage />} />
                <Route path="/track-order" element={<TrackOrderPage />} />
                <Route path="/shipping-info" element={<ShippingInfoPage />} />
                <Route path="/returns-exchanges" element={<ReturnsPage />} />
                <Route path="/size-guide" element={<SizeGuidePage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
          <GoogleOneTapPrompt />
          <NotificationPermissionPrompt />
          <InstallAppPrompt />
          <Toaster position="top-center" />
        </PromptSlotProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
