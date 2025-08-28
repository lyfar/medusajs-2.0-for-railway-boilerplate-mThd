// Create smart lab diamond product types (local development)
// This script runs locally and creates product types with smart metadata structure

const BACKEND_URL = "http://localhost:9000"

class LocalMedusaAPI {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request(endpoint: string, options: any = {}) {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`${options.method || "GET"} ${endpoint} → ${res.status}: ${text}`)
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
  const api = new LocalMedusaAPI(BACKEND_URL)
  
  console.log("🔍 Checking for existing diamond product types...")

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

  console.log("\n🎉 Smart lab-grown diamond product types created!")
  console.log("📋 Features:")
  console.log("  • Automatic table columns from metadata")
  console.log("  • Form field generation with validation")
  console.log("  • Numeric fields: carat_weight, dimensions, percentages")
  console.log("  • Select fields: shape, color, clarity, cut, lab, etc.")
  console.log("  • Text fields: certificate_number")
  console.log("\n🔗 Next steps:")
  console.log("  1. Refresh the admin dashboard")
  console.log("  2. Go to Diamonds → White or Fancy to see dynamic columns")
  console.log("  3. Click on a product to edit metadata with smart forms")
}

main().catch(console.error)
