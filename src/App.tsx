import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Layout } from './components/Layout'
import { EmptyState } from './components/ui'
import { CartProvider } from './context/CartContext'
import { isSupabaseConfigured } from './lib/supabase'
import { CartPage } from './pages/CartPage'
import { HomePage } from './pages/HomePage'
import { ProductDetailsPage } from './pages/ProductDetailsPage'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminProductsPage } from './pages/admin/AdminProductsPage'
import { ProductFormPage } from './pages/admin/ProductFormPage'
import { TaxonomyPage } from './pages/admin/TaxonomyPage'
import { SetupRequired } from './pages/SetupRequired'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: true },
  },
})

export default function App() {
  if (!isSupabaseConfigured) return <SetupRequired />
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="products/:id" element={<ProductDetailsPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<AdminProductsPage />} />
                <Route path="products/new" element={<ProductFormPage />} />
                <Route path="products/:id/edit" element={<ProductFormPage />} />
                <Route path="brands" element={<TaxonomyPage key="brands" table="brands" />} />
                <Route path="categories" element={<TaxonomyPage key="categories" table="categories" />} />
              </Route>
              <Route
                path="*"
                element={
                  <EmptyState
                    title="Page not found"
                    action={<Link to="/" className="font-semibold text-brand-700 hover:underline">Go to the shop</Link>}
                  />
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-right" richColors closeButton />
      </CartProvider>
    </QueryClientProvider>
  )
}
