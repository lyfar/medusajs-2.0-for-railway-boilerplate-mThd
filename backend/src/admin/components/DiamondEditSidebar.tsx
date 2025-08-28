// @ts-nocheck
import { Button, Heading, Text, Badge } from "@medusajs/ui"
import { useEffect, useState, useMemo } from "react"

type AdminProduct = {
  id: string
  title: string
  handle: string
  metadata?: Record<string, any>
  type?: { id: string; value: string }
}

type AdminProductType = {
  id: string
  value: string
  metadata?: Record<string, any>
}

interface DiamondEditSidebarProps {
  isOpen: boolean
  productId: string | null
  onClose: () => void
  onSave?: (updated: AdminProduct) => void
}

const formatLabel = (key: string) =>
  key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())

export const DiamondEditSidebar = ({ isOpen, productId, onClose, onSave }: DiamondEditSidebarProps) => {
  const [product, setProduct] = useState<AdminProduct | null>(null)
  const [ptype, setPtype] = useState<AdminProductType | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)
  const [creatingSchema, setCreatingSchema] = useState<boolean>(false)
  const [schemaMsg, setSchemaMsg] = useState<string>("")
  const [form, setForm] = useState<Record<string, any>>({})
  const [usingFallbackSchema, setUsingFallbackSchema] = useState<boolean>(false)

  useEffect(() => {
    if (!productId || !isOpen) {
      setProduct(null)
      setPtype(null)
      setForm({})
      return
    }

    const controller = new AbortController()
    async function fetchData() {
      setLoading(true)
      try {
        const backend = (globalThis as any).__BACKEND_URL__ || ""
        // Simplest and most compatible request first
        let pRes = await fetch(`${backend}/admin/products/${encodeURIComponent(productId)}`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
          headers: { "Cache-Control": "no-cache" },
        })
        // Fallback to list filter by id[] if still not ok
        if (!pRes.ok) {
          console.warn("Primary product request failed, retrying with id[] filter", pRes.status)
          const listParams = new URLSearchParams()
          listParams.set("id[]", productId)
          listParams.set("limit", "1")
          listParams.set("_", Date.now().toString())
          pRes = await fetch(`${backend}/admin/products?${listParams.toString()}`, {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
            headers: { "Cache-Control": "no-cache" }
          })
          if (pRes.ok) {
            const listJson = await pRes.json()
            const listProduct = (listJson.products?.[0] ?? listJson.product ?? null) as AdminProduct | null
            if (listProduct) {
              setProduct(listProduct)
              setForm(listProduct.metadata || {})
              const listTypeId = (listProduct as any)?.type?.id || (listProduct as any)?.type_id
              if (listTypeId) {
                const tRes = await fetch(`${backend}/admin/product-types/${encodeURIComponent(listTypeId)}`, {
                  credentials: "include",
                  cache: "no-store",
                  signal: controller.signal,
                  headers: { "Cache-Control": "no-cache" }
                })
                if (tRes.ok) {
                  const tJson = await tRes.json()
                  setPtype(tJson.product_type as AdminProductType)
                }
              }
              return
            }
          }
        }
        if (!pRes.ok) throw new Error(`Failed to load product: ${pRes.status}`)
        const pJson = await pRes.json()
        const prod = (pJson.product ?? pJson.products?.[0] ?? null) as AdminProduct | null
        if (!prod) throw new Error("Product payload missing")
        setProduct(prod)
        setForm((prod as any)?.metadata || {})

        const typeId = (prod as any)?.type?.id || (prod as any)?.type_id
        if (typeId) {
          const tRes = await fetch(`${backend}/admin/product-types/${encodeURIComponent(typeId)}`, {
            credentials: "include", 
            cache: "no-store", 
            signal: controller.signal,
            headers: { "Cache-Control": "no-cache" }
          })
          if (tRes.ok) {
            const tJson = await tRes.json()
            setPtype(tJson.product_type as AdminProductType)
          } else {
            // Fallback to local default schema so user can edit immediately
            const isFancy = String((prod as any)?.type?.value || "").toLowerCase().includes("fancy")
            const fallback = buildDefaultSchema(isFancy)
            setPtype({ id: String(typeId), value: (prod as any)?.type?.value || "Diamond", metadata: fallback })
            setUsingFallbackSchema(true)
            setSchemaMsg("Using default fields (couldn't load product-type schema). You can still edit & save.")
          }
        }
      } catch (e: any) {
        if (e?.name === "AbortError") return
        console.error("DiamondEditSidebar: product load error", e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    return () => controller.abort()
  }, [productId, isOpen])

  const fields = useMemo(() => {
    if (!ptype?.metadata) return []
    
    const meta = ptype.metadata
    const fields: any[] = []
    const reserved = new Set(["is_diamond", "type_category", "color_category"])
    
    // Parse smart metadata structure (field definitions with type, label, etc.)
    for (const [key, value] of Object.entries(meta)) {
      if (reserved.has(key)) continue
      
      // Smart metadata: field definitions are objects with type, label, etc.
      if (typeof value === "object" && value !== null && "type" in value) {
        const fieldDef = value as any
        fields.push({
          key,
          cfg: {
            type: fieldDef.type || "text",
            label: fieldDef.label || key.replace(/_/g, " "),
            options: fieldDef.options || [],
            min: fieldDef.min,
            max: fieldDef.max,
            step: fieldDef.step,
            required: fieldDef.required,
            maxLength: fieldDef.maxLength,
            description: fieldDef.description
          }
        })
      }
      // Simple metadata: direct string values (fallback)
      else if (typeof value === "string") {
        fields.push({
          key,
          cfg: {
            type: "text",
            label: key.replace(/_/g, " ")
          }
        })
      }
    }
    
    return fields
  }, [ptype])

  async function createDefaultSchema() {
    if (!ptype?.id || !product?.type?.value) return
    setCreatingSchema(true)
    setSchemaMsg("")
    try {
      const isFancy = product.type.value.toLowerCase().includes("fancy")
      const backend = (globalThis as any).__BACKEND_URL__ || ""
      const schema: Record<string, any> = {
        carat_weight: {
          type: "number",
          label: "Carat Weight",
          min: 0.1,
          max: 20,
          step: 0.01,
          required: true,
          description: "Weight of the diamond in carats",
        },
        shape: {
          type: "select",
          label: "Shape",
          options: [
            "Round",
            "Oval",
            "Cushion",
            "Princess",
            "Radiant",
            "Emerald",
            "Pear",
            "Marquise",
            "Asscher",
            "Heart",
          ],
          required: true,
        },
        clarity: {
          type: "select",
          label: "Clarity",
          options: ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"],
        },
        cut_grade: {
          type: "select",
          label: "Cut Grade",
          options: ["Excellent", "Very Good", "Good", "Fair"],
        },
        lab_certificate: {
          type: "select",
          label: "Lab Certificate",
          options: ["IGI", "GIA", "GCAL", "HRD"],
        },
        certificate_number: {
          type: "text",
          label: "Certificate Number",
          maxLength: 64,
        },
      }
      if (isFancy) {
        schema.fancy_color = {
          type: "select",
          label: "Fancy Color",
          options: [
            "Yellow",
            "Pink",
            "Blue",
            "Green",
            "Orange",
            "Brown",
            "Purple",
            "Red",
            "Gray",
            "Black",
          ],
          required: true,
        }
        schema.color_intensity = {
          type: "select",
          label: "Color Intensity",
          options: ["Faint", "Very Light", "Light", "Fancy Light", "Fancy", "Fancy Intense", "Fancy Vivid", "Fancy Deep", "Fancy Dark"],
        }
      } else {
        schema.color_grade = {
          type: "select",
          label: "Color Grade",
          options: ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"],
        }
      }

      // Try POST first (Medusa Admin update)
      let upd = await fetch(`${backend}/admin/product-types/${ptype.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: { ...(ptype.metadata || {}), ...schema } }),
      })
      // Fallback to PATCH if POST is not accepted
      if (!upd.ok) {
        console.warn("POST product-type update failed", upd.status)
        upd = await fetch(`${backend}/admin/product-types/${ptype.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata: { ...(ptype.metadata || {}), ...schema } }),
        })
      }
      if (!upd.ok) throw new Error(`Failed to create schema: ${upd.status}`)
      // Re-fetch the product type to ensure freshest metadata
      const tParams = new URLSearchParams()
      tParams.set("fields", "id,value,metadata")
      tParams.set("_", Date.now().toString())
      const fresh = await fetch(`${backend}/admin/product-types/${ptype.id}?${tParams.toString()}`, {
        credentials: "include",
        cache: "no-store",
      })
      if (fresh.ok) {
        const tJson = await fresh.json()
        setPtype(tJson.product_type as AdminProductType)
        setSchemaMsg("Schema created. You can now edit fields.")
      } else {
        // Apply schema locally so fields appear even if refresh fails
        const isFancy = product.type.value.toLowerCase().includes("fancy")
        setPtype({ id: ptype.id, value: ptype.value, metadata: { ...(ptype.metadata || {}), ...schema } })
        setSchemaMsg("Schema created. Showing local copy (refresh failed).")
      }
    } catch (e) {
      console.error("DiamondEditSidebar: create schema error", e)
      setSchemaMsg("Failed to create schema. Check console/network logs.")
    } finally {
      setCreatingSchema(false)
    }
  }

  function buildDefaultSchema(isFancy: boolean): Record<string, any> {
    const base: Record<string, any> = {
      carat_weight: {
        type: "number",
        label: "Carat Weight",
        min: 0.1,
        max: 20,
        step: 0.01,
        required: true,
      },
      shape: {
        type: "select",
        label: "Shape",
        options: [
          "Round",
          "Oval",
          "Cushion",
          "Princess",
          "Radiant",
          "Emerald",
          "Pear",
          "Marquise",
          "Asscher",
          "Heart",
        ],
        required: true,
      },
      clarity: {
        type: "select",
        label: "Clarity",
        options: ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"],
      },
      cut_grade: {
        type: "select",
        label: "Cut Grade",
        options: ["Excellent", "Very Good", "Good", "Fair"],
      },
      lab_certificate: {
        type: "select",
        label: "Lab Certificate",
        options: ["IGI", "GIA", "GCAL", "HRD"],
      },
      certificate_number: {
        type: "text",
        label: "Certificate Number",
        maxLength: 64,
      },
    }
    if (isFancy) {
      base.fancy_color = {
        type: "select",
        label: "Fancy Color",
        options: [
          "Yellow",
          "Pink",
          "Blue",
          "Green",
          "Orange",
          "Brown",
          "Purple",
          "Red",
          "Gray",
          "Black",
        ],
        required: true,
      }
      base.color_intensity = {
        type: "select",
        label: "Color Intensity",
        options: ["Faint", "Very Light", "Light", "Fancy Light", "Fancy", "Fancy Intense", "Fancy Vivid", "Fancy Deep", "Fancy Dark"],
      }
    } else {
      base.color_grade = {
        type: "select",
        label: "Color Grade",
        options: ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"],
      }
    }
    return base
  }

  function renderField(key: string, cfg: any) {
    const value = form[key] ?? ""
    const commonProps: any = {
      id: key,
      name: key,
      value: String(value ?? ""),
      onChange: (e: any) => setForm((f) => ({ ...f, [key]: e.target.value })),
      className: "w-full rounded bg-ui-bg-base p-2 border border-ui-border text-ui-fg-base",
    }
    
    switch (cfg?.type) {
      case "select":
        const options = cfg?.options || []
        return (
          <select {...commonProps}>
            <option value="">Select {cfg?.label || key}...</option>
            {options.map((opt: string) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )
      case "number":
        return (
          <input 
            type="number" 
            {...commonProps} 
            min={cfg?.min} 
            max={cfg?.max} 
            step={cfg?.step || 0.01}
            placeholder={`Enter ${cfg?.label || key}`}
          />
        )
      default:
        return (
          <input 
            type="text" 
            {...commonProps} 
            maxLength={cfg?.maxLength}
            placeholder={`Enter ${cfg?.label || key}`}
          />
        )
    }
  }

  async function handleSave() {
    if (!productId) return
    setSaving(true)
    try {
      const backend = (globalThis as any).__BACKEND_URL__ || ""
      const res = await fetch(`${backend}/admin/products/${productId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: form }),
      })
      if (!res.ok) throw new Error(`Save failed: ${res.status}`)
      const json = await res.json()
      setProduct(json.product as AdminProduct)
      onSave?.(json.product as AdminProduct) // Trigger table refresh without reload
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop (no click-to-close to avoid accidental dismiss) */}
      <div className="fixed inset-0 bg-black/20 z-40" />
      
      {/* Sliding Sidebar */}
      <div className="ml-auto flex h-full w-full max-w-md animate-in slide-in-from-right duration-300 z-50" onClick={(e) => e.stopPropagation()}>
        <div className="flex h-full w-full flex-col bg-ui-bg-base shadow-xl border-l border-ui-border overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-ui-border">
            <div className="flex items-center gap-3">
              <Heading level="h3">{loading ? "Loading..." : product?.title || "Diamond"}</Heading>
              {product?.type?.value && <Badge size="2">{product.type.value}</Badge>}
            </div>
            <Button 
              variant="secondary" 
              size="small"
              onClick={onClose}
              className="ml-auto"
            >
              ✕
            </Button>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <Text>Loading diamond details...</Text>
            </div>
          ) : !product ? (
            <div className="flex items-center justify-center p-6">
              <Text className="text-ui-fg-subtle">Diamond not found</Text>
            </div>
          ) : (
            <>
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-3">
                    <div>
                      <Text className="text-ui-fg-subtle text-sm">Product ID</Text>
                      <Text className="font-mono text-sm">{product.id}</Text>
                    </div>
                    <div>
                      <Text className="text-ui-fg-subtle text-sm">Handle</Text>
                      <Text className="text-sm">{product.handle}</Text>
                    </div>
                  </div>

                  {/* Diamond Metadata Form */}
                  <div className="border-t border-ui-border pt-6">
                    <Heading level="h4" className="mb-4 text-ui-fg-base">Diamond Properties</Heading>
                    
                    {fields.length === 0 ? (
                      <div className="text-center py-6 space-y-4">
                        <Text className="text-ui-fg-subtle text-sm">
                          No diamond metadata schema found for {product.type?.value || "this product type"}
                        </Text>
                        <div className="flex justify-center">
                          <Button size="small" variant="primary" onClick={createDefaultSchema} disabled={creatingSchema}>
                            {creatingSchema ? "Creating schema..." : `Create default schema for ${product.type?.value || "diamonds"}`}
                          </Button>
                        </div>
                        {schemaMsg && (
                          <Text className="text-ui-fg-subtle text-xs">{schemaMsg}</Text>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {fields.map(({ key, cfg }) => (
                          <div key={key} className="space-y-2">
                            <label htmlFor={key} className="block">
                              <Text className="text-ui-fg-base font-medium text-sm">
                                {cfg?.label || formatLabel(key)}
                                {cfg?.required && <span className="text-red-500 ml-1">*</span>}
                              </Text>
                            </label>
                            {renderField(key, cfg)}
                            {cfg?.description && (
                              <Text className="text-ui-fg-subtle text-xs">{cfg.description}</Text>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Footer with Save Button (sticky) */}
              <div className="border-t border-ui-border p-6 bg-ui-bg-subtle sticky bottom-0">
                <div className="flex gap-3">
                  <Button 
                    onClick={onClose} 
                    variant="secondary" 
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={saving || fields.length === 0} 
                    variant="primary" 
                    className="flex-1"
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
