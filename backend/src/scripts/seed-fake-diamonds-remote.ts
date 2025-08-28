// Seed fake white and fancy diamonds (remote backend)
// - Requires existing product types: "White Lab Diamonds" and "Fancy Color Lab Diamonds"
// - Creates N white and M fancy products with metadata matching the smart schema

const BACKEND_URL = process.env.BACKEND_URL || "https://backend-production-c68b.up.railway.app"
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@yourmail.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "bnmugz7hs4gsk65l0566eos2s4kxmeho"

class MedusaAdminAPI {
  private baseUrl: string
  private authToken: string | null = null
  constructor(baseUrl: string) { this.baseUrl = baseUrl }
  async login(email: string, password: string) {
    const res = await fetch(`${this.baseUrl}/auth/user/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error(`Login failed: ${res.status} ${await res.text()}`)
    const data = await res.json()
    this.authToken = data.token
    if (!this.authToken) throw new Error("No auth token")
  }
  private async request(path: string, init: RequestInit = {}) {
    if (!this.authToken) throw new Error("Not authenticated")
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.authToken}`,
        ...(init.headers || {}),
      },
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`${init.method || "GET"} ${path} → ${res.status}: ${body}`)
    }
    return res.json()
  }
  listProductTypes() { return this.request(`/admin/product-types`) }
  listRegions() { return this.request(`/admin/regions`) }
  listProducts(params: any = {}) {
    const qs = new URLSearchParams(params).toString()
    return this.request(`/admin/products${qs ? `?${qs}` : ``}`)
  }
  deleteProduct(id: string) { return this.request(`/admin/products/${id}`, { method: "DELETE" }) }
  listSalesChannels() { return this.request(`/admin/sales-channels`) }
  listStockLocations() { return this.request(`/admin/stock-locations`) }
  createInventoryItem(input: any) { return this.request(`/admin/inventory-items`, { method: "POST", body: JSON.stringify(input) }) }
  createLocationLevel(inventoryItemId: string, input: any) { return this.request(`/admin/inventory-items/${inventoryItemId}/location-levels`, { method: "POST", body: JSON.stringify(input) }) }
  getProductVariantV2(variantId: string, params: any = {}) {
    const qs = new URLSearchParams(params).toString()
    return this.request(`/admin/product-variants/${variantId}${qs ? `?${qs}` : ``}`)
  }
  createProduct(input: any) { return this.request(`/admin/products`, { method: "POST", body: JSON.stringify(input) }) }
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function randFloat(min: number, max: number, digits = 2) {
  return parseFloat((min + Math.random() * (max - min)).toFixed(digits))
}

const SHAPES = ["Round", "Oval", "Cushion", "Princess", "Radiant", "Emerald", "Pear", "Marquise", "Asscher", "Heart"]
const CLARITIES = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"]
const CUTS = ["Excellent", "Very Good", "Good", "Fair"]
const LABS = ["IGI", "GIA", "GCAL"]
const FANCY_COLORS = ["Yellow", "Pink", "Blue", "Green", "Orange", "Brown", "Purple", "Red", "Gray", "Black"]
const FANCY_INTENSITY = ["Faint", "Very Light", "Light", "Fancy Light", "Fancy", "Fancy Intense", "Fancy Vivid", "Fancy Deep", "Fancy Dark"]
const COLOR_GRADES = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"]

async function main() {
  const api = new MedusaAdminAPI(BACKEND_URL)
  console.log("🔐 Logging in…")
  await api.login(ADMIN_EMAIL, ADMIN_PASSWORD)

  console.log("🔎 Fetching product types…")
  const types = (await api.listProductTypes()).product_types as any[]
  const white = types.find((t) => t.value === "White Lab Diamonds")
  const fancy = types.find((t) => t.value === "Fancy Color Lab Diamonds")
  if (!white || !fancy) throw new Error("Required product types not found. Run regen type script first.")

  console.log("🌍 Resolving default region (for pricing)…")
  const regionsResp = await api.listRegions()
  const regions: any[] = regionsResp.regions || regionsResp.data || []
  if (!regions.length) throw new Error("No regions found. Create a region in Admin.")
  const defaultRegion = regions.find((r: any) => r.is_default) || regions[0]
  const regionCurrency: string = (defaultRegion.currency_code || defaultRegion.currency || 'usd').toLowerCase()
  console.log(`✅ Using region ${defaultRegion.name || defaultRegion.id} with currency ${regionCurrency}`)

  // Optionally purge existing diamonds of these types first
  const purgeFirst = (process.env.PURGE_FIRST || 'true').toLowerCase() !== 'false'
  if (purgeFirst) {
    console.log("🧹 Purging existing White/Fancy diamonds before seeding…")
    const typeIds = new Set([white.id, fancy.id])
    let offset = 0
    const limit = 100
    let total = 0
    let removed = 0
    while (true) {
      const resp = await api.listProducts({ limit, offset, expand: 'type', fields: 'id,title,type.id' })
      const products: any[] = resp.products || []
      total = resp.count || total
      if (!products.length) break
      for (const p of products) {
        const tId = p.type?.id
        if (tId && typeIds.has(tId)) {
          try {
            await api.deleteProduct(p.id)
            removed++
          } catch (err) {
            console.warn(`⚠️ Failed to delete ${p.id} (${p.title})`, err)
          }
          await new Promise((r) => setTimeout(r, 60))
        }
      }
      offset += products.length
      if (offset >= total) break
    }
    console.log(`✅ Purge complete. Deleted ${removed} products.`)
  }

  console.log("🛒 Resolving default sales channel…")
  const scResp = await api.listSalesChannels()
  const scList: any[] = scResp.sales_channels || scResp.salesChannels || []
  const defaultSc = scList.find((s: any) => s.is_default) || scList.find((s: any) => /default/i.test(s.name)) || scList[0]
  if (!defaultSc) {
    throw new Error("No sales channel found. Please create a sales channel in Admin first.")
  }
  const defaultScId = defaultSc.id
  console.log(`✅ Using sales channel: ${defaultSc.name || defaultSc.id}`)

  console.log("🏬 Resolving stock location…")
  const locResp = await api.listStockLocations()
  const locations: any[] = locResp.stock_locations || locResp.stockLocations || []
  if (!locations.length) {
    console.warn("⚠️ No stock locations found. Inventory management will be skipped.")
  }
  const defaultLocation = locations.find((l: any) => l.is_default) || locations[0]
  const stockLocationId = defaultLocation?.id

  const createWhite = async (i: number) => {
    const carat = randFloat(0.3, 5.0, 2)
    const meta = {
      carat_weight: String(carat),
      shape: pick(SHAPES),
      clarity: pick(CLARITIES),
      cut_grade: pick(CUTS),
      lab_certificate: pick(LABS),
      certificate_number: `W-${Date.now()}-${i}`,
      color_grade: pick(COLOR_GRADES),
    }
    // Price in normal currency units (not cents)
    const unitPrice = Math.max(500, Math.floor(carat * randFloat(2500, 8000)))
    const input = {
      title: `White ${meta.shape} ${carat}ct`,
      status: "published",
      handle: `white-${i}-${Date.now()}`,
      type_id: white.id,
      metadata: meta,
      sales_channels: [{ id: defaultScId }],
      // Options follow product type metadata
      options: [
        { title: "Shape", values: [meta.shape] },
        { title: "Color Grade", values: [meta.color_grade] },
      ],
      variants: [
        {
          title: `${meta.shape} / ${meta.color_grade}`,
          options: { "Shape": meta.shape, "Color Grade": meta.color_grade },
          // One-of-a-kind stone: manage inventory and no backorders
          manage_inventory: true,
          allow_backorder: false,
          sku: meta.certificate_number,
          prices: [
            { currency_code: regionCurrency, amount: unitPrice },
            ...(regionCurrency !== 'usd' ? [{ currency_code: 'usd', amount: unitPrice }] : []),
          ],
        },
      ],
    }
    const created = await api.createProduct(input)
    const product = (created.product || created)
    const variantId: string | undefined = product.variants?.[0]?.id
    if (variantId && stockLocationId) {
      try {
        // Read back the variant to get auto-created inventory item (v2 behavior when manage_inventory=true)
        const vRes = await api.getProductVariantV2(variantId)
        const variant = vRes.product_variant || vRes.variant || vRes
        const invItem = (variant.inventory_items && variant.inventory_items[0]) || (variant.inventoryItems && variant.inventoryItems[0])
        const invId = invItem?.inventory_item_id || invItem?.id
        if (invId) {
          await api.createLocationLevel(invId, { location_id: stockLocationId, stocked_quantity: 1 })
        }
      } catch (e) {
        console.warn(`⚠️ Inventory level setup failed for ${product.id}:`, (e as any)?.message || e)
      }
    }
    return created
  }

  const createFancy = async (i: number) => {
    const carat = randFloat(0.3, 5.0, 2)
    const meta = {
      carat_weight: String(carat),
      shape: pick(SHAPES),
      clarity: pick(CLARITIES),
      cut_grade: pick(CUTS),
      lab_certificate: pick(LABS),
      certificate_number: `F-${Date.now()}-${i}`,
      fancy_color: pick(FANCY_COLORS),
      color_intensity: pick(FANCY_INTENSITY),
    }
    // Price in normal currency units (not cents) with a premium for fancy color
    const unitPrice = Math.max(800, Math.floor(carat * randFloat(4000, 15000)))
    const input = {
      title: `Fancy ${meta.fancy_color} ${meta.shape} ${carat}ct`,
      status: "published",
      handle: `fancy-${i}-${Date.now()}`,
      type_id: fancy.id,
      metadata: meta,
      sales_channels: [{ id: defaultScId }],
      options: [
        { title: "Shape", values: [meta.shape] },
        { title: "Fancy Color", values: [meta.fancy_color] },
        { title: "Color Intensity", values: [meta.color_intensity] },
      ],
      variants: [
        {
          title: `${meta.shape} / ${meta.fancy_color} / ${meta.color_intensity}`,
          options: { "Shape": meta.shape, "Fancy Color": meta.fancy_color, "Color Intensity": meta.color_intensity },
          manage_inventory: true,
          allow_backorder: false,
          sku: meta.certificate_number,
          prices: [
            { currency_code: regionCurrency, amount: unitPrice },
            ...(regionCurrency !== 'usd' ? [{ currency_code: 'usd', amount: unitPrice }] : []),
          ],
        },
      ],
    }
    const created = await api.createProduct(input)
    const product = (created.product || created)
    const variantId: string | undefined = product.variants?.[0]?.id
    if (variantId && stockLocationId) {
      try {
        const vRes = await api.getProductVariantV2(variantId)
        const variant = vRes.product_variant || vRes.variant || vRes
        const invItem = (variant.inventory_items && variant.inventory_items[0]) || (variant.inventoryItems && variant.inventoryItems[0])
        const invId = invItem?.inventory_item_id || invItem?.id
        if (invId) {
          await api.createLocationLevel(invId, { location_id: stockLocationId, stocked_quantity: 1 })
        }
      } catch (e) {
        console.warn(`⚠️ Inventory level setup failed for ${product.id}:`, (e as any)?.message || e)
      }
    }
    return created
  }

  const whiteCount = parseInt(process.env.SEED_WHITE || "12", 10)
  const fancyCount = parseInt(process.env.SEED_FANCY || "12", 10)

  console.log(`💎 Creating ${whiteCount} white diamonds…`)
  for (let i = 0; i < whiteCount; i++) {
    await createWhite(i)
  }
  console.log(`🌈 Creating ${fancyCount} fancy diamonds…`)
  for (let i = 0; i < fancyCount; i++) {
    await createFancy(i)
  }
  console.log("✅ Seeding complete.")
}

main().catch((e) => {
  console.error("❌ Seeding failed:", e)
  process.exit(1)
})


