import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useProduct } from '../api/hooks'
import { ProductImage } from '../components/ProductImage'
import { QuantityStepper } from '../components/QuantityStepper'
import { TierSelector } from '../components/TierSelector'
import { Button, EmptyState, ErrorState, Spinner } from '../components/ui'
import { useCart } from '../context/CartContext'
import { categoryBand } from '../lib/categoryBand'
import { formatKWD } from '../lib/money'
import { lineTotalFils, packQuantity, tierSizeLabel } from '../lib/pricing'

export function ProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: product, isLoading, error, refetch } = useProduct(id)
  const { dispatch } = useCart()

  const [tierId, setTierId] = useState<string>()
  const [bundles, setBundles] = useState(1)

  if (isLoading) return <Spinner label="Loading product…" />
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />
  if (!product) {
    return (
      <EmptyState
        title="Product not found"
        message="This product may have been removed from the catalog."
        action={<Link to="/" className="font-semibold text-action hover:underline">Back to the shop</Link>}
      />
    )
  }

  // Default to the first offer; also falls back if the chosen tier disappears after an admin edit.
  const tier = product.tiers.find((t) => t.id === tierId) ?? product.tiers[0]
  const total = tier ? lineTotalFils(tier.bundlePriceFils, bundles) : 0
  const packs = tier ? packQuantity(tier.unitsPerBundle, bundles) : 0
  const band = categoryBand(product.category.name)

  const addToCart = () => {
    if (!tier) return
    dispatch({ type: 'add', product, tier, bundles })
    toast.success(`Added to cart`, {
      description: `${bundles} × ${tierSizeLabel(tier.unitsPerBundle)} of ${product.name}`,
      action: { label: 'View cart', onClick: () => navigate('/cart') },
    })
  }

  return (
    <div>
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Back to products
      </Link>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
        <div className="self-start overflow-hidden rounded-carton border border-line bg-board lg:sticky lg:top-24">
          <div className={`h-3 ${band}`} aria-hidden />
          <ProductImage src={product.imageUrl} alt={product.name} className="aspect-[16/10] w-full p-4 sm:aspect-square sm:p-8" />
          <div className="perforation" aria-hidden />
          <dl className="grid grid-cols-2 text-sm">
            <div className="border-r border-line px-5 py-3.5">
              <dt className="text-ink-3">Brand</dt>
              <dd><Link to={`/?brand=${product.brand.id}`} className="font-semibold text-ink decoration-2 hover:underline">{product.brand.name}</Link></dd>
            </div>
            <div className="px-5 py-3.5">
              <dt className="text-ink-3">Category</dt>
              <dd className="flex items-center gap-1.5"><span className={`size-2.5 shrink-0 rounded-[1px] ${band}`} aria-hidden /><Link to={`/?category=${product.category.id}`} className="font-semibold text-ink decoration-2 hover:underline">{product.category.name}</Link></dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-7">
          <div>
            <h1 className="carton-type text-[2.6rem] font-bold text-balance sm:text-6xl">{product.name}</h1>
            {product.description && (
              <p className="mt-5 max-w-[65ch] whitespace-pre-line text-[15px] leading-relaxed text-ink-2">{product.description}</p>
            )}
          </div>

          <section aria-labelledby="offers-heading" className="flex flex-col gap-3 border-t border-line pt-6">
            <h2 id="offers-heading" className="text-base font-semibold text-ink">
              Choose an offer <span className="font-normal text-ink-3">({product.tiers.length} available)</span>
            </h2>
            {product.tiers.length === 0 ? (
              <p className="rounded-carton bg-warn-soft px-4 py-3 text-sm text-warn">This product has no offers available right now.</p>
            ) : (
              <TierSelector tiers={product.tiers} selectedId={tier?.id} onSelect={setTierId} name="tier" />
            )}
          </section>

          {tier && (
            <section className="rounded-carton border border-line bg-board" aria-label="Order summary">
              <div className="flex flex-wrap items-end justify-between gap-5 p-5">
                <div>
                  <p className="mb-2 text-sm font-medium text-ink-2">Number of bundles</p>
                  <QuantityStepper value={bundles} onChange={setBundles} />
                </div>
                <div className="text-right">
                  <p className="price text-sm text-ink-3">
                    {bundles} × {formatKWD(tier.bundlePriceFils)}
                  </p>
                  <p className="price carton-type text-4xl font-bold text-ink" data-testid="details-total">
                    {formatKWD(total)}
                  </p>
                </div>
              </div>
              <div className="perforation mx-5" aria-hidden />
              <div className="flex flex-col gap-4 p-5">
                <p className="text-sm text-ink-2">
                  You get <span className="font-semibold text-ink">{packs} {packs === 1 ? 'pack' : 'packs'}</span> in total
                  ({bundles} {bundles === 1 ? 'bundle' : 'bundles'} of {tierSizeLabel(tier.unitsPerBundle)}).
                </p>
                <Button onClick={addToCart} className="w-full !py-3.5 text-base">
                  <ShoppingCart className="size-5" aria-hidden /> Add to cart — {formatKWD(total)}
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
