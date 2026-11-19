import { Moon, Settings, ShoppingCart, Store, Sun } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useTheme } from '../lib/theme'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `relative inline-flex h-16 items-center gap-1.5 px-3 text-sm font-semibold transition-colors ${
    isActive
      ? 'text-ink after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:bg-ink'
      : 'text-ink-2 hover:text-ink'
  }`

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="CarePlus home">
      <svg viewBox="0 0 28 28" className="size-7" aria-hidden>
        <rect width="28" height="28" rx="3" className="fill-action" />
        <path d="M11 6h6v5h5v6h-5v5h-6v-5H6v-6h5z" className="fill-action-ink" />
      </svg>
      <span className="carton-type text-[1.6rem] font-bold tracking-[0.02em] text-ink">
        Care<span className="text-action">Plus</span>
      </span>
    </Link>
  )
}

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
      className="inline-flex size-9 items-center justify-center rounded-carton text-ink-2 transition-colors hover:bg-board-2 hover:text-ink"
    >
      {dark ? <Sun className="size-[18px]" aria-hidden /> : <Moon className="size-[18px]" aria-hidden />}
    </button>
  )
}

export function Layout() {
  const { lineCount } = useCart()
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-board/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Wordmark />
          <nav className="flex items-center" aria-label="Main">
            <NavLink to="/" end className={navClass} aria-label="Shop">
              <Store className="size-4 sm:hidden" aria-hidden />
              <span className="hidden sm:inline">Shop</span>
            </NavLink>
            <NavLink to="/admin" className={navClass} aria-label="Admin">
              <Settings className="size-4 sm:hidden" aria-hidden />
              <span className="hidden sm:inline">Admin</span>
            </NavLink>
            <span className="mx-1 h-6 w-px bg-line" aria-hidden />
            <ThemeToggle />
            <NavLink to="/cart" className={navClass} aria-label={`Cart, ${lineCount} items`}>
              <ShoppingCart className="size-[18px]" aria-hidden />
              <span className="hidden sm:inline">Cart</span>
              {lineCount > 0 && (
                <span className="price inline-flex h-5 min-w-5 items-center justify-center rounded-[2px] bg-ink px-1 text-[11px] font-bold text-board">
                  {lineCount}
                </span>
              )}
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-9">
        <Outlet />
      </main>
      <footer className="border-t border-line bg-board">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-ink-3 sm:px-6">
          <span>CarePlus demo store. Sample data only.</span>
          <span>All prices are bundle totals in Kuwaiti dinar (KWD).</span>
        </div>
      </footer>
    </div>
  )
}
