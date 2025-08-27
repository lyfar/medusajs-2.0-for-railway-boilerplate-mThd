// Add proper metadata attributes to diamond product types
// This script adds relevant attributes to "White Lab Diamonds" and "Fancy Color Lab Diamonds"

// Production backend configuration
const BACKEND_URL = "https://backend-production-c68b.up.railway.app";
const ADMIN_EMAIL = "admin@yourmail.com";
const ADMIN_PASSWORD = "bnmugz7hs4gsk65l0566eos2s4kxmeho";

// API helper class
class MedusaAdminAPI {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/user/emailpass`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText} - ${await response.text()}`);
    }

    const data = await response.json();
    this.authToken = data.token;
    
    if (!this.authToken) {
      throw new Error("No auth token received from authentication");
    }
    
    console.log("✅ Received auth token successfully");
  }

  async request(endpoint: string, options: RequestInit = {}) {
    if (!this.authToken) {
      throw new Error("Not authenticated. Please login first.");
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.authToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${await response.text()}`);
    }

    return await response.json();
  }

  async listProductTypes() {
    return this.request("/admin/product-types");
  }

  async updateProductType(id: string, data: any) {
    return this.request(`/admin/product-types/${id}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

// White Lab Diamonds attributes (Traditional 4Cs + Professional Grading)
const whiteLabDiamondsAttributes = {
  // Core 4Cs for White Diamonds
  shape: {
    type: "select",
    label: "Shape",
    options: ["Round", "Oval", "Cushion", "Princess", "Emerald", "Asscher", "Pear", "Marquise", "Radiant", "Heart"],
    required: true
  },
  carat_weight: {
    type: "number",
    label: "Carat Weight",
    min: 0.18,
    max: 10.0,
    step: 0.01,
    required: true
  },
  color_grade: {
    type: "select", 
    label: "Color Grade",
    options: ["D", "E", "F", "G", "H", "I", "J", "K"],
    description: "Traditional white diamond color scale (D = Colorless, K = Faint Yellow)",
    required: true
  },
  clarity_grade: {
    type: "select",
    label: "Clarity Grade", 
    options: ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"],
    required: true
  },
  
  // Professional Cut Grading
  cut_grade: {
    type: "select",
    label: "Cut Grade",
    options: ["EX", "VG", "GD", "ID"],
    description: "EX=Excellent, VG=Very Good, GD=Good, ID=Ideal",
    required: true
  },
  polish: {
    type: "select",
    label: "Polish",
    options: ["EX", "VG", "GD"],
    required: true
  },
  symmetry: {
    type: "select", 
    label: "Symmetry",
    options: ["EX", "VG", "GD"],
    required: true
  },
  
  // Measurements & Proportions
  length_mm: {
    type: "number",
    label: "Length (mm)",
    step: 0.01
  },
  width_mm: {
    type: "number", 
    label: "Width (mm)",
    step: 0.01
  },
  height_mm: {
    type: "number",
    label: "Height (mm)", 
    step: 0.01
  },
  depth_percentage: {
    type: "number",
    label: "Depth %",
    min: 50,
    max: 80,
    step: 0.1
  },
  table_percentage: {
    type: "number",
    label: "Table %",
    min: 50, 
    max: 70,
    step: 0.1
  },
  
  // Additional Properties
  fluorescence: {
    type: "select",
    label: "Fluorescence",
    options: ["NONE", "Faint", "Medium", "Strong"]
  },
  
  // Lab & Certification
  lab_type: {
    type: "select",
    label: "Growing Method",
    options: ["HPHT", "CVD"],
    required: true
  },
  certificate_lab: {
    type: "select",
    label: "Certificate Lab", 
    options: ["IGI", "GIA", "GCAL"]
  },
  certificate_number: {
    type: "text",
    label: "Certificate Number"
  }
};

// Fancy Color Lab Diamonds attributes (Color-focused + Intensity)
const fancyColorLabDiamondsAttributes = {
  // Core attributes for Fancy Colors
  shape: {
    type: "select",
    label: "Shape", 
    options: ["Round", "Oval", "Cushion", "Princess", "Emerald", "Asscher", "Pear", "Marquise", "Radiant", "Heart"],
    required: true
  },
  carat_weight: {
    type: "number",
    label: "Carat Weight",
    min: 0.18,
    max: 10.0,
    step: 0.01,
    required: true
  },
  
  // Fancy Color Specific Grading
  color_hue: {
    type: "select",
    label: "Color Hue",
    options: ["Pink", "Blue", "Yellow", "Green", "Orange", "Red", "Purple", "Brown", "Black", "Gray"],
    description: "Primary color of the fancy diamond",
    required: true
  },
  color_intensity: {
    type: "select",
    label: "Color Intensity",
    options: ["Faint", "Very Light", "Light", "Fancy Light", "Fancy", "Fancy Intense", "Fancy Vivid", "Fancy Deep"],
    description: "GIA color intensity scale for fancy colored diamonds",
    required: true
  },
  color_distribution: {
    type: "select",
    label: "Color Distribution",
    options: ["Even", "Uneven", "Concentrated"]
  },
  secondary_color: {
    type: "select",
    label: "Secondary Color (Optional)",
    options: ["None", "Pink", "Blue", "Yellow", "Green", "Orange", "Purple", "Brown", "Gray"]
  },
  
  // Traditional grading (less emphasis for fancy colors)
  clarity_grade: {
    type: "select",
    label: "Clarity Grade",
    options: ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"], 
    description: "Less critical for fancy colors than white diamonds"
  },
  cut_grade: {
    type: "select",
    label: "Cut Grade",
    options: ["EX", "VG", "GD", "ID"]
  },
  
  // Measurements
  length_mm: {
    type: "number",
    label: "Length (mm)",
    step: 0.01
  },
  width_mm: {
    type: "number",
    label: "Width (mm)",
    step: 0.01
  },
  height_mm: {
    type: "number",
    label: "Height (mm)",
    step: 0.01
  },
  
  // Lab & Certification
  lab_type: {
    type: "select",
    label: "Growing Method", 
    options: ["HPHT", "CVD"],
    description: "HPHT often produces better fancy colors",
    required: true
  },
  certificate_lab: {
    type: "select",
    label: "Certificate Lab",
    options: ["IGI", "GIA", "GCAL"]
  },
  certificate_number: {
    type: "text",
    label: "Certificate Number"
  },
  
  // Treatment Information
  color_treatment: {
    type: "select",
    label: "Color Treatment",
    options: ["Natural", "Enhanced", "Treated"],
    description: "How the color was achieved"
  }
};

async function addProductTypeAttributes() {
  console.log("🎨 Adding product type attributes...");
  console.log(`📡 Backend URL: ${BACKEND_URL}`);

  try {
    const medusa = new MedusaAdminAPI(BACKEND_URL);

    // Authenticate
    console.log("🔐 Authenticating...");
    await medusa.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log("✅ Authentication successful!");

    // Get existing product types
    console.log("🔍 Fetching product types...");
    const response = await medusa.listProductTypes();
    const productTypes = response.product_types || [];
    
    console.log(`📋 Found ${productTypes.length} product types`);
    
    // Find our diamond product types
    const whiteLabType = productTypes.find(type => type.value === "White Lab Diamonds");
    const fancyColorType = productTypes.find(type => type.value === "Fancy Color Lab Diamonds");
    
    if (!whiteLabType) {
      console.error("❌ 'White Lab Diamonds' product type not found!");
      return;
    }
    
    if (!fancyColorType) {
      console.error("❌ 'Fancy Color Lab Diamonds' product type not found!");
      return;
    }
    
    console.log("✅ Found both diamond product types");
    
    // Update White Lab Diamonds with proper attributes
    console.log("🤍 Adding attributes to 'White Lab Diamonds'...");
    try {
      await medusa.updateProductType(whiteLabType.id, {
        metadata: whiteLabDiamondsAttributes
      });
      console.log("✅ Updated 'White Lab Diamonds' with traditional diamond attributes");
    } catch (error: any) {
      console.warn("⚠️ Could not update White Lab Diamonds metadata:", error.message);
    }
    
    // Update Fancy Color Lab Diamonds with proper attributes  
    console.log("🌈 Adding attributes to 'Fancy Color Lab Diamonds'...");
    try {
      await medusa.updateProductType(fancyColorType.id, {
        metadata: fancyColorLabDiamondsAttributes
      });
      console.log("✅ Updated 'Fancy Color Lab Diamonds' with color-specific attributes");
    } catch (error: any) {
      console.warn("⚠️ Could not update Fancy Color Lab Diamonds metadata:", error.message);
    }
    
    console.log("");
    console.log("🎉 Product type attributes added successfully!");
    console.log("");
    console.log("🤍 White Lab Diamonds now has:");
    console.log("   • Traditional 4Cs (Shape, Carat, Color D-K, Clarity)");
    console.log("   • Professional cut grading (Cut, Polish, Symmetry)");
    console.log("   • Measurements & proportions");
    console.log("   • Lab type (HPHT/CVD) & certification");
    console.log("");
    console.log("🌈 Fancy Color Lab Diamonds now has:");
    console.log("   • Color-focused attributes (Hue, Intensity, Distribution)");
    console.log("   • GIA fancy color intensity scale");
    console.log("   • Secondary color options");
    console.log("   • Color treatment information");
    console.log("");
    console.log(`🌐 Check your admin: ${BACKEND_URL}/app/product-types`);
    console.log("   → Each type should now show proper metadata keys");
    console.log("   → Create new products with type-specific forms");
    
  } catch (error: any) {
    console.error("❌ Failed to add product type attributes:", error.message);
    throw error;
  }
}

// Run the attribute addition
addProductTypeAttributes().catch((error) => {
  console.error("Attribute addition failed:", error.message);
});
