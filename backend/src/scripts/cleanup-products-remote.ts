// Production backend configuration
const BACKEND_URL = "https://backend-production-c68b.up.railway.app";
const ADMIN_EMAIL = "admin@yourmail.com";
const ADMIN_PASSWORD = "bnmugz7hs4gsk65l0566eos2s4kxmeho";

// API helper class (reusing from seed script)
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
      const errorText = await response.text();
      throw new Error(`Login failed: ${response.status} ${response.statusText} - ${errorText}`);
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
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  }

  async listProducts(limit: number = 100, offset: number = 0) {
    return this.request(`/admin/products?limit=${limit}&offset=${offset}`);
  }

  async deleteProduct(productId: string) {
    return this.request(`/admin/products/${productId}`, {
      method: "DELETE",
    });
  }
}

async function cleanupProductsInProduction() {
  console.log("🧹 Starting product database cleanup...");
  console.log(`📡 Backend URL: ${BACKEND_URL}`);
  
  try {
    const medusa = new MedusaAdminAPI(BACKEND_URL);

    // Authenticate
    console.log("🔐 Authenticating...");
    await medusa.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log("✅ Authentication successful!");

    // Get all products
    console.log("📦 Fetching all products...");
    let allProducts = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await medusa.listProducts(limit, offset);
      const products = response.products || [];
      
      if (products.length === 0) {
        hasMore = false;
      } else {
        allProducts.push(...products);
        offset += limit;
        console.log(`📄 Fetched ${allProducts.length} products so far...`);
      }
    }

    console.log(`📊 Found ${allProducts.length} products total`);

    if (allProducts.length === 0) {
      console.log("✨ Database is already clean - no products found!");
      return;
    }

    // Confirm deletion
    console.log("⚠️ WARNING: This will DELETE ALL products from your database!");
    console.log(`🗑️ About to delete ${allProducts.length} products...`);
    
    // Delete all products
    let deletedCount = 0;
    for (const product of allProducts) {
      try {
        await medusa.deleteProduct(product.id);
        deletedCount++;
        console.log(`🗑️ Deleted (${deletedCount}/${allProducts.length}): ${product.title}`);
        
        // Small delay to avoid overwhelming API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        console.error(`❌ Failed to delete product ${product.id}: ${error.message}`);
      }
    }

    console.log("🎉 Database cleanup completed!");
    console.log(`📊 Successfully deleted ${deletedCount} out of ${allProducts.length} products`);
    console.log(`🌐 Check your admin panel: ${BACKEND_URL}/app/products`);
    
  } catch (error: any) {
    console.error("❌ Cleanup failed:", error.message);
    throw error;
  }
}

// Run the cleanup
cleanupProductsInProduction().catch((error) => {
  console.error("Cleanup failed:", error.message);
});
