// Regenerate lab diamond product types with smart metadata (remote)
// - Deletes existing diamond product types (if present)
// - Recreates with smart lab-grown diamond metadata for auto table/form generation

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

  private async request(path: string, init: any = {}) {
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

  async getProductTypes() {
    return this.request("/admin/product-types")
  }

  async deleteProductType(id: string) {
    return this.request(`/admin/product-types/${id}`, { method: "DELETE" })
  }

  async createProductType(data: any) {
    return this.request("/admin/product-types", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }
}

async function main() {
  const api = new MedusaAdminAPI(BACKEND_URL)
  
  console.log("🔑 Logging in...")
  await api.login(ADMIN_EMAIL, ADMIN_PASSWORD)
  console.log("✅ Authenticated successfully")

  // Delete existing product types
  try {
    const { product_types } = await api.getProductTypes()
    const typesToDelete = product_types.filter((pt: any) => 
      pt.value === "White Lab Diamonds" || pt.value === "Fancy Color Lab Diamonds"
    )

    for (const type of typesToDelete) {
      try {
        await api.deleteProductType(type.id)
        console.log(`🗑️  Deleted existing product type: ${type.value}`)
      } catch (e: any) {
        console.log(`⚠️  Could not delete ${type.value}:`, e.message)
      }
    }
  } catch (e: any) {
    console.log("⚠️  Error checking existing types:", e.message)
  }

  // Smart metadata structure for lab-grown diamonds
  const whiteLabMetadata = {
    // Core identification
    is_diamond: "true",
    type_category: "lab_grown_diamonds",
    color_category: "white",
    
    // Physical Properties - Numeric fields
    carat_weight: {
      type: "number",
      label: "Carat Weight", 
      min: 0.1,
      max: 10.0,
      step: 0.01,
      required: true
    },
    
    // Shape - Select field
    shape: {
      type: "select",
      label: "Shape",
      options: ["Round", "Oval", "Cushion", "Princess", "Emerald", "Asscher", "Radiant", "Pear", "Marquise", "Heart"],
      required: true
    },
    
    // Color Grade - Select field  
    color: {
      type: "select",
      label: "Color Grade",
      options: ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"],
      required: true
    },
    
    // Clarity - Select field
    clarity: {
      type: "select", 
      label: "Clarity",
      options: ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"],
      required: true
    },
    
    // Cut Grade - Select field
    cut: {
      type: "select",
      label: "Cut Grade", 
      options: ["Excellent", "Very Good", "Good", "Fair", "Poor"],
      required: true
    },
    
    // Lab Certificate - Select field
    lab_certificate: {
      type: "select",
      label: "Lab Certificate",
      options: ["GIA", "IGI", "GCAL", "EGL", "AGS", "Other"],
      required: true
    },
    
    // Certificate Number - Text field
    certificate_number: {
      type: "text",
      label: "Certificate Number",
      maxLength: 50
    },
    
    // Measurements - Numeric fields
    length: {
      type: "number", 
      label: "Length (mm)",
      min: 1.0,
      max: 50.0,
      step: 0.01
    },
    
    width: {
      type: "number",
      label: "Width (mm)", 
      min: 1.0,
      max: 50.0,
      step: 0.01
    },
    
    depth: {
      type: "number",
      label: "Depth (mm)",
      min: 1.0, 
      max: 50.0,
      step: 0.01
    },
    
    // Table and Depth Percentages - Numeric
    table_percentage: {
      type: "number",
      label: "Table %",
      min: 50.0,
      max: 80.0,
      step: 0.1
    },
    
    depth_percentage: {
      type: "number", 
      label: "Depth %",
      min: 50.0,
      max: 80.0,
      step: 0.1
    },
    
    // Polish and Symmetry - Select fields
    polish: {
      type: "select",
      label: "Polish",
      options: ["Excellent", "Very Good", "Good", "Fair", "Poor"]
    },
    
    symmetry: {
      type: "select", 
      label: "Symmetry",
      options: ["Excellent", "Very Good", "Good", "Fair", "Poor"]
    },
    
    // Fluorescence - Select field
    fluorescence: {
      type: "select",
      label: "Fluorescence", 
      options: ["None", "Faint", "Medium", "Strong", "Very Strong"]
    }
  }

  const fancyColorMetadata = {
    // Core identification
    is_diamond: "true",
    type_category: "lab_grown_diamonds", 
    color_category: "fancy",
    
    // Physical Properties - Numeric fields
    carat_weight: {
      type: "number",
      label: "Carat Weight",
      min: 0.1, 
      max: 10.0,
      step: 0.01,
      required: true
    },
    
    // Shape - Select field
    shape: {
      type: "select",
      label: "Shape", 
      options: ["Round", "Oval", "Cushion", "Princess", "Emerald", "Asscher", "Radiant", "Pear", "Marquise", "Heart"],
      required: true
    },
    
    // Fancy Color - Select field
    fancy_color: {
      type: "select",
      label: "Fancy Color",
      options: ["Yellow", "Pink", "Blue", "Green", "Orange", "Red", "Purple", "Violet", "Gray", "Brown", "Champagne", "Cognac"],
      required: true
    },
    
    // Color Intensity - Select field
    color_intensity: {
      type: "select", 
      label: "Color Intensity",
      options: ["Faint", "Very Light", "Light", "Fancy Light", "Fancy", "Fancy Dark", "Fancy Deep", "Fancy Intense", "Fancy Vivid"],
      required: true
    },
    
    // Color Distribution - Select field
    color_distribution: {
      type: "select",
      label: "Color Distribution",
      options: ["Even", "Uneven"] 
    },
    
    // Clarity - Select field
    clarity: {
      type: "select",
      label: "Clarity",
      options: ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"],
      required: true
    },
    
    // Cut Grade - Select field  
    cut: {
      type: "select",
      label: "Cut Grade",
      options: ["Excellent", "Very Good", "Good", "Fair", "Poor"],
      required: true
    },
    
    // Lab Certificate - Select field
    lab_certificate: {
      type: "select",
      label: "Lab Certificate", 
      options: ["GIA", "IGI", "GCAL", "EGL", "AGS", "Other"],
      required: true
    },
    
    // Certificate Number - Text field
    certificate_number: {
      type: "text",
      label: "Certificate Number",
      maxLength: 50
    },
    
    // Measurements - Numeric fields
    length: {
      type: "number",
      label: "Length (mm)",
      min: 1.0,
      max: 50.0, 
      step: 0.01
    },
    
    width: {
      type: "number",
      label: "Width (mm)",
      min: 1.0,
      max: 50.0,
      step: 0.01
    },
    
    depth: {
      type: "number", 
      label: "Depth (mm)",
      min: 1.0,
      max: 50.0,
      step: 0.01
    },
    
    // Table and Depth Percentages - Numeric
    table_percentage: {
      type: "number",
      label: "Table %", 
      min: 50.0,
      max: 80.0,
      step: 0.1
    },
    
    depth_percentage: {
      type: "number",
      label: "Depth %",
      min: 50.0,
      max: 80.0,
      step: 0.1
    },
    
    // Polish and Symmetry - Select fields
    polish: {
      type: "select",
      label: "Polish",
      options: ["Excellent", "Very Good", "Good", "Fair", "Poor"]
    },
    
    symmetry: {
      type: "select",
      label: "Symmetry", 
      options: ["Excellent", "Very Good", "Good", "Fair", "Poor"]
    },
    
    // Fluorescence - Select field
    fluorescence: {
      type: "select",
      label: "Fluorescence",
      options: ["None", "Faint", "Medium", "Strong", "Very Strong"]
    }
  }

  // Create White Lab Diamonds product type
  try {
    const whiteType = await api.createProductType({
      value: "White Lab Diamonds",
      metadata: whiteLabMetadata
    })
    console.log(`✅ Created product type: White Lab Diamonds (${whiteType.product_type.id})`)
  } catch (e: any) {
    console.error("❌ Failed to create White Lab Diamonds:", e.message)
  }

  // Create Fancy Color Lab Diamonds product type  
  try {
    const fancyType = await api.createProductType({
      value: "Fancy Color Lab Diamonds", 
      metadata: fancyColorMetadata
    })
    console.log(`✅ Created product type: Fancy Color Lab Diamonds (${fancyType.product_type.id})`)
  } catch (e: any) {
    console.error("❌ Failed to create Fancy Color Lab Diamonds:", e.message)
  }

  console.log("\n🎉 Product types regenerated with smart lab-grown diamond metadata!")
  console.log("📋 Features:")
  console.log("  • Automatic table columns from metadata")
  console.log("  • Form field generation with validation")
  console.log("  • Numeric fields: carat_weight, dimensions, percentages")
  console.log("  • Select fields: shape, color, clarity, cut, lab, etc.")
  console.log("  • Text fields: certificate_number")
}

main().catch(console.error)
