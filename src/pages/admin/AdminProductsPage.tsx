import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useDeleteProduct, useProducts } from '../../api/hooks'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { ProductImage } from '../../components/ProductImage'
import { Button, EmptyState, ErrorState, Spinner } from '../../components/ui'
import { categoryBand } from '../../lib/categoryBand'
import { formatKWD } from '../../lib/money'
import { tierSizeLabel } from '../../lib/pricing'
import type { Product } from '../../types'

export function AdminProductsPage() {
  const { data, isLoading, error, refetch } = useProducts()
  const del = useDeleteProduct()
  const [toDelete, setToDelete] = useState<Product | null>(null)

  const confirmDelete = async () => {
    if (!toDelete) return
    try {
      await del.mutateAsync(toDelete.id)
      toast.success(`Deleted "${toDelete.name}"`)
      setToDelete(null)
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const newButton = (
    <Link
      to="/admin/products/new"
      className="inline-flex items-center gap-2 rounded-carton bg-action px-4 py-2.5 text-sm font-semibold text-action-ink hover:bg-action-hover"
    >
      <Plus className="size-4" aria-hidden /> New product
    </Link>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-ink">Products {data && <span className="font-normal text-ink-2">({data.length})</span>}</h2>
        {newButton}
      </div>

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data?.length ? (
        <EmptyState title="No products yet" message="Create your first product with its pricing tiers." action={newButton} />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-carton border border-line bg-board">
          {data.map((p) => (
            <li key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="w-14 shrink-0 overflow-hidden rounded-[2px] border border-line"><div className={`h-1 ${categoryBand(p.category.name)}`} aria-hidden /><ProductImage src={p.imageUrl} alt="" className="aspect-square w-full" /></div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{p.name}</p>
                  <p className="text-xs text-ink-2">
                    {p.brand.name} · {p.category.name}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {p.tiers.map((t) => (
                      <span key={t.id} className="price rounded-carton bg-board-2 px-2 py-0.5 text-xs text-ink">
                        {tierSizeLabel(t.unitsPerBundle)} · {formatKWD(t.bundlePriceFils)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-2 sm:justify-end">
                <Link
                  to={`/admin/products/${p.id}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-carton px-3 py-2 text-sm font-semibold text-ink border border-line-2 hover:bg-board-2"
                >
                  <Pencil className="size-4" aria-hidden /> Edit
                </Link>
                <Button variant="ghost" className="text-danger hover:!bg-danger-soft" onClick={() => setToDelete(p)} aria-label={`Delete ${p.name}`}>
                  <Trash2 className="size-4" aria-hidden /> Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete product?"
        message={`"${toDelete?.name}" and all of its pricing tiers will be permanently removed from the store.`}
        loading={del.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
