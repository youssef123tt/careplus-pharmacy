import { AlertCircle, ArrowLeft, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAllProducts } from '../api/hooks'
import { ProductImage } from '../components/ProductImage'
import { QuantityStepper } from '../components/QuantityStepper'
import { Button, EmptyState } from '../components/ui'
import { useCart } from '../context/CartContext'
import { resolveLines, summarize, type ResolvedLine } from '../lib/cart'
import { formatKWD } from '../lib/money'
import { tierSizeLabel } from '../lib/pricing'

export function CartPage() {
  const { state, dispatch } = useCart()
  const catalog = useAllProducts()
  const resolved = useMemo(() => resolveLines(state.lines, catalog.data), [state.lines, catalog.data])
  const summary = summarize(resolved)

  if (state.lines.length === 0) {
    return (
      <div className="py-6">
        <EmptyState
          title="Your cart is empty"
          message="Browse our healthcare products and add an offer to get started."
          action={
            <Link to="/" className="inline-flex rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
              Start shopping
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Shopping cart</h1>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-700">
          <ArrowLeft className="size-4" aria-hidden /> Continue shopping
        </Link>
      </div>

      {catalog.error && (
        <p role="alert" className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          Couldn't refresh live prices. Showing the prices from when items were added.
        </p>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ul className="flex flex-col gap-3" aria-label="Cart items">
          {resolved.map((r) => (
            <CartLineItem
              key={r.key}
              line={r}
              onBundles={(bundles) => dispatch({ type: 'setBundles', key: r.key, bundles })}
              onRemove={() => dispatch({ type: 'remove', key: r.key })}
            />
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24" aria-label="Cart summary">
          <h2 className="font-semibold text-slate-900">Order summary</h2>
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Items</dt>
              <dd className="price">{summary.lineCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Bundles</dt>
              <dd className="price">{summary.totalBundles}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Total packs</dt>
              <dd className="price">{summary.totalPacks}</dd>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t border-slate-200 pt-3">
              <dt className="font-semibold text-slate-900">Total</dt>
              <dd className="price text-xl font-bold text-slate-900" data-testid="cart-total">
                {formatKWD(summary.totalFils)}
              </dd>
            </div>
          </dl>
          <Button className="mt-5 w-full" disabled title="Checkout is out of scope for this demo">
            Checkout (not available in demo)
          </Button>
          <Button variant="ghost" className="mt-2 w-full" onClick={() => dispatch({ type: 'clear' })}>
            Clear cart
          </Button>
        </aside>
      </div>
    </div>
  )
}

function CartLineItem({ line, onBundles, onRemove }: { line: ResolvedLine; onBundles: (n: number) => void; onRemove: () => void }) {
  const unavailable = line.status === 'unavailable'
  return (
    <li className={`flex gap-3 rounded-2xl border bg-white p-3 sm:gap-4 sm:p-4 ${unavailable ? 'border-red-200 bg-red-50/40' : 'border-slate-200'}`}>
      <ProductImage src={line.imageUrl} alt="" className="size-16 shrink-0 rounded-xl sm:size-24" />
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {line.product ? (
            <Link to={`/products/${line.product.id}`} className="font-semibold text-slate-900 hover:text-brand-700 hover:underline">
              {line.productName}
            </Link>
          ) : (
            <p className="font-semibold text-slate-900">{line.productName}</p>
          )}
          <p className="mt-0.5 text-sm text-slate-600">
            Offer: <span className="font-medium">{tierSizeLabel(line.unitsPerBundle)}</span>
            {line.tierLabel && <span className="text-slate-500"> · {line.tierLabel}</span>}
            <span className="price text-slate-500"> · {formatKWD(line.bundlePriceFils)} / bundle</span>
          </p>
          <p className="mt-0.5 text-xs text-slate-500" data-testid="line-packs">
            {line.bundles} × {tierSizeLabel(line.unitsPerBundle)} = {line.packs} {line.packs === 1 ? 'pack' : 'packs'}
          </p>
          {unavailable && (
            <p className="mt-2 text-sm font-medium text-red-700">This offer is no longer available. Please remove it.</p>
          )}
          {!unavailable && line.priceChanged && (
            <p className="mt-2 text-xs font-medium text-amber-700">The price of this offer was updated since you added it.</p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:flex-col sm:flex-nowrap sm:items-end">
          {!unavailable && <QuantityStepper size="sm" value={line.bundles} onChange={onBundles} label={`Bundles of ${line.productName}`} />}
          <p className={`price whitespace-nowrap font-bold ${unavailable ? 'text-slate-400 line-through' : 'text-slate-900'}`} data-testid="line-total">
            {formatKWD(line.lineTotalFils)}
          </p>
          <Button variant="ghost" onClick={onRemove} className="!px-2 !py-1 text-red-600 hover:!bg-red-50" aria-label={`Remove ${line.productName}`}>
            <Trash2 className="size-4" aria-hidden /> <span className="hidden lg:inline">Remove</span>
          </Button>
        </div>
      </div>
    </li>
  )
}
