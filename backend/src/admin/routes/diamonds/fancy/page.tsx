// @ts-nocheck
import { Container, Heading, Button } from "@medusajs/ui"
import {
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  useDataTable,
} from "@medusajs/ui"
import { Plus, ArrowUpTray, ArrowDownTray } from "@medusajs/icons"
import { useEffect, useMemo, useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DiamondEditSidebar } from "../../../components/DiamondEditSidebar"

type AdminProduct = {
  id: string
  title: string
  handle: string
  status?: string
  created_at?: string
  metadata?: Record<string, any>
  type?: { id: string; value: string }
}

const columnHelper = createDataTableColumnHelper<AdminProduct>()

// columns are built dynamically after fetching

const FancyDiamondsPage = () => {
  const [data, setData] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [count, setCount] = useState<number>(0)
  const [columns, setColumns] = useState<any[]>([])
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

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

        const backend = (globalThis as any).__BACKEND_URL__ || ""
        const res = await fetch(
          `${backend}/admin/products?${params.toString()}`,
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
        const filtered = all.filter((p) => {
          const t = p.type?.value?.toLowerCase?.() || ""
          if (t.includes("fancy")) return true
          const m = p.metadata || {}
          return m.is_fancy_color === true || m.is_fancy_color === "true"
        })
        setCount(filtered.length)
        const page = filtered.slice(startIndex, startIndex + pageSize)
        setData(page)

        // Base columns always
        const baseCols = [
          columnHelper.accessor("id", { header: "ID", cell: ({ getValue }) => getValue() }),
          columnHelper.accessor("title", { header: "Title", cell: ({ getValue }) => getValue() }),
          columnHelper.accessor("handle", {
            header: "Handle",
            cell: ({ row }) => (
              <button 
                className="text-ui-fg-interactive hover:underline text-left"
                onClick={() => {
                  setSelectedProductId(row.original.id)
                  setSidebarOpen(true)
                }}
              >
                {row.original.handle}
              </button>
            ),
          }),
          columnHelper.accessor((row) => row.type?.value ?? "", { id: "product_type", header: "Type" }),
        ]

        // Extra columns from any metadata keys (primitive or stringify objects)
        const extras = new Set<string>()
        for (const p of page) {
          const m = (p.metadata || {}) as Record<string, any>
          for (const k of Object.keys(m)) extras.add(k)
        }
        const extraCols = Array.from(extras).map((name) =>
          columnHelper.accessor((row) => {
            const v = (row.metadata as any)?.[name]
            if (v == null) return ""
            try { return typeof v === "object" ? JSON.stringify(v) : String(v) } catch { return String(v) }
          }, {
            id: name,
            header: name.replace(/_/g, " "),
            cell: ({ getValue }) => String(getValue()),
          })
        )

        // Dynamic columns from smart product type metadata
        let dynamicCols: any[] = []
        if (page.length && page[0]?.type?.id) {
          try {
            const tRes = await fetch(`${backend}/admin/product-types/${page[0].type.id}`, { credentials: "include" })
            if (tRes.ok) {
              const tJson = await tRes.json()
              const meta = (tJson.product_type?.metadata || {}) as Record<string, any>
              
              // Check for smart metadata structure (field definitions with type, label, etc.)
              const smartFields: any[] = []
              const simpleFields: any[] = []
              const reserved = new Set(["is_diamond", "type_category", "color_category"])
              
              for (const [key, value] of Object.entries(meta)) {
                if (reserved.has(key)) continue
                
                // Smart metadata: field definitions are objects with type, label, etc.
                if (typeof value === "object" && value !== null && "type" in value) {
                  const fieldDef = value as any
                  smartFields.push({
                    key,
                    label: fieldDef.label || key.replace(/_/g, " "),
                    type: fieldDef.type || "text"
                  })
                }
                // Simple metadata: direct string values
                else if (typeof value === "string") {
                  simpleFields.push({
                    key,
                    label: key.replace(/_/g, " "),
                    type: "text"
                  })
                }
              }
              
              // Prioritize smart fields, fallback to simple fields
              const fieldsToUse = smartFields.length > 0 ? smartFields : simpleFields
              
              dynamicCols = fieldsToUse.map(field =>
                columnHelper.accessor((row) => {
                  const value = (row.metadata as any)?.[field.key] ?? ""
                  // Format numeric values
                  if (field.type === "number" && value !== "") {
                    return parseFloat(value).toString()
                  }
                  return String(value)
                }, {
                  id: field.key,
                  header: field.label,
                  cell: ({ getValue }) => {
                    const value = getValue()
                    if (field.type === "number" && value !== "") {
                      return parseFloat(value).toFixed(field.key.includes("carat") ? 2 : 1)
                    }
                    return value
                  },
                })
              )
            }
          } catch {}
        }

        setColumns([...baseCols, ...dynamicCols, ...extraCols])
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
    <>
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h2">Fancy Color Diamonds</Heading>
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
            <DataTable.Toolbar></DataTable.Toolbar>
            <DataTable.Table />
            <DataTable.Pagination />
          </DataTable>
        </div>
      </Container>
      
      {/* Diamond Edit Sidebar */}
      <DiamondEditSidebar
        isOpen={sidebarOpen}
        productId={selectedProductId}
        onClose={() => {
          setSidebarOpen(false)
          setSelectedProductId(null)
        }}
        onSave={(updated) => {
          setData((curr) => curr.map((p) => (p.id === updated.id ? { ...p, metadata: updated.metadata } : p)))
        }}
      />
    </>
  )
}

export default FancyDiamondsPage

export const config = defineRouteConfig({
  label: "Fancy",
})


