// Reset diamond catalog on remote backend:
// 1) Delete all products of types "White Lab Diamonds" and "Fancy Color Lab Diamonds"
// 2) Delete and recreate both product types with simplified metadata
// 3) Create 2 sample products (1 white, 1 fancy)

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
    const j = await res.json() as any
    this.authToken = j.token
    if (!this.authToken) throw new Error("No token")
  }
  private async request(path: string, init: RequestInit = {}) {
    if (!this.authToken) throw new Error("Not authenticated")
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.authToken}`, ...(init.headers || {}) },
    })
    if (!res.ok) throw new Error(`${init.method || 'GET'} ${path} → ${res.status}: ${await res.text()}`)
    return res.json()
  }
  listProducts(limit = 100, offset = 0) { return this.request(`/admin/products?limit=${limit}&offset=${offset}&fields=id,title,type.value,type.id`) }
  deleteProduct(id: string) { return this.request(`/admin/products/${id}`, { method: 'DELETE' }) }
  listProductTypes() { return this.request(`/admin/product-types`) }
  deleteProductType(id: string) { return this.request(`/admin/product-types/${id}`, { method: 'DELETE' }) }
  createProductType(value: string, metadata: Record<string, any>) { return this.request(`/admin/product-types`, { method: 'POST', body: JSON.stringify({ value, metadata }) }) }
  createProduct(input: any) { return this.request(`/admin/products`, { method: 'POST', body: JSON.stringify(input) }) }
}

const SHAPES = ["Round","Oval","Cushion","Princess","Radiant","Emerald","Pear","Marquise","Asscher","Heart"]
const CLARITIES = ["FL","IF","VVS1","VVS2","VS1","VS2","SI1","SI2"]
const CUTS = ["Excellent","Very Good","Good","Fair"]
const LABS = ["GIA","IGI","GCAL"]
const COLOR_GRADES = ["D","E","F","G","H","I","J","K","L","M"]
const FANCY_COLORS = ["Yellow","Pink","Blue","Green","Orange","Brown","Purple","Red","Gray","Black"]
const FANCY_INTENSITY = ["Faint","Very Light","Light","Fancy Light","Fancy","Fancy Intense","Fancy Vivid","Fancy Deep","Fancy Dark"]

function minimalWhiteMeta() {
  return {
    is_diamond: "true",
    type_category: "lab_grown_diamonds",
    color_category: "white",
    carat_weight: { type: 'number', label: 'Carat Weight', min: 0.1, max: 10, step: 0.01, required: true },
    shape: { type: 'select', label: 'Shape', options: SHAPES, required: true },
    color_grade: { type: 'select', label: 'Color Grade', options: COLOR_GRADES, required: true },
    clarity: { type: 'select', label: 'Clarity', options: CLARITIES, required: true },
    cut_grade: { type: 'select', label: 'Cut Grade', options: CUTS, required: true },
    lab_certificate: { type: 'select', label: 'Lab Certificate', options: LABS, required: true },
    certificate_number: { type: 'text', label: 'Certificate Number', maxLength: 50 },
  }
}

function minimalFancyMeta() {
  return {
    is_diamond: "true",
    type_category: "lab_grown_diamonds",
    color_category: "fancy",
    carat_weight: { type: 'number', label: 'Carat Weight', min: 0.1, max: 10, step: 0.01, required: true },
    shape: { type: 'select', label: 'Shape', options: SHAPES, required: true },
    fancy_color: { type: 'select', label: 'Fancy Color', options: FANCY_COLORS, required: true },
    color_intensity: { type: 'select', label: 'Color Intensity', options: FANCY_INTENSITY, required: true },
    clarity: { type: 'select', label: 'Clarity', options: CLARITIES, required: true },
    cut_grade: { type: 'select', label: 'Cut Grade', options: CUTS, required: true },
    lab_certificate: { type: 'select', label: 'Lab Certificate', options: LABS, required: true },
    certificate_number: { type: 'text', label: 'Certificate Number', maxLength: 50 },
  }
}

async function main() {
  const api = new MedusaAdminAPI(BACKEND_URL)
  console.log('🔐 Login…')
  await api.login(ADMIN_EMAIL, ADMIN_PASSWORD)

  // Gather all products and delete only those of the two types
  console.log('📦 Listing products…')
  const products: any[] = []
  let offset = 0
  while (true) {
    const page = await api.listProducts(100, offset)
    const rows = page.products || []
    if (!rows.length) break
    products.push(...rows)
    offset += 100
  }

  // Identify type ids
  const types = (await api.listProductTypes()).product_types as any[]
  const whiteType = types.find((t) => t.value === 'White Lab Diamonds')
  const fancyType = types.find((t) => t.value === 'Fancy Color Lab Diamonds')

  const toDelete = products.filter((p) => {
    const tv = (p.type?.value || '').toLowerCase()
    return tv.includes('white lab diamonds'.toLowerCase()) || tv.includes('fancy color lab diamonds'.toLowerCase())
  })
  console.log(`🗑️ Deleting ${toDelete.length} diamond products…`)
  for (const p of toDelete) {
    await api.deleteProduct(p.id)
  }

  // Delete existing types
  if (whiteType) { console.log('🗑️ Deleting type White Lab Diamonds'); await api.deleteProductType(whiteType.id) }
  if (fancyType) { console.log('🗑️ Deleting type Fancy Color Lab Diamonds'); await api.deleteProductType(fancyType.id) }

  // Recreate minimal types
  console.log('➕ Creating type White Lab Diamonds (minimal)')
  const whiteCreated = await api.createProductType('White Lab Diamonds', minimalWhiteMeta())
  console.log('➕ Creating type Fancy Color Lab Diamonds (minimal)')
  const fancyCreated = await api.createProductType('Fancy Color Lab Diamonds', minimalFancyMeta())

  const whiteId = whiteCreated.product_type.id
  const fancyId = fancyCreated.product_type.id

  // Create 2 sample products
  console.log('💎 Creating sample White diamond…')
  await api.createProduct({
    title: 'White Round 1.00ct',
    status: 'published',
    handle: `white-sample-${Date.now()}`,
    type_id: whiteId,
    metadata: {
      carat_weight: '1.00', shape: 'Round', color_grade: 'G', clarity: 'VS1', cut_grade: 'Excellent', lab_certificate: 'IGI', certificate_number: 'W-SAMPLE-1'
    },
    options: [ { title: 'Shape', values: ['Round'] }, { title: 'Color Grade', values: ['G'] } ],
    variants: [ { title: 'Round / G', options: { 'Shape': 'Round', 'Color Grade': 'G' }, prices: [ { currency_code: 'usd', amount: 75000 } ] } ],
  })

  console.log('🌈 Creating sample Fancy diamond…')
  await api.createProduct({
    title: 'Fancy Yellow Oval 1.00ct',
    status: 'published',
    handle: `fancy-sample-${Date.now()}`,
    type_id: fancyId,
    metadata: {
      carat_weight: '1.00', shape: 'Oval', fancy_color: 'Yellow', color_intensity: 'Fancy', clarity: 'VS2', cut_grade: 'Very Good', lab_certificate: 'GIA', certificate_number: 'F-SAMPLE-1'
    },
    options: [ { title: 'Shape', values: ['Oval'] }, { title: 'Fancy Color', values: ['Yellow'] }, { title: 'Color Intensity', values: ['Fancy'] } ],
    variants: [ { title: 'Oval / Yellow / Fancy', options: { 'Shape': 'Oval', 'Fancy Color': 'Yellow', 'Color Intensity': 'Fancy' }, prices: [ { currency_code: 'usd', amount: 120000 } ] } ],
  })

  console.log('✅ Reset complete')
}

main().catch((e) => { console.error('❌ Reset failed:', e); process.exit(1) })


