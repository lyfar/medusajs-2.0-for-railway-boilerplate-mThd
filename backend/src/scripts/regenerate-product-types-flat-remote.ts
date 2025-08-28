// Regenerate product types with flattened per-key metadata (remote)
// - Deletes existing diamond product types (if present)
// - Recreates them with per-key metadata (one key per line, no JSON blobs)

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
    if (!res.ok) {
      throw new Error(`Login failed: ${res.status} ${await res.text()}`)
    }
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

  listProductTypes() {
    return this.request(`/admin/product-types`)
  }
  deleteProductType(id: string) {
    return this.request(`/admin/product-types/${id}`, { method: "DELETE" })
  }
  createProductType(value: string, metadata: Record<string, any>) {
    return this.request(`/admin/product-types`, {
      method: "POST",
      body: JSON.stringify({ value, metadata }),
    })
  }
}

// Flattened per-key metadata for White and Fancy
const WHITE_TYPE_META = {
  is_diamond: "true",
  type_category: "diamonds",
  requires_variants: "false",
  // Field definitions (flattened)
  "field__shape__type": "select",
  "field__shape__label": "Shape",
  "field__shape__options": "Round,Oval,Cushion,Princess,Emerald,Asscher,Pear,Marquise,Radiant,Heart",

  "field__carat_weight__type": "number",
  "field__carat_weight__label": "Carat Weight",
  "field__carat_weight__min": "0.18",
  "field__carat_weight__max": "10",
  "field__carat_weight__step": "0.01",

  "field__color_grade__type": "select",
  "field__color_grade__label": "Color Grade",
  "field__color_grade__options": "D,E,F,G,H,I,J,K",

  "field__clarity_grade__type": "select",
  "field__clarity_grade__label": "Clarity Grade",
  "field__clarity_grade__options": "FL,IF,VVS1,VVS2,VS1,VS2,SI1,SI2",

  "field__cut_grade__type": "select",
  "field__cut_grade__label": "Cut Grade",
  "field__cut_grade__options": "EX,VG,GD,ID",

  "field__polish__type": "select",
  "field__polish__label": "Polish",
  "field__polish__options": "EX,VG,GD",

  "field__symmetry__type": "select",
  "field__symmetry__label": "Symmetry",
  "field__symmetry__options": "EX,VG,GD",

  "field__length_mm__type": "number",
  "field__length_mm__label": "Length (mm)",
  "field__length_mm__step": "0.01",

  "field__width_mm__type": "number",
  "field__width_mm__label": "Width (mm)",
  "field__width_mm__step": "0.01",

  "field__height_mm__type": "number",
  "field__height_mm__label": "Height (mm)",
  "field__height_mm__step": "0.01",

  "field__depth_percentage__type": "number",
  "field__depth_percentage__label": "Depth %",
  "field__depth_percentage__min": "50",
  "field__depth_percentage__max": "80",
  "field__depth_percentage__step": "0.1",

  "field__table_percentage__type": "number",
  "field__table_percentage__label": "Table %",
  "field__table_percentage__min": "50",
  "field__table_percentage__max": "70",
  "field__table_percentage__step": "0.1",

  "field__fluorescence__type": "select",
  "field__fluorescence__label": "Fluorescence",
  "field__fluorescence__options": "NONE,Faint,Medium,Strong",

  "field__lab_type__type": "select",
  "field__lab_type__label": "Growing Method",
  "field__lab_type__options": "HPHT,CVD",

  "field__certificate_lab__type": "select",
  "field__certificate_lab__label": "Certificate Lab",
  "field__certificate_lab__options": "IGI,GIA,GCAL",

  "field__certificate_number__type": "text",
  "field__certificate_number__label": "Certificate Number",
}

const FANCY_TYPE_META = {
  is_diamond: "true",
  type_category: "diamonds",
  requires_variants: "false",

  "field__shape__type": "select",
  "field__shape__label": "Shape",
  "field__shape__options": "Round,Oval,Cushion,Princess,Emerald,Asscher,Pear,Marquise,Radiant,Heart",

  "field__carat_weight__type": "number",
  "field__carat_weight__label": "Carat Weight",
  "field__carat_weight__min": "0.18",
  "field__carat_weight__max": "10",
  "field__carat_weight__step": "0.01",

  "field__color_hue__type": "select",
  "field__color_hue__label": "Color Hue",
  "field__color_hue__options": "Pink,Blue,Yellow,Green,Orange,Red,Purple,Brown,Black,Gray",

  "field__color_intensity__type": "select",
  "field__color_intensity__label": "Color Intensity",
  "field__color_intensity__options": "Faint,Very Light,Light,Fancy Light,Fancy,Fancy Intense,Fancy Vivid,Fancy Deep",

  "field__color_distribution__type": "select",
  "field__color_distribution__label": "Color Distribution",
  "field__color_distribution__options": "Even,Uneven,Concentrated",

  "field__secondary_color__type": "select",
  "field__secondary_color__label": "Secondary Color",
  "field__secondary_color__options": "None,Pink,Blue,Yellow,Green,Orange,Purple,Brown,Gray",

  "field__clarity_grade__type": "select",
  "field__clarity_grade__label": "Clarity Grade",
  "field__clarity_grade__options": "FL,IF,VVS1,VVS2,VS1,VS2,SI1,SI2",

  "field__cut_grade__type": "select",
  "field__cut_grade__label": "Cut Grade",
  "field__cut_grade__options": "EX,VG,GD,ID",

  "field__length_mm__type": "number",
  "field__length_mm__label": "Length (mm)",
  "field__length_mm__step": "0.01",

  "field__width_mm__type": "number",
  "field__width_mm__label": "Width (mm)",
  "field__width_mm__step": "0.01",

  "field__height_mm__type": "number",
  "field__height_mm__label": "Height (mm)",
  "field__height_mm__step": "0.01",

  "field__lab_type__type": "select",
  "field__lab_type__label": "Growing Method",
  "field__lab_type__options": "HPHT,CVD",

  "field__certificate_lab__type": "select",
  "field__certificate_lab__label": "Certificate Lab",
  "field__certificate_lab__options": "IGI,GIA,GCAL",

  "field__certificate_number__type": "text",
  "field__certificate_number__label": "Certificate Number",

  "field__color_treatment__type": "select",
  "field__color_treatment__label": "Color Treatment",
  "field__color_treatment__options": "Natural,Enhanced,Treated",
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

  console.log("➕ Creating 'White Lab Diamonds'")
  await api.createProductType("White Lab Diamonds", WHITE_TYPE_META)
  console.log("➕ Creating 'Fancy Color Lab Diamonds'")
  await api.createProductType("Fancy Color Lab Diamonds", FANCY_TYPE_META)

  console.log("✅ Done. Verify with: GET /admin/product-types")
}

main().catch((e) => {
  console.error("❌ Regeneration failed:", e)
  process.exit(1)
})


