// Add diamond attributes as actual product options that show in admin forms
// This creates real form fields, unlike product type metadata

const BACKEND_URL = "https://backend-production-c68b.up.railway.app";
const ADMIN_EMAIL = "admin@yourmail.com";
const ADMIN_PASSWORD = "bnmugz7hs4gsk65l0566eos2s4kxmeho";

class MedusaAdminAPI {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/user/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

  async listProducts(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/products${query ? `?${query}` : ""}`);
  }

  async updateProduct(id: string, data: any) {
    return this.request(`/admin/products/${id}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

// Core diamond attributes that should be visible in admin forms
const DIAMOND_CORE_OPTIONS = [
  {
    title: "Diamond Shape",
    values: [
      "Round", "Oval", "Cushion", "Princess", "Emerald", 
      "Asscher", "Pear", "Marquise", "Radiant", "Heart"
    ]
  },
  {
    title: "Diamond Carat",
    values: [
      "0.25ct", "0.50ct", "0.75ct", "1.00ct", "1.25ct", "1.50ct", 
      "1.75ct", "2.00ct", "2.50ct", "3.00ct", "4.00ct", "5.00ct+"
    ]
  },
  {
    title: "Diamond Color",
    values: [
      // White diamonds
      "D", "E", "F", "G", "H", "I", "J", "K",
      // Fancy colors  
      "Fancy Light Yellow", "Fancy Yellow", "Fancy Intense Yellow",
      "Fancy Light Pink", "Fancy Pink", "Fancy Intense Pink",
      "Fancy Light Blue", "Fancy Blue", "Fancy Intense Blue",
      "Fancy Green", "Fancy Orange", "Fancy Purple"
    ]
  },
  {
    title: "Diamond Clarity", 
    values: ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"]
  },
  {
    title: "Diamond Cut Grade",
    values: ["Excellent", "Very Good", "Good", "Ideal"]
  },
  {
    title: "Lab Type",
    values: ["HPHT", "CVD", "Natural"]
  }
];

async function addDiamondProductOptions() {
  console.log("💎 Adding diamond attributes as product options...");
  console.log("📝 This will create ACTUAL form fields in admin!");
  console.log(`📡 Backend URL: ${BACKEND_URL}`);

  try {
    const medusa = new MedusaAdminAPI(BACKEND_URL);
    
    console.log("🔐 Authenticating...");
    await medusa.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log("✅ Authentication successful!");

    // Get all existing products
    console.log("📦 Fetching existing diamond products...");
    let allProducts: any[] = [];
    let offset = 0;
    let limit = 100;
    let hasMore = true;

    while (hasMore) {
      const productsResponse = await medusa.listProducts({ limit, offset });
      allProducts = allProducts.concat(productsResponse.products || []);
      hasMore = productsResponse.count > allProducts.length;
      offset += limit;
    }

    console.log(`📊 Found ${allProducts.length} products to update`);

    if (allProducts.length === 0) {
      console.log("⚠️ No products found. Make sure you have seeded diamonds first.");
      return;
    }

    // Update products to include diamond attribute options
    console.log("🔧 Adding diamond attribute options to products...");
    let updatedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < allProducts.length; i++) {
      const product = allProducts[i];
      
      try {
        // Create options for diamond attributes
        const diamondOptions = DIAMOND_CORE_OPTIONS.map(option => ({
          title: option.title,
          values: option.values.map(value => ({ value }))
        }));

        // Keep existing options (Metal Type and Setting) and add diamond attributes
        const existingOptions = product.options || [];
        const allOptions = [...existingOptions, ...diamondOptions];

        const updateData = {
          options: allOptions,
          // Add diamond attributes to metadata for filtering
          metadata: {
            ...product.metadata,
            has_diamond_attributes: "true",
            diamond_form_fields: "shape,carat,color,clarity,cut,lab_type",
            updated_with_options: new Date().toISOString()
          }
        };

        await medusa.updateProduct(product.id, updateData);
        updatedCount++;

        if ((i + 1) % 10 === 0) {
          console.log(`🔧 Updated ${i + 1}/${allProducts.length} products...`);
        }

        await new Promise(resolve => setTimeout(resolve, 150));

      } catch (error: any) {
        errorCount++;
        if (errorCount <= 3) {
          console.warn(`⚠️ Could not update product "${product.title}":`, error.message);
        }
      }
    }

    console.log("");
    console.log("🎉 Diamond product options added!");
    console.log(`📊 Results: ${updatedCount} success, ${errorCount} errors`);
    console.log("");
    console.log("✅ Now when you create/edit products you'll see:");
    console.log("   💍 Diamond Shape dropdown");
    console.log("   ⚖️ Diamond Carat dropdown");  
    console.log("   🎨 Diamond Color dropdown");
    console.log("   💎 Diamond Clarity dropdown");
    console.log("   ✂️ Diamond Cut Grade dropdown");
    console.log("   🧪 Lab Type dropdown");
    console.log("   🔧 Metal Type dropdown (existing)");
    console.log("   💍 Setting dropdown (existing)");
    console.log("");
    console.log("⚠️ NOTE: This will create MANY variants!");
    console.log("   Each combination creates a variant");
    console.log("   You may want to limit options per product");
    console.log("");
    console.log(`🌐 Test it: ${BACKEND_URL}/app/products`);
    console.log("   → Create new product → Select 'White Lab Diamonds'");
    console.log("   → You should see all diamond attribute dropdowns!");

  } catch (error: any) {
    console.error("❌ Failed to add diamond product options:", error.message);
    throw error;
  }
}

addDiamondProductOptions().catch((error) => {
  console.error("Diamond options script failed:", error.message);
});
