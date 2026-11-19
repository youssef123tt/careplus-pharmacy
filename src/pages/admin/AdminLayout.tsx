import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/admin', label: 'Products', end: true },
  { to: '/admin/brands', label: 'Brands', end: false },
  { to: '/admin/categories', label: 'Categories', end: false },
]

export function AdminLayout() {
  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="carton-type text-5xl font-bold text-ink">Store management</h1>
        <p className="mt-1 text-sm text-ink-2">Changes are saved to the database and appear on the storefront immediately.</p>
      </div>
      <nav className="-mt-2 flex gap-1 overflow-x-auto border-b border-line" aria-label="Admin sections">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                isActive ? 'border-ink text-ink' : 'border-transparent text-ink-2 hover:text-ink'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
