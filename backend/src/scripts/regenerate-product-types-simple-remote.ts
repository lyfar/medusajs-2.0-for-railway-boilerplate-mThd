// Regenerate product types with a minimal flattened metadata (remote)
// - Deletes existing diamond product types (if present)
// - Recreates with simple keys only (no field__ grouping): shapes list

const BACKEND_URL = "https://backend-production-c68b.up.railway.app"
const ADMIN_EMAIL = "admin@yourmail.com"
const ADMIN_PASSWORD = "bnmugz7hs4gsk65l0566eos2s4kxmeho"

class MedusaAdminAPI {
  private baseUrl: string
  private authToken: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async login(email: string, password: string) {
    const res = await fetch(`${this.baseUrl}/auth/user/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error(`Login failed: ${res.status} ${await res.text()}`)
    const data = await res.json()
    this.authToken = data.token
    if (!this.authToken) throw new Error("No auth token received")
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
  deleteProductType(id: string) { return this.request(`/admin/product-types/${id}`, { method: "DELETE" }) }
  createProductType(value: string, metadata: Record<string, any>) {
    return this.request(`/admin/product-types`, { method: "POST", body: JSON.stringify({ value, metadata }) })
  }
}

const SHAPES = "Round,Oval,Cushion,Princess,Emerald,Asscher,Pear,Marquise,Radiant,Heart"

const WHITE_SIMPLE = {
  is_diamond: "true",
  type_category: "diamonds",
  shapes: SHAPES,
}

const FANCY_SIMPLE = {
  is_diamond: "true",
  type_category: "diamonds",
  shapes: SHAPES,
}

async function main() {
  console.log("🔐 Logging in…")
  const api = new MedusaAdminAPI(BACKEND_URL)
  await api.login(ADMIN_EMAIL, ADMIN_PASSWORD)

  console.log("🔎 Listing product types…")
  const list = await api.listProductTypes()
  const types: any[] = list.product_types || []
  const toDelete = types.filter((t) => ["White Lab Diamonds", "Fancy Color Lab Diamonds"].includes(t.value))
  for (const t of toDelete) {
    try {
      console.log(`🗑️ Deleting product type: ${t.value}`)
      await api.deleteProductType(t.id)
    } catch (e: any) {
      console.warn(`⚠️ Delete failed for ${t.value}: ${e.message}`)
    }
  }

  console.log("➕ Creating minimal 'White Lab Diamonds'")
  await api.createProductType("White Lab Diamonds", WHITE_SIMPLE)
  console.log("➕ Creating minimal 'Fancy Color Lab Diamonds'")
  await api.createProductType("Fancy Color Lab Diamonds", FANCY_SIMPLE)
  console.log("✅ Done. Verify with: GET /admin/product-types")
}

main().catch((e) => { console.error("❌ Simple regeneration failed:", e); process.exit(1) })


