import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTaxonomy,
  deleteProduct,
  deleteTaxonomy,
  fetchProduct,
  fetchProducts,
  fetchTaxonomy,
  renameTaxonomy,
  saveProduct,
  type ProductFilters,
  type ProductInput,
  type TaxonomyTable,
} from './catalog'

export const queryKeys = {
  products: (filters: ProductFilters = {}) => ['products', filters] as const,
  allProducts: ['products'] as const,
  product: (id: string) => ['product', id] as const,
  taxonomy: (table: TaxonomyTable) => ['taxonomy', table] as const,
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: queryKeys.products(filters),
    queryFn: () => fetchProducts(filters),
    placeholderData: keepPreviousData,
  })
}

/** Full catalog — used by the cart to price lines with live data. */
export function useAllProducts() {
  return useQuery({ queryKey: queryKeys.products({}), queryFn: () => fetchProducts({}) })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.product(id ?? ''),
    queryFn: () => fetchProduct(id!),
    enabled: Boolean(id),
  })
}

export function useTaxonomy(table: TaxonomyTable) {
  return useQuery({ queryKey: queryKeys.taxonomy(table), queryFn: () => fetchTaxonomy(table) })
}

/** After any catalog write, refetch everything the storefront shows. */
function useInvalidateCatalog() {
  const qc = useQueryClient()
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.allProducts }),
      qc.invalidateQueries({ queryKey: ['product'] }),
      qc.invalidateQueries({ queryKey: ['taxonomy'] }),
    ])
}

export function useSaveProduct() {
  const invalidate = useInvalidateCatalog()
  return useMutation({ mutationFn: (input: ProductInput) => saveProduct(input), onSuccess: invalidate })
}

export function useDeleteProduct() {
  const invalidate = useInvalidateCatalog()
  return useMutation({ mutationFn: (id: string) => deleteProduct(id), onSuccess: invalidate })
}

export function useTaxonomyMutations(table: TaxonomyTable) {
  const invalidate = useInvalidateCatalog()
  return {
    create: useMutation({ mutationFn: (name: string) => createTaxonomy(table, name), onSuccess: invalidate }),
    rename: useMutation({
      mutationFn: ({ id, name }: { id: string; name: string }) => renameTaxonomy(table, id, name),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: (id: string) => deleteTaxonomy(table, id), onSuccess: invalidate }),
  }
}
