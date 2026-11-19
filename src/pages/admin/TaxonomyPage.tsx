import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import type { TaxonomyTable, TaxonomyWithCount } from '../../api/catalog'
import { useTaxonomy, useTaxonomyMutations } from '../../api/hooks'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { Button, EmptyState, ErrorState, Spinner } from '../../components/ui'

const copy = {
  brands: { singular: 'brand', plural: 'Brands', placeholder: 'e.g. NatureMed' },
  categories: { singular: 'category', plural: 'Categories', placeholder: 'e.g. Baby Care' },
}

function validateName(name: string): string | null {
  const n = name.trim()
  if (!n) return 'Name is required'
  if (n.length > 80) return 'Name is too long (max 80 characters)'
  return null
}

/** Manage brands or categories: create, rename, delete (blocked by the DB if products still use it). */
export function TaxonomyPage({ table }: { table: TaxonomyTable }) {
  const c = copy[table]
  const { data, isLoading, error, refetch } = useTaxonomy(table)
  const { create, rename, remove } = useTaxonomyMutations(table)
  const [newName, setNewName] = useState('')
  const [newError, setNewError] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<TaxonomyWithCount | null>(null)

  const onCreate = async (e: FormEvent) => {
    e.preventDefault()
    const err = validateName(newName)
    setNewError(err)
    if (err) return
    try {
      await create.mutateAsync(newName)
      toast.success(`Added ${c.singular} "${newName.trim()}"`)
      setNewName('')
    } catch (e) {
      setNewError((e as Error).message)
    }
  }

  const onDelete = async () => {
    if (!toDelete) return
    try {
      await remove.mutateAsync(toDelete.id)
      toast.success(`Deleted "${toDelete.name}"`)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setToDelete(null)
    }
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="order-2 lg:order-1">
        <h2 className="mb-3 font-semibold text-slate-900">{c.plural}</h2>
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : !data?.length ? (
          <EmptyState title={`No ${c.plural.toLowerCase()} yet`} message={`Add a ${c.singular} using the form.`} />
        ) : (
          <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {data.map((item) => (
              <TaxonomyRow
                key={item.id}
                item={item}
                saving={rename.isPending && rename.variables?.id === item.id}
                onRename={(name) => rename.mutateAsync({ id: item.id, name })}
                onDelete={() => setToDelete(item)}
              />
            ))}
          </ul>
        )}
      </section>

      <form onSubmit={onCreate} noValidate className="order-1 h-fit rounded-2xl border border-slate-200 bg-white p-5 lg:order-2">
        <h2 className="font-semibold text-slate-900">Add {c.singular}</h2>
        <label htmlFor="new-name" className="mt-3 block text-sm font-medium text-slate-700">Name</label>
        <input
          id="new-name"
          value={newName}
          onChange={(e) => { setNewName(e.target.value); setNewError(null) }}
          placeholder={c.placeholder}
          className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
            newError ? 'border-red-400 focus:ring-red-500/20' : 'border-slate-300 focus:border-brand-600 focus:ring-brand-600/20'
          }`}
        />
        {newError && <p className="mt-1 text-xs text-red-600">{newError}</p>}
        <Button type="submit" className="mt-4 w-full" loading={create.isPending}>
          <Plus className="size-4" aria-hidden /> Add {c.singular}
        </Button>
      </form>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Delete ${c.singular}?`}
        message={
          toDelete && toDelete.productCount > 0
            ? `"${toDelete.name}" is used by ${toDelete.productCount} product(s). The database will block this deletion until those products are reassigned or deleted.`
            : `"${toDelete?.name}" will be permanently deleted.`
        }
        loading={remove.isPending}
        onConfirm={onDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}

function TaxonomyRow({
  item,
  saving,
  onRename,
  onDelete,
}: {
  item: TaxonomyWithCount
  saving: boolean
  onRename: (name: string) => Promise<void>
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(item.name)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const err = validateName(name)
    if (err) return setError(err)
    if (name.trim() === item.name) return setEditing(false)
    try {
      await onRename(name)
      toast.success('Renamed')
      setEditing(false)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  if (editing) {
    return (
      <li className="p-3">
        <form onSubmit={submit} className="flex items-start gap-2">
          <div className="flex-1">
            <input
              autoFocus
              aria-label="Name"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null) }}
              onKeyDown={(e) => e.key === 'Escape' && (setEditing(false), setName(item.name), setError(null))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>
          <Button type="submit" className="!px-3" loading={saving} aria-label="Save name">
            <Check className="size-4" aria-hidden />
          </Button>
          <Button variant="ghost" className="!px-3" aria-label="Cancel" onClick={() => { setEditing(false); setName(item.name); setError(null) }}>
            <X className="size-4" aria-hidden />
          </Button>
        </form>
      </li>
    )
  }

  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-900">{item.name}</p>
        <p className="text-xs text-slate-500">{item.productCount} product{item.productCount === 1 ? '' : 's'}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" className="!px-3" onClick={() => setEditing(true)} aria-label={`Rename ${item.name}`}>
          <Pencil className="size-4" aria-hidden />
        </Button>
        <Button variant="ghost" className="!px-3 text-red-600 hover:!bg-red-50" onClick={onDelete} aria-label={`Delete ${item.name}`}>
          <Trash2 className="size-4" aria-hidden />
        </Button>
      </div>
    </li>
  )
}
