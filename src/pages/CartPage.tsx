import { AlertCircle, ArrowLeft, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAllProducts } from '../api/hooks'
import { ProductImage } from '../components/ProductImage'
import { QuantityStepper } from '../components/QuantityStepper'
import { linkButton } from '../components/linkButton'
import { Button, EmptyState } from '../components/ui'
import { useCart } from '../context/CartContext'
import { resolveLines, summarize, type ResolvedLine } from '../lib/cart'
import { categoryBand } from '../lib/categoryBand'
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
            <Link to="/" className={linkButton.primary}>
              Start shopping
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-6">
        <h1 className="carton-type text-[2.6rem] font-bold sm:text-5xl">Shopping cart</h1>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> Continue shopping
        </Link>
      </div>

      {catalog.error && (
        <p role="alert" className="mb-4 flex items-center gap-2 rounded-carton bg-warn-soft px-4 py-3 text-sm text-warn">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          Couldn't refresh live prices. Showing the prices from when items were added.
        </p>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
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

        <aside className="h-fit overflow-hidden rounded-carton border border-line bg-board lg:sticky lg:top-24" aria-label="Cart summary">
          <div className="h-2.5 bg-ink" aria-hidden />
          <div className="p-5">
            <h2 className="carton-type text-2xl font-bold">Order summary</h2>
            <dl className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-2">Items</dt>
                <dd className="price font-medium">{summary.lineCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-2">Bundles</dt>
                <dd className="price font-medium">{summary.totalBundles}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-2">Total packs</dt>
                <dd className="price font-medium">{summary.totalPacks}</dd>
              </div>
            </dl>
          </div>
          <div className="perforation mx-5" aria-hidden />
          <div className="p-5">
            <div className="flex items-baseline justify-between">
              <span className="font-semibold">Total</span>
              <span className="price carton-type text-4xl font-bold" data-testid="cart-total">
                {formatKWD(summary.totalFils)}
              </span>
            </div>
            <Button className="mt-5 w-full" disabled title="Checkout is out of scope for this demo">
              Checkout (not available in demo)
            </Button>
            <Button variant="ghost" className="mt-2 w-full" onClick={() => dispatch({ type: 'clear' })}>
              Clear cart
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}

function CartLineItem({ line, onBundles, onRemove }: { line: ResolvedLine; onBundles: (n: number) => void; onRemove: () => void }) {
  const unavailable = line.status === 'unavailable'
  const band = line.product ? categoryBand(line.product.category.name) : 'bg-band-slate'
  return (
    <li className={`flex gap-3 overflow-hidden rounded-carton border bg-board p-3 sm:gap-5 sm:p-4 ${unavailable ? 'border-danger/60' : 'border-line'}`}>
      <div className="w-16 shrink-0 self-start overflow-hidden rounded-[2px] border border-line sm:w-24">
        <div className={`h-1.5 ${band}`} aria-hidden />
        <ProductImage src={line.imageUrl} alt="" className="aspect-square w-full" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {line.product ? (
            <Link to={`/products/${line.product.id}`} className="carton-type text-2xl font-bold text-ink decoration-2 hover:underline">
              {line.productName}
            </Link>
          ) : (
            <p className="carton-type text-2xl font-bold text-ink">{line.productName}</p>
          )}
          <p className="mt-1.5 text-sm text-ink-2">
            Offer: <span className="font-semibold text-ink">{tierSizeLabel(line.unitsPerBundle)}</span>
            {line.tierLabel && <span> · {line.tierLabel}</span>}
            <span className="price"> · {formatKWD(line.bundlePriceFils)} / bundle</span>
          </p>
          <p className="price mt-0.5 text-xs text-ink-3" data-testid="line-packs">
            {line.bundles} × {tierSizeLabel(line.unitsPerBundle)} = {line.packs} {line.packs === 1 ? 'pack' : 'packs'}
          </p>
          {unavailable && (
            <p className="mt-2 text-sm font-semibold text-danger">This offer is no longer available. Please remove it.</p>
          )}
          {!unavailable && line.priceChanged && (
            <p className="mt-2 inline-block rounded-[2px] bg-warn-soft px-2 py-0.5 text-xs font-semibold text-warn">
              The price of this offer was updated since you added it.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:flex-col sm:flex-nowrap sm:items-end">
          {!unavailable && <QuantityStepper size="sm" value={line.bundles} onChange={onBundles} label={`Bundles of ${line.productName}`} />}
          <p className={`price whitespace-nowrap text-lg font-bold ${unavailable ? 'text-ink-3 line-through' : 'text-ink'}`} data-testid="line-total">
            {formatKWD(line.lineTotalFils)}
          </p>
          <Button variant="ghost" onClick={onRemove} className="!px-2 !py-1 !text-danger hover:!bg-danger-soft" aria-label={`Remove ${line.productName}`}>
            <Trash2 className="size-4" aria-hidden /> <span className="hidden lg:inline">Remove</span>
          </Button>
        </div>
      </div>
    </li>
  )
}
