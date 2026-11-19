import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts, useTaxonomy } from '../api/hooks'
import type { TaxonomyWithCount } from '../api/catalog'
import { ProductCard } from '../components/ProductCard'
import { Button, EmptyState, ErrorState, Spinner } from '../components/ui'

/** Storefront: browse by brand and category (filters live in the URL so they are shareable). */
export function HomePage() {
  const [params, setParams] = useSearchParams()
  const brandId = params.get('brand') ?? undefined
  const categoryId = params.get('category') ?? undefined
  const search = params.get('q') ?? ''

  const [searchDraft, setSearchDraft] = useState(search)
  // Sync the input when the URL changes from outside (e.g. "Clear filters", back button).
  const [prevSearch, setPrevSearch] = useState(search)
  if (prevSearch !== search) {
    setPrevSearch(search)
    setSearchDraft(search)
  }

  // Debounce search typing into the URL.
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchDraft.trim() !== search) setParam('q', searchDraft.trim() || undefined)
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft])

  const brands = useTaxonomy('brands')
  const categories = useTaxonomy('categories')
  const products = useProducts({ brandId, categoryId, search })

  function setParam(key: string, value: string | undefined) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: key === 'q' },
    )
  }

  const hasFilters = Boolean(brandId || categoryId || search)
  const clearAll = () => setParams({})
  const activeBrand = brands.data?.find((b) => b.id === brandId)
  const activeCategory = categories.data?.find((c) => c.id === categoryId)

  return (
    <div className="flex flex-col gap-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 px-6 py-8 text-white sm:px-10 sm:py-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-200">Your health, delivered</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">Healthcare essentials, with better value in bundles</h1>
        <p className="mt-3 max-w-xl text-brand-100">
          Choose single packs or save with multi-pack offers. Every price shown is the total price for the bundle.
        </p>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="flex min-w-0 flex-col gap-5" aria-label="Filters">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            />
          </div>
          <FilterGroup
            title="Categories"
            items={categories.data}
            loading={categories.isLoading}
            error={categories.error}
            activeId={categoryId}
            onSelect={(id) => setParam('category', id)}
          />
          <FilterGroup
            title="Brands"
            items={brands.data}
            loading={brands.isLoading}
            error={brands.error}
            activeId={brandId}
            onSelect={(id) => setParam('brand', id)}
          />
        </aside>

        <section aria-labelledby="results-heading" className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="results-heading" className="text-lg font-semibold text-slate-900">
              {activeCategory?.name ?? 'All products'}
              {activeBrand && <span className="font-normal text-slate-500"> by {activeBrand.name}</span>}
              {products.data && (
                <span className="ml-2 text-sm font-normal text-slate-500">({products.data.length})</span>
              )}
            </h2>
            {hasFilters && (
              <Button variant="ghost" onClick={clearAll} className="!px-2 !py-1">
                <X className="size-4" aria-hidden /> Clear filters
              </Button>
            )}
          </div>

          {products.isLoading ? (
            <Spinner label="Loading products…" />
          ) : products.error ? (
            <ErrorState error={products.error} onRetry={() => products.refetch()} />
          ) : products.data && products.data.length === 0 ? (
            <EmptyState
              title="No products found"
              message={hasFilters ? 'Try a different brand, category or search term.' : 'The catalog is empty. Add products from the admin panel.'}
              action={hasFilters ? <Button variant="secondary" onClick={clearAll}>Clear filters</Button> : undefined}
            />
          ) : (
            <div
              className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 transition-opacity ${products.isPlaceholderData ? 'opacity-60' : ''}`}
            >
              {products.data?.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function FilterGroup({
  title,
  items,
  loading,
  error,
  activeId,
  onSelect,
}: {
  title: string
  items: TaxonomyWithCount[] | undefined
  loading: boolean
  error: unknown
  activeId: string | undefined
  onSelect: (id: string | undefined) => void
}) {
  const chip = (active: boolean) =>
    `flex shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition lg:w-full ${
      active ? 'bg-brand-700 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 lg:ring-0 lg:bg-transparent lg:hover:bg-slate-100'
    }`
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      {loading ? (
        <div className="h-24 animate-pulse rounded-lg bg-slate-200/70" />
      ) : error ? (
        <p className="text-sm text-red-600">Couldn't load {title.toLowerCase()}.</p>
      ) : (
        <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0">
          <li>
            <button type="button" className={chip(!activeId)} aria-pressed={!activeId} onClick={() => onSelect(undefined)}>
              All
            </button>
          </li>
          {items?.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={chip(item.id === activeId)}
                aria-pressed={item.id === activeId}
                onClick={() => onSelect(item.id === activeId ? undefined : item.id)}
              >
                <span className="whitespace-nowrap">{item.name}</span>
                <span className={`text-xs ${item.id === activeId ? 'text-brand-100' : 'text-slate-400'}`}>{item.productCount}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
