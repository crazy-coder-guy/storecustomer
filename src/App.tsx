import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { CategoryProductsPage } from './pages/CategoryProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/category/:slug" element={<CategoryProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
