// Add only KEY diamond attributes as product options (Shape + Carat)
// This creates actual form fields without too many variants

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

async function addKeyDiamondOptions() {
  console.log("💎 Adding key diamond options (Shape + Carat only)...");
  console.log(`📡 Backend URL: ${BACKEND_URL}`);

  try {
    const medusa = new MedusaAdminAPI(BACKEND_URL);
    
    console.log("🔐 Authenticating...");
    await medusa.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log("✅ Authentication successful!");

    // Get first few products to test
    console.log("📦 Fetching diamond products...");
    const productsResponse = await medusa.listProducts({ limit: 5 });
    const products = productsResponse.products || [];

    console.log(`📊 Testing with ${products.length} products`);

    if (products.length === 0) {
      console.log("⚠️ No products found. Make sure you have seeded diamonds first.");
      return;
    }

    // Update one product as example
    const product = products[0];
    console.log(`🔧 Adding options to: "${product.title}"`);

    // Add only Shape and Carat as product options
    const existingOptions = product.options || [];
    
    // Check if we already have these options
    const hasShapeOption = existingOptions.some(opt => opt.title === "Diamond Shape");
    const hasCaratOption = existingOptions.some(opt => opt.title === "Diamond Carat");

    if (hasShapeOption && hasCaratOption) {
      console.log("✅ Product already has diamond shape and carat options");
      return;
    }

    const newOptions = [...existingOptions];

    if (!hasShapeOption) {
      newOptions.push({
        title: "Diamond Shape",
        values: [
          { value: "Round" },
          { value: "Oval" }, 
          { value: "Cushion" },
          { value: "Princess" },
          { value: "Emerald" },
          { value: "Asscher" },
          { value: "Pear" },
          { value: "Marquise" },
          { value: "Radiant" }
        ]
      });
    }

    if (!hasCaratOption) {
      newOptions.push({
        title: "Diamond Carat",
        values: [
          { value: "0.25ct" },
          { value: "0.50ct" },
          { value: "0.75ct" },
          { value: "1.00ct" },
          { value: "1.25ct" },
          { value: "1.50ct" },
          { value: "2.00ct" },
          { value: "2.50ct" },
          { value: "3.00ct" },
          { value: "4.00ct" },
          { value: "5.00ct+" }
        ]
      });
    }

    const updateData = {
      options: newOptions
    };

    await medusa.updateProduct(product.id, updateData);

    console.log("");
    console.log("🎉 Key diamond options added!");
    console.log("");
    console.log("✅ Now you'll see these dropdowns:");
    console.log("   💍 Diamond Shape (9 options)");
    console.log("   ⚖️ Diamond Carat (11 options)"); 
    console.log("   🔧 Metal Type (existing)");
    console.log("   💍 Setting (existing)");
    console.log("");
    console.log("📊 This creates: 9 × 11 × 3 × 9 = ~2,700 variants");
    console.log("   (Still manageable vs 230k+ variants)");
    console.log("");
    console.log("💡 For detailed attributes (Color, Clarity, Cut, etc.):");
    console.log("   → Use the Metadata section below the form");
    console.log("   → Copy from existing product metadata");
    console.log("");
    console.log(`🌐 Test it: ${BACKEND_URL}/app/products/${product.id}`);

  } catch (error: any) {
    console.error("❌ Failed to add key diamond options:", error.message);
    throw error;
  }
}

addKeyDiamondOptions().catch((error) => {
  console.error("Key diamond options script failed:", error.message);
});
