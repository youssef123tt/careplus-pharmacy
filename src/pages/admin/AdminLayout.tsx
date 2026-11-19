import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/admin', label: 'Products', end: true },
  { to: '/admin/brands', label: 'Brands', end: false },
  { to: '/admin/categories', label: 'Categories', end: false },
]

export function AdminLayout() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Store management</h1>
        <p className="mt-1 text-sm text-slate-500">Changes are saved to the database and appear on the storefront immediately.</p>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-b border-slate-200" aria-label="Admin sections">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                isActive ? 'border-brand-700 text-brand-800' : 'border-transparent text-slate-500 hover:text-slate-800'
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
