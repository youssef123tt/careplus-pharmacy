import { Cross, Settings, ShoppingCart, Store } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

export function Layout() {
  const { lineCount } = useCart()
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand-700 text-white">
              <Cross className="size-4 fill-white" aria-hidden />
            </span>
            <span className="text-lg">
              Care<span className="text-brand-700">Plus</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1" aria-label="Main">
            <NavLink to="/" end className={navClass}>
              <Store className="size-4" aria-hidden />
              <span className="hidden sm:inline">Shop</span>
            </NavLink>
            <NavLink to="/admin" className={navClass}>
              <Settings className="size-4" aria-hidden />
              <span className="hidden sm:inline">Admin</span>
            </NavLink>
            <NavLink to="/cart" className={navClass} aria-label={`Cart, ${lineCount} items`}>
              <span className="relative">
                <ShoppingCart className="size-5" aria-hidden />
                {lineCount > 0 && (
                  <span className="absolute -right-2.5 -top-2 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-bold text-white">
                    {lineCount}
                  </span>
                )}
              </span>
              <span className="hidden sm:inline">Cart</span>
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-slate-500 sm:px-6">
          CarePlus demo store — sample data only. Prices in Kuwaiti Dinar (KWD).
        </div>
      </footer>
    </div>
  )
}
