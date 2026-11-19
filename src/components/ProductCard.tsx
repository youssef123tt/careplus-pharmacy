import { ArrowRight, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useCart } from '../context/CartContext'
import { categoryBand } from '../lib/categoryBand'
import { formatKWD } from '../lib/money'
import { tierSizeLabel } from '../lib/pricing'
import type { Product } from '../types'
import { ProductImage } from './ProductImage'
import { TierSelector } from './TierSelector'
import { Button } from './ui'

/** A product drawn as the face of its medicine carton, with offers on the side panel. */
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
    <article className="flex flex-col overflow-hidden rounded-carton border border-line bg-board transition-[border-color,box-shadow] duration-200 hover:border-line-2 hover:shadow-[0_6px_18px_-10px_rgb(0_0_0/0.35)]">
      <div className={`h-2.5 ${categoryBand(product.category.name)}`} aria-hidden />

      <div className="grid grid-cols-[1fr_7.5rem] gap-4 px-5 pt-4 sm:grid-cols-[1fr_8.5rem]">
        <div className="flex min-w-0 flex-col">
          <h3 className="carton-type text-[1.9rem] font-bold text-balance text-ink">
            <Link to={href} className="decoration-2 hover:underline">
              {product.name}
            </Link>
          </h3>
          <p className="mt-3 text-sm font-semibold text-ink">{product.brand.name}</p>
          <p className="text-sm text-ink-2">{product.category.name}</p>
          {optionCount === 0 && <p className="mt-2 text-xs text-ink-3">No offers available</p>}
        </div>
        <Link to={href} tabIndex={-1} aria-hidden className="block aspect-[3/4] overflow-hidden rounded-[2px] bg-board-2">
          <ProductImage src={product.imageUrl} alt="" className="size-full" />
        </Link>
      </div>

      <div className="perforation mx-5 mt-4" aria-hidden />

      <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-3.5">
        {optionCount > 0 && (
          <TierSelector compact tiers={product.tiers} selectedId={tier?.id} onSelect={setTierId} name={`tier-${product.id}`} />
        )}
        <div className="mt-auto flex gap-2 pt-1">
          <Button onClick={addToCart} disabled={!tier} className="flex-1">
            <ShoppingCart className="size-4" aria-hidden />
            <span className="price">Add to cart{tier ? ` — ${formatKWD(tier.bundlePriceFils)}` : ''}</span>
          </Button>
          <Link
            to={href}
            className="inline-flex items-center gap-1 rounded-carton px-3 text-sm font-semibold text-ink-2 hover:bg-board-2 hover:text-ink"
          >
            Details <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  )
}
