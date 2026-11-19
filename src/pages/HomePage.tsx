import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts, useTaxonomy } from '../api/hooks'
import type { TaxonomyWithCount } from '../api/catalog'
import { ProductCard } from '../components/ProductCard'
import { Button, EmptyState, ErrorState, Spinner } from '../components/ui'
import { categoryBand } from '../lib/categoryBand'

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
    <div className="flex flex-col gap-6 sm:gap-7">
      <section className="flex flex-col gap-3 border-b border-line pb-6 sm:pb-7 md:flex-row md:items-end md:justify-between md:gap-10">
        <h1 className="carton-type max-w-3xl text-[2.6rem] font-bold text-balance sm:text-6xl">
          Health essentials, priced by the pack
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-ink-2 sm:text-[15px] md:text-right">
          Buy a single pack or a bundle. Every price shown is the total for the whole bundle, in Kuwaiti dinar.
        </p>
      </section>

      <aside className="flex min-w-0 flex-col gap-4" aria-label="Filters">
        <CategoryTabs
          items={categories.data}
          loading={categories.isLoading}
          error={categories.error}
          activeId={categoryId}
          onSelect={(id) => setParam('category', id)}
        />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <BrandChips
            items={brands.data}
            loading={brands.isLoading}
            error={brands.error}
            activeId={brandId}
            onSelect={(id) => setParam('brand', id)}
          />
          <div className="relative lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
            <input
              type="search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className="h-10 w-full rounded-carton border border-line-2 bg-board pl-9 pr-3 text-sm text-ink placeholder:text-ink-3 focus:border-ink"
            />
          </div>
        </div>
      </aside>

      <section aria-labelledby="results-heading" className="min-w-0">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="results-heading" className="text-lg font-semibold text-ink">
            {activeCategory?.name ?? 'All products'}
            {activeBrand && <span className="font-normal text-ink-2"> by {activeBrand.name}</span>}
            {products.data && <span className="price ml-2 text-sm font-normal text-ink-3">({products.data.length})</span>}
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
            className={`grid gap-4 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 ${products.isPlaceholderData ? 'opacity-55' : ''}`}
          >
            {products.data?.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  )
}

interface FilterProps {
  items: TaxonomyWithCount[] | undefined
  loading: boolean
  error: unknown
  activeId: string | undefined
  onSelect: (id: string | undefined) => void
}

/** Categories as carton tabs, each underlined in its printed band colour. */
function CategoryTabs({ items, loading, error, activeId, onSelect }: FilterProps) {
  if (loading) return <div className="h-11 animate-pulse rounded-carton bg-board-2" />
  if (error) return <p className="text-sm text-danger">Couldn't load categories.</p>
  const tab = (active: boolean) =>
    `group relative flex h-11 shrink-0 items-center gap-2 whitespace-nowrap px-3.5 text-[15px] transition-colors ${
      active ? 'font-semibold text-ink' : 'text-ink-2 hover:text-ink'
    }`
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max border-b border-line" aria-label="Categories">
        <li>
          <button type="button" className={tab(!activeId)} aria-pressed={!activeId} onClick={() => onSelect(undefined)}>
            All
            <span className={`absolute inset-x-1 -bottom-px bg-ink transition-[height] duration-150 ${!activeId ? 'h-[5px]' : 'h-0'}`} aria-hidden />
          </button>
        </li>
        {items?.map((item) => {
          const active = item.id === activeId
          const band = categoryBand(item.name)
          return (
            <li key={item.id}>
              <button
                type="button"
                className={tab(active)}
                aria-pressed={active}
                onClick={() => onSelect(active ? undefined : item.id)}
              >
                {item.name}
                <span className="price text-xs font-normal text-ink-3">{item.productCount}</span>
                <span
                  className={`absolute inset-x-1 -bottom-px ${band} transition-[height] duration-150 ${active ? 'h-[5px]' : 'h-[2px] group-hover:h-[3px]'}`}
                  aria-hidden
                />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function BrandChips({ items, loading, error, activeId, onSelect }: FilterProps) {
  if (loading) return <div className="h-9 w-80 animate-pulse rounded-carton bg-board-2" />
  if (error) return <p className="text-sm text-danger">Couldn't load brands.</p>
  const chip = (active: boolean) =>
    `inline-flex h-9 shrink-0 items-center gap-2 rounded-carton border px-3 text-sm font-medium transition-colors ${
      active ? 'border-ink bg-ink text-board' : 'border-line-2 bg-board text-ink hover:border-ink'
    }`
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="shrink-0 text-sm text-ink-2">Brand</span>
      <ul className="-mr-4 flex gap-1.5 overflow-x-auto pr-4 sm:mr-0 sm:flex-wrap sm:pr-0" aria-label="Brands">
        <li>
          <button type="button" className={chip(!activeId)} aria-pressed={!activeId} onClick={() => onSelect(undefined)}>
            All
          </button>
        </li>
        {items?.map((item) => {
          const active = item.id === activeId
          return (
            <li key={item.id}>
              <button type="button" className={chip(active)} aria-pressed={active} onClick={() => onSelect(active ? undefined : item.id)}>
                {item.name}
                <span className={`price text-xs ${active ? 'text-board/70' : 'text-ink-3'}`}>{item.productCount}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
