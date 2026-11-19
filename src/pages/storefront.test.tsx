import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CartProvider } from '../context/CartContext'
import { CART_STORAGE_KEY } from '../lib/cart'
import { catalog, productC } from '../test/fixtures'
import { CartPage } from './CartPage'
import { ProductDetailsPage } from './ProductDetailsPage'

// Replace the data layer with the in-memory fixtures (no network in tests).
vi.mock('../api/hooks', () => ({
  useProduct: (id: string) => ({ data: catalog.find((p) => p.id === id) ?? null, isLoading: false, error: null, refetch: vi.fn() }),
  useAllProducts: () => ({ data: catalog, isLoading: false, error: null }),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function renderApp(path: string) {
  return render(
    <CartProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    </CartProvider>,
  )
}

describe('product details → cart flow', () => {
  beforeEach(() => localStorage.clear())

  it('shows all three offers of Product C and calculates 2 x 4-pack = 39.000 KWD', async () => {
    const user = userEvent.setup()
    renderApp(`/products/${productC.id}`)

    expect(screen.getAllByRole('radio')).toHaveLength(3)
    await user.click(screen.getByRole('radio', { name: /4 packs/ }))
    await user.click(screen.getByRole('button', { name: 'Increase bundles' }))

    expect(screen.getByTestId('details-total')).toHaveTextContent('39.000 KWD')
    expect(screen.getByText(/8 packs/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Add to cart/ }))
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)
    expect(stored.lines).toEqual([expect.objectContaining({ productId: 'C', tierId: 'C4', bundles: 2 })])
  })

  it('cart keeps offers separate, recalculates on quantity change and removal', async () => {
    const snap = (tierLabel: string, units: number, fils: number) => ({
      productName: 'Vitamin C', tierLabel, unitsPerBundle: units, bundlePriceFils: fils, imageUrl: null,
    })
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        lines: [
          { productId: 'C', tierId: 'C4', bundles: 2, snapshot: snap('Value', 4, 19500) },
          { productId: 'C', tierId: 'C1', bundles: 1, snapshot: snap('Single', 1, 5500) },
        ],
      }),
    )
    const user = userEvent.setup()
    renderApp('/cart')

    const items = within(screen.getByRole('list', { name: 'Cart items' })).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(within(items[0]).getByTestId('line-packs')).toHaveTextContent('2 × 4 packs = 8 packs')
    expect(within(items[0]).getByTestId('line-total')).toHaveTextContent('39.000 KWD')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('44.500 KWD')

    await user.click(within(items[1]).getByRole('button', { name: 'Increase bundles' }))
    expect(screen.getByTestId('cart-total')).toHaveTextContent('50.000 KWD')

    // Typing an invalid quantity is corrected to a valid one on blur.
    const qty = within(items[0]).getByRole('spinbutton')
    await user.clear(qty)
    await user.type(qty, '0')
    await user.tab()
    expect(qty).toHaveValue(1)
    expect(screen.getByTestId('cart-total')).toHaveTextContent('30.500 KWD')

    await user.click(within(items[0]).getByRole('button', { name: /Remove/ }))
    expect(screen.getByTestId('cart-total')).toHaveTextContent('11.000 KWD')
  })

  it('shows an empty state when the cart is empty', () => {
    renderApp('/cart')
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
  })
})
