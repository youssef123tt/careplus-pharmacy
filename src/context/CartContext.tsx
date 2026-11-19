import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { CART_STORAGE_KEY, cartReducer, emptyCart, parseStoredCart, type CartAction, type CartState } from '../lib/cart'

interface CartContextValue {
  state: CartState
  dispatch: (action: CartAction) => void
  /** Number of distinct lines (shown on the header badge). */
  lineCount: number
}

const CartContext = createContext<CartContextValue | null>(null)

function loadCart(): CartState {
  try {
    return parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY))
  } catch {
    return emptyCart
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadCart)

  // Persist on every change.
  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable (private mode) — cart still works for this session */
    }
  }, [state])

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) dispatch({ type: 'replace', state: parseStoredCart(e.newValue) })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo(() => ({ state, dispatch, lineCount: state.lines.length }), [state])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
