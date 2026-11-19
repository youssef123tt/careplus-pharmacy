import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useProduct } from '../api/hooks'
import { ProductImage } from '../components/ProductImage'
import { QuantityStepper } from '../components/QuantityStepper'
import { TierSelector } from '../components/TierSelector'
import { Badge, Button, EmptyState, ErrorState, Spinner } from '../components/ui'
import { useCart } from '../context/CartContext'
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
        action={<Link to="/" className="font-semibold text-brand-700 hover:underline">Back to the shop</Link>}
      />
    )
  }

  // Default to the first offer; also falls back if the chosen tier disappears after an admin edit.
  const tier = product.tiers.find((t) => t.id === tierId) ?? product.tiers[0]
  const total = tier ? lineTotalFils(tier.bundlePriceFils, bundles) : 0
  const packs = tier ? packQuantity(tier.unitsPerBundle, bundles) : 0

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
      <Link to="/" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-700">
        <ArrowLeft className="size-4" aria-hidden /> Back to products
      </Link>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="self-start overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <ProductImage src={product.imageUrl} alt={product.name} className="aspect-square w-full" />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <div className="flex flex-wrap gap-2">
              <Link to={`/?brand=${product.brand.id}`}>
                <Badge tone="brand">{product.brand.name}</Badge>
              </Link>
              <Link to={`/?category=${product.category.id}`}>
                <Badge>{product.category.name}</Badge>
              </Link>
            </div>
            <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">{product.name}</h1>
            {product.description && <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">{product.description}</p>}
          </div>

          <section aria-labelledby="offers-heading" className="flex flex-col gap-3">
            <h2 id="offers-heading" className="font-semibold text-slate-900">
              Choose an offer <span className="font-normal text-slate-500">({product.tiers.length} available)</span>
            </h2>
            {product.tiers.length === 0 ? (
              <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">This product has no offers available right now.</p>
            ) : (
              <TierSelector tiers={product.tiers} selectedId={tier?.id} onSelect={setTierId} name="tier" />
            )}
          </section>

          {tier && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5" aria-label="Order summary">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">Number of bundles</p>
                  <QuantityStepper value={bundles} onChange={setBundles} />
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">
                    {bundles} × {formatKWD(tier.bundlePriceFils)}
                  </p>
                  <p className="price text-2xl font-bold text-slate-900" data-testid="details-total">
                    {formatKWD(total)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                You get <span className="font-semibold text-slate-700">{packs} {packs === 1 ? 'pack' : 'packs'}</span> in total
                ({bundles} {bundles === 1 ? 'bundle' : 'bundles'} of {tierSizeLabel(tier.unitsPerBundle)}).
              </p>
              <Button onClick={addToCart} className="mt-4 w-full !py-3 text-base">
                <ShoppingCart className="size-5" aria-hidden /> Add to cart — {formatKWD(total)}
              </Button>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
