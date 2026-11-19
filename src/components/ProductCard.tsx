import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useCart } from '../context/CartContext'
import { formatKWD } from '../lib/money'
import { tierSizeLabel } from '../lib/pricing'
import type { Product } from '../types'
import { ProductImage } from './ProductImage'
import { TierSelector } from './TierSelector'
import { Button } from './ui'

export function ProductCard({ product }: { product: Product }) {
  const { dispatch } = useCart()
  const [tierId, setTierId] = useState(product.tiers[0]?.id)
  const tier = product.tiers.find((t) => t.id === tierId) ?? product.tiers[0]

  const addToCart = () => {
    if (!tier) return
    dispatch({ type: 'add', product, tier, bundles: 1 })
    toast.success(`Added ${product.name}`, { description: `1 × ${tierSizeLabel(tier.unitsPerBundle)} — ${formatKWD(tier.bundlePriceFils)}` })
  }

  const href = `/products/${product.id}`
  const optionCount = product.tiers.length

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Link to={href} className="block aspect-square overflow-hidden bg-slate-100" tabIndex={-1} aria-hidden>
        <ProductImage src={product.imageUrl} alt="" className="size-full transition duration-300 group-hover:scale-105" />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-700">
            {product.brand.name} <span className="text-slate-300">·</span>{' '}
            <span className="text-slate-500">{product.category.name}</span>
          </p>
          <h3 className="mt-1 font-semibold leading-snug text-slate-900">
            <Link to={href} className="hover:text-brand-700 hover:underline">
              {product.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {optionCount === 0 ? 'No offers available' : optionCount === 1 ? '1 pricing option' : `${optionCount} pricing options`}
          </p>
        </div>

        {optionCount > 0 && (
          <TierSelector compact tiers={product.tiers} selectedId={tier?.id} onSelect={setTierId} name={`tier-${product.id}`} />
        )}

        <div className="mt-auto flex gap-2 pt-1">
          <Button onClick={addToCart} disabled={!tier} className="flex-1">
            <ShoppingCart className="size-4" aria-hidden /> Add to cart
          </Button>
          <Link
            to={href}
            className="inline-flex items-center justify-center rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  )
}
