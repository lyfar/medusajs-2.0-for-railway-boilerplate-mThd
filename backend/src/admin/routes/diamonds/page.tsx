// @ts-nocheck
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Text } from "@medusajs/ui"
import {
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  useDataTable,
} from "@medusajs/ui"
import { Plus, ArrowUpTray, ArrowDownTray } from "@medusajs/icons"
import { useEffect, useMemo, useState } from "react"

type AdminProduct = {
  id: string
  title: string
  handle: string
  metadata?: Record<string, any>
  type?: { id: string; value: string }
}

const columnHelper = createDataTableColumnHelper<AdminProduct>()

const columns = [
  columnHelper.accessor("id", { header: "ID" }),
  columnHelper.accessor("title", { header: "Title" }),
  columnHelper.accessor("handle", {
    header: "Handle",
    cell: ({ row }) => {
      const id = row.original.id
      return (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a className="text-ui-fg-interactive" href={`/app/diamonds/${id}`}>{row.original.handle}</a>
      )
    },
  }),
  columnHelper.accessor((row) => row.type?.value ?? "", {
    id: "product_type",
    header: "Type",
  }),
]

const DiamondsPage = () => {
  const [data, setData] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [count, setCount] = useState<number>(0)
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const pageSize = useMemo(() => pagination.pageSize, [pagination.pageSize])
  const startIndex = useMemo(
    () => pagination.pageIndex * pagination.pageSize,
    [pagination.pageIndex, pagination.pageSize]
  )

  useEffect(() => {
    const controller = new AbortController()
    async function fetchProducts() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set("limit", String(200))
        params.set("offset", String(0))
        params.set("fields", "id,title,handle,metadata,created_at,type.value,type.id")
        params.set("_", Date.now().toString())
        const res = await fetch(
          `/admin/products?${params.toString()}`,
          {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
            headers: { "Cache-Control": "no-cache" },
          }
        )
        if (!res.ok) {
          throw new Error(`Failed to load products: ${res.status}`)
        }
        const json = await res.json()
        const all = (json.products ?? json?.products ?? []) as AdminProduct[]
        setCount(all.length)
        const page = all.slice(startIndex, startIndex + pageSize)
        setData(page)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
    return () => controller.abort()
  }, [startIndex, pageSize])

  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    rowCount: count,
    isLoading: loading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
  })

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Diamonds</Heading>
        <div className="flex items-center gap-x-2">
          <Button variant="secondary" size="small" onClick={() => alert('Export functionality coming soon')}>
            <ArrowUpTray className="mr-2" />
            Export
          </Button>
          <Button variant="secondary" size="small" onClick={() => alert('Import functionality coming soon')}>
            <ArrowDownTray className="mr-2" />
            Import
          </Button>
          <Button variant="primary" size="small" onClick={() => alert('Create functionality coming soon')}>
            <Plus className="mr-2" />
            Create Product
          </Button>
        </div>
      </div>
      <div className="p-6">
        <DataTable instance={table}>
          <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
            <Text className="text-ui-fg-subtle">All diamond products</Text>
          </DataTable.Toolbar>
          <DataTable.Table />
          <DataTable.Pagination />
        </DataTable>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Diamonds",
})

export default DiamondsPage


