// Fix inventory levels for existing products
// This script sets proper inventory levels for all existing product variants

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

  async listInventoryItems(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/inventory-items${query ? `?${query}` : ""}`);
  }

  async listStockLocations() {
    return this.request("/admin/stock-locations");
  }

  async createInventoryLevel(inventoryItemId: string, data: any) {
    return this.request(`/admin/inventory-items/${inventoryItemId}/location-levels`, {
      method: "POST", 
      body: JSON.stringify(data),
    });
  }

  async updateInventoryLevel(inventoryItemId: string, locationId: string, data: any) {
    return this.request(`/admin/inventory-items/${inventoryItemId}/location-levels/${locationId}`, {
      method: "POST", 
      body: JSON.stringify(data),
    });
  }
}

async function fixInventoryLevels() {
  console.log("🔧 Starting inventory fix for existing products...");
  console.log(`📡 Backend URL: ${BACKEND_URL}`);

  try {
    const medusa = new MedusaAdminAPI(BACKEND_URL);

    // Authenticate with admin credentials
    console.log("🔐 Authenticating with admin credentials...");
    await medusa.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log("✅ Authentication successful!");

    // Get all inventory items
    console.log("🔍 Fetching inventory items...");
    let allInventoryItems: any[] = [];
    let offset = 0;
    let limit = 100;
    let hasMore = true;

    while (hasMore) {
      const inventoryResponse = await medusa.listInventoryItems({ limit, offset });
      allInventoryItems = allInventoryItems.concat(inventoryResponse.inventory_items || []);
      hasMore = inventoryResponse.count > allInventoryItems.length;
      offset += limit;
    }

    console.log(`📋 Found ${allInventoryItems.length} inventory items`);

    // Get stock locations
    console.log("🏪 Fetching stock locations...");
    const stockLocationsResponse = await medusa.listStockLocations();
    const stockLocations = stockLocationsResponse.stock_locations || [];
    
    if (stockLocations.length === 0) {
      console.error("❌ No stock locations found! Please ensure your backend has stock locations configured.");
      throw new Error("No stock locations available");
    }

    const defaultStockLocation = stockLocations[0];
    console.log(`✅ Using stock location: ${defaultStockLocation.name}`);

    // Fix inventory levels for all inventory items
    console.log("🔧 Fixing inventory levels...");
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < allInventoryItems.length; i++) {
      const inventoryItem = allInventoryItems[i];
      
      try {
        // Try creating inventory level first
        await medusa.createInventoryLevel(inventoryItem.id, {
          location_id: defaultStockLocation.id,
          stocked_quantity: 1, // Each variant represents the same physical stone
        });
        
        successCount++;
        if ((i + 1) % 50 === 0) {
          console.log(`🔧 Fixed inventory for ${i + 1}/${allInventoryItems.length} items (${successCount} success, ${errorCount} errors)...`);
        }
      } catch (error: any) {
        // If creation fails, try updating instead
        try {
          await medusa.updateInventoryLevel(inventoryItem.id, defaultStockLocation.id, {
            stocked_quantity: 1,
          });
          
          successCount++;
          if ((i + 1) % 50 === 0) {
            console.log(`🔧 Fixed inventory for ${i + 1}/${allInventoryItems.length} items (${successCount} success, ${errorCount} errors)...`);
          }
        } catch (updateError: any) {
          errorCount++;
          
          // Try a simpler approach - just the quantity
          try {
            await medusa.request(`/admin/inventory-items/${inventoryItem.id}/location-levels`, {
              method: "POST",
              body: JSON.stringify([{
                location_id: defaultStockLocation.id,
                stocked_quantity: 1
              }])
            });
            
            successCount++;
            if ((i + 1) % 50 === 0) {
              console.log(`🔧 Fixed inventory for ${i + 1}/${allInventoryItems.length} items (${successCount} success, ${errorCount} errors)...`);
            }
          } catch (finalError: any) {
            // Log the actual error for debugging
            if (i < 5) { // Only log first few errors to avoid spam
              console.warn(`⚠️ Could not fix inventory for item ${inventoryItem.id}:`, error.message);
            }
          }
        }
      }
    }

    console.log("✅ Inventory fix completed!");
    console.log(`📊 Results: ${successCount} successful, ${errorCount} errors out of ${allInventoryItems.length} total items`);
    console.log(`🌐 Check your admin panel: ${BACKEND_URL}/app/inventory`);
    
  } catch (error: any) {
    console.error("❌ Inventory fix failed:", error.message);
    throw error;
  }
}

// Run the inventory fix
fixInventoryLevels().catch((error) => {
  console.error("Inventory fix failed:", error.message);
});
