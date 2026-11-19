import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useDeleteProduct, useProducts } from '../../api/hooks'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { ProductImage } from '../../components/ProductImage'
import { Button, EmptyState, ErrorState, Spinner } from '../../components/ui'
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
      className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
    >
      <Plus className="size-4" aria-hidden /> New product
    </Link>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-slate-900">Products {data && <span className="font-normal text-slate-500">({data.length})</span>}</h2>
        {newButton}
      </div>

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data?.length ? (
        <EmptyState title="No products yet" message="Create your first product with its pricing tiers." action={newButton} />
      ) : (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {data.map((p) => (
            <li key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <ProductImage src={p.imageUrl} alt="" className="size-14 shrink-0 rounded-lg" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">
                    {p.brand.name} · {p.category.name}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {p.tiers.map((t) => (
                      <span key={t.id} className="price rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {tierSizeLabel(t.unitsPerBundle)} · {formatKWD(t.bundlePriceFils)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-2 sm:justify-end">
                <Link
                  to={`/admin/products/${p.id}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
                >
                  <Pencil className="size-4" aria-hidden /> Edit
                </Link>
                <Button variant="ghost" className="text-red-600 hover:!bg-red-50" onClick={() => setToDelete(p)} aria-label={`Delete ${p.name}`}>
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
