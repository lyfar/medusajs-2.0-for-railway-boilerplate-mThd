// Create proper diamond product types with relevant attributes
// This script creates "White Lab Diamonds" and "Fancy Color Lab Diamonds" product types

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

  async createProductType(data: any) {
    return this.request("/admin/product-types", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async listProductTypes() {
    return this.request("/admin/product-types");
  }
}

// Function to determine if a diamond should be "White Lab Diamonds" or "Fancy Color Lab Diamonds"
function getDiamondProductType(metadata: any) {
  const color = metadata?.diamond_color;
  
  // Traditional white diamond colors (D, E, F, G, H, I, J, K)
  const whiteColors = ["D", "E", "F", "G", "H", "I", "J", "K"];
  
  if (whiteColors.includes(color)) {
    return "White Lab Diamonds";
  } else {
    return "Fancy Color Lab Diamonds";
  }
}

// Function to clean product attributes
function getCleanedProductData(product: any, productTypes: any[]) {
  const diamondType = getDiamondProductType(product.metadata);
  
  // Find the product type object
  const productType = productTypes.find(type => type.value === diamondType);
  
  return {
    type_id: productType ? productType.id : null,
    // Remove irrelevant default attributes by setting to null
    height: null,
    width: null, 
    length: null,
    weight: null,
    mid_code: null,
    hs_code: null,
    origin_country: null,
    material: product.metadata?.diamond_type || "Lab Grown Diamond",
    // Keep relevant metadata and convert some to product attributes
    metadata: {
      ...product.metadata,
      // Enhanced diamond-specific metadata
      product_type: diamondType,
      diamond_category: product.metadata?.diamond_type,
      search_keywords: `${product.metadata?.diamond_shape} ${product.metadata?.diamond_color} ${product.metadata?.diamond_clarity} lab diamond`,
      is_white_diamond: diamondType === "White Lab Diamonds" ? "true" : "false",
      is_fancy_color: diamondType === "Fancy Color Lab Diamonds" ? "true" : "false",
    }
  };
}

async function createDiamondProductTypes() {
  console.log("💎 Creating diamond product types...");
  console.log(`📡 Backend URL: ${BACKEND_URL}`);

  try {
    const medusa = new MedusaAdminAPI(BACKEND_URL);

    // Authenticate with admin credentials
    console.log("🔐 Authenticating with admin credentials...");
    await medusa.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log("✅ Authentication successful!");

    // Check existing product types
    console.log("🔍 Checking existing product types...");
    const existingTypes = await medusa.listProductTypes();
    console.log(`📋 Found ${existingTypes.product_types?.length || 0} existing product types`);

    const whiteLabDiamondsExists = existingTypes.product_types?.some((type: any) => type.value === "White Lab Diamonds");
    const fancyColorExists = existingTypes.product_types?.some((type: any) => type.value === "Fancy Color Lab Diamonds");

    // Create "White Lab Diamonds" product type if it doesn't exist
    if (!whiteLabDiamondsExists) {
      try {
        console.log("🤍 Creating 'White Lab Diamonds' product type...");
        await medusa.createProductType({
          value: "White Lab Diamonds"
        });
        console.log("✅ Created 'White Lab Diamonds' product type");
      } catch (error: any) {
        console.log("ℹ️ White Lab Diamonds type may already exist:", error.message);
      }
    } else {
      console.log("✅ 'White Lab Diamonds' product type already exists");
    }

    // Create "Fancy Color Lab Diamonds" product type if it doesn't exist
    if (!fancyColorExists) {
      try {
        console.log("🌈 Creating 'Fancy Color Lab Diamonds' product type...");
        await medusa.createProductType({
          value: "Fancy Color Lab Diamonds"
        });
        console.log("✅ Created 'Fancy Color Lab Diamonds' product type");
      } catch (error: any) {
        console.log("ℹ️ Fancy Color Lab Diamonds type may already exist:", error.message);
      }
    } else {
      console.log("✅ 'Fancy Color Lab Diamonds' product type already exists");
    }

    // Get all existing products to update them
    console.log("📦 Fetching all products to update...");
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
      console.log("No products found to update. Make sure you have seeded your diamonds first.");
      return;
    }

    // Get the updated product types list for ID mapping
    console.log("🔍 Fetching updated product types...");
    const updatedTypes = await medusa.listProductTypes();
    const productTypes = updatedTypes.product_types || [];
    console.log(`📋 Found ${productTypes.length} product types available`);

    // Update each product with the appropriate diamond product type
    console.log("🔄 Updating products with diamond product types...");
    let updatedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < allProducts.length; i++) {
      const product = allProducts[i];
      
      try {
        const cleanedData = getCleanedProductData(product, productTypes);
        
        await medusa.updateProduct(product.id, cleanedData);
        
        updatedCount++;
        
        if ((i + 1) % 10 === 0) {
          console.log(`🔄 Updated ${i + 1}/${allProducts.length} products (${updatedCount} success, ${errorCount} errors)...`);
        }
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error: any) {
        errorCount++;
        if (errorCount <= 3) { // Only log first few errors
          console.warn(`⚠️ Could not update product "${product.title}":`, error.message);
        }
      }
    }

    console.log("✅ Product type setup completed!");
    console.log(`📊 Results: ${updatedCount} products updated, ${errorCount} errors`);
    console.log("");
    console.log("🎉 Your diamonds now have proper product types:");
    console.log("   🤍 White Lab Diamonds - for traditional D-K color diamonds");
    console.log("   🌈 Fancy Color Lab Diamonds - for specialty colored diamonds");
    console.log("");
    console.log("🧹 Cleaned up irrelevant attributes:");
    console.log("   ❌ Removed: Height, Width, Length, Weight, MID code, HS code, Country of origin");
    console.log("   ✅ Added: Proper diamond material and enhanced metadata");
    console.log("");
    console.log(`🌐 Check your admin panel: ${BACKEND_URL}/app/products`);
    console.log("   → Products should now show proper diamond product types");
    console.log("   → Irrelevant attributes should be removed");
    
  } catch (error: any) {
    console.error("❌ Product type creation failed:", error.message);
    throw error;
  }
}

// Run the product type creation
createDiamondProductTypes().catch((error) => {
  console.error("Product type creation failed:", error.message);
});
