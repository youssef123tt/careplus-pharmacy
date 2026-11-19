import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ImagePlus, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { uploadProductImage } from '../../api/catalog'
import { useProduct, useSaveProduct, useTaxonomy } from '../../api/hooks'
import { ProductImage } from '../../components/ProductImage'
import { Button, EmptyState, ErrorState, Spinner } from '../../components/ui'
import { formatKWD, parseKwdInput } from '../../lib/money'
import { perPackFils } from '../../lib/pricing'
import {
  emptyTier,
  formValuesToInput,
  productFormSchema,
  productToFormValues,
  type ProductFormValues,
} from '../../lib/productForm'

const inputClass = (invalid?: boolean) =>
  `w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
    invalid ? 'border-red-400 focus:ring-red-500/20' : 'border-slate-300 focus:border-brand-600 focus:ring-brand-600/20'
  }`

export function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const product = useProduct(id)
  const brands = useTaxonomy('brands')
  const categories = useTaxonomy('categories')

  if ((isEdit && product.isLoading) || brands.isLoading || categories.isLoading) return <Spinner />
  const err = product.error || brands.error || categories.error
  if (err) return <ErrorState error={err} onRetry={() => { product.refetch(); brands.refetch(); categories.refetch() }} />
  if (isEdit && !product.data) {
    return <EmptyState title="Product not found" action={<Link to="/admin" className="font-semibold text-brand-700">Back to products</Link>} />
  }

  return (
    <ProductForm
      key={id ?? 'new'}
      productId={id}
      defaults={productToFormValues(product.data)}
      brands={brands.data ?? []}
      categories={categories.data ?? []}
    />
  )
}

function ProductForm({
  productId,
  defaults,
  brands,
  categories,
}: {
  productId?: string
  defaults: ProductFormValues
  brands: { id: string; name: string }[]
  categories: { id: string; name: string }[]
}) {
  const navigate = useNavigate()
  const save = useSaveProduct()
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProductFormValues>({ resolver: zodResolver(productFormSchema), defaultValues: defaults, mode: 'onTouched' })
  const { fields, append, remove } = useFieldArray({ control, name: 'tiers' })

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty && !save.isSuccess) e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty, save.isSuccess])

  const imageUrl = useWatch({ control, name: 'imageUrl' })
  const tiers = useWatch({ control, name: 'tiers' })

  const onUpload = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadProductImage(file)
      setValue('imageUrl', url, { shouldDirty: true, shouldValidate: true })
      toast.success('Image uploaded')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await save.mutateAsync(formValuesToInput(values, productId))
      toast.success(productId ? 'Product updated' : 'Product created')
      navigate('/admin')
    } catch (e) {
      toast.error((e as Error).message)
    }
  })

  const noTaxonomy = brands.length === 0 || categories.length === 0

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-700">
            <ArrowLeft className="size-4" aria-hidden /> All products
          </Link>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">{productId ? 'Edit product' : 'New product'}</h2>
        </div>
      </div>

      {noTaxonomy && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You need at least one brand and one category before creating a product.{' '}
          <Link to={brands.length === 0 ? '/admin/brands' : '/admin/categories'} className="font-semibold underline">
            Add them here
          </Link>
          .
        </p>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-semibold text-slate-900">Product information</h3>
          <Field label="Name" error={errors.name?.message} htmlFor="name">
            <input id="name" {...register('name')} className={inputClass(!!errors.name)} placeholder="e.g. Vitamin D3 1000 IU" />
          </Field>
          <Field label="Description" error={errors.description?.message} htmlFor="description">
            <textarea id="description" rows={5} {...register('description')} className={inputClass(!!errors.description)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Brand" error={errors.brandId?.message} htmlFor="brandId">
              <select id="brandId" {...register('brandId')} className={inputClass(!!errors.brandId)}>
                <option value="">Select a brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Category" error={errors.categoryId?.message} htmlFor="categoryId">
              <select id="categoryId" {...register('categoryId')} className={inputClass(!!errors.categoryId)}>
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-semibold text-slate-900">Image</h3>
          <ProductImage src={imageUrl || null} alt="Product preview" className="aspect-square w-full rounded-xl" />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onUpload(e.target.files?.[0])}
          />
          <Button variant="secondary" onClick={() => fileRef.current?.click()} loading={uploading}>
            <ImagePlus className="size-4" aria-hidden /> Upload image
          </Button>
          <Field label="…or image URL" error={errors.imageUrl?.message} htmlFor="imageUrl">
            <input id="imageUrl" {...register('imageUrl')} className={inputClass(!!errors.imageUrl)} placeholder="https://…" />
          </Field>
        </section>
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">Pricing tiers</h3>
            <p className="text-sm text-slate-500">
              Each tier is an independent bundle offer. The bundle price is the total price for all packs in the bundle.
            </p>
          </div>
          <Button variant="secondary" onClick={() => append(emptyTier())}>
            <Plus className="size-4" aria-hidden /> Add tier
          </Button>
        </div>

        {errors.tiers?.root?.message && <p className="text-sm text-red-600">{errors.tiers.root.message}</p>}
        {errors.tiers?.message && <p className="text-sm text-red-600">{errors.tiers.message}</p>}

        <ul className="flex flex-col gap-3">
          {fields.map((field, index) => {
            const e = errors.tiers?.[index]
            const t = tiers?.[index]
            const fils = t ? parseKwdInput(t.price ?? '') : null
            const units = t ? Number(t.units) : NaN
            const preview = fils && Number.isInteger(units) && units > 0 ? perPackFils({ bundlePriceFils: fils, unitsPerBundle: units }) : null
            return (
              <li key={field.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-[1fr_140px_160px_auto] sm:items-start">
                <Field label="Label (optional)" error={e?.label?.message} htmlFor={`tiers.${index}.label`}>
                  <input id={`tiers.${index}.label`} {...register(`tiers.${index}.label`)} className={inputClass(!!e?.label)} placeholder="e.g. Value pack" />
                </Field>
                <Field label="Units per bundle" error={e?.units?.message} htmlFor={`tiers.${index}.units`}>
                  <input
                    id={`tiers.${index}.units`}
                    inputMode="numeric"
                    {...register(`tiers.${index}.units`)}
                    className={inputClass(!!e?.units)}
                    placeholder="4"
                  />
                </Field>
                <Field
                  label="Bundle price (KWD)"
                  error={e?.price?.message}
                  htmlFor={`tiers.${index}.price`}
                  hint={preview !== null && units > 1 ? `≈ ${formatKWD(preview)} per pack` : undefined}
                >
                  <input
                    id={`tiers.${index}.price`}
                    inputMode="decimal"
                    {...register(`tiers.${index}.price`)}
                    className={`price ${inputClass(!!e?.price)}`}
                    placeholder="19.500"
                  />
                </Field>
                <div className="sm:pt-6">
                  <Button
                    variant="ghost"
                    className="w-full text-red-600 hover:!bg-red-50 sm:w-auto"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    aria-label={`Remove tier ${index + 1}`}
                    title={fields.length === 1 ? 'A product needs at least one tier' : 'Remove tier'}
                  >
                    <Trash2 className="size-4" aria-hidden /> <span className="sm:hidden">Remove tier</span>
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <Link to="/admin" className="inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50">
          Cancel
        </Link>
        <Button type="submit" loading={save.isPending} disabled={uploading || noTaxonomy}>
          {productId ? 'Save changes' : 'Create product'}
        </Button>
      </div>
    </form>
  )
}

function Field({ label, error, hint, htmlFor, children }: { label: string; error?: string; hint?: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : hint ? <p className="price text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}
