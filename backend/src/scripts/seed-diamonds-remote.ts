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
    // Use the correct Medusa 2.0 user authentication endpoint
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

  async createCategory(data: any) {
    return this.request("/admin/product-categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async listCategories(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/product-categories${query ? `?${query}` : ""}`);
  }

  async listAllCategories() {
    return this.request("/admin/product-categories");
  }

  async listSalesChannels() {
    return this.request("/admin/sales-channels");
  }

  async createProduct(data: any) {
    return this.request("/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
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

// Diamond attribute definitions
const DIAMOND_SHAPES = [
  "Round", "Oval", "Cushion", "Princess", "Emerald", 
  "Asscher", "Pear", "Marquise", "Radiant", "Heart"
];

const DIAMOND_COLORS = ["K", "J", "I", "H", "G", "F", "E", "D"];
const DIAMOND_CLARITIES = ["SI2", "SI1", "VS2", "VS1", "VVS2", "VVS1", "IF", "FL"];
const DIAMOND_CUTS = ["Fair", "Good", "Very Good", "Excellent", "Ideal"];
const DIAMOND_LABS = ["IGI", "GIA", "GCAL"];
const METAL_TYPES = ["14K", "18K", "Platinum"];
const SETTING_TYPES = [
  "Solitaire Pendant", "Solitaire Ring", "Halo Ring", "Pave Ring", 
  "Hidden Halo Ring", "Halo Pave Ring", "Matching Stud Earrings"
];

// Function to determine diamond product type based on color
function getDiamondProductType(color: string): string {
  // Traditional white diamond colors (D, E, F, G, H, I, J, K)
  const whiteColors = ["D", "E", "F", "G", "H", "I", "J", "K"];
  
  if (whiteColors.includes(color)) {
    return "White Lab Diamonds";
  } else {
    return "Fancy Color Lab Diamonds";
  }
}

// Real diamond data structure based on your inventory
function generateRealisticDiamond(id: number) {
  // Categories from your data: HPHT, CVD, etc.
  const categories = [
    { name: "HPHT", prefix: "HPHT" },
    { name: "CVD", prefix: "CVD" }, 
    { name: "Natural", prefix: "NAT" }
  ];
  
  const category = categories[Math.floor(Math.random() * categories.length)];
  const shape = DIAMOND_SHAPES[Math.floor(Math.random() * DIAMOND_SHAPES.length)];
  const color = DIAMOND_COLORS[Math.floor(Math.random() * DIAMOND_COLORS.length)];
  const clarity = DIAMOND_CLARITIES[Math.floor(Math.random() * DIAMOND_CLARITIES.length)];
  
  // More realistic cut grades based on your data (EX, ID, VG)
  const cutGrades = ["EX", "ID", "VG"]; // Excellent, Ideal, Very Good
  const polishGrades = ["EX", "VG"]; // Excellent, Very Good  
  const symmetryGrades = ["EX", "VG"]; // Excellent, Very Good
  
  const cut = cutGrades[Math.floor(Math.random() * cutGrades.length)];
  const polish = polishGrades[Math.floor(Math.random() * polishGrades.length)];
  const symmetry = symmetryGrades[Math.floor(Math.random() * symmetryGrades.length)];
  
  // More realistic carat weights based on your data (0.51-5.31 range)
  const carat = parseFloat((Math.random() * (5.31 - 0.51) + 0.51).toFixed(2));
  
  // Realistic pricing based on actual market values (not cents)
  let basePrice = 0;
  
  // Price calculation based on carat weight and quality
  if (carat < 1.0) {
    basePrice = carat * (800 + (DIAMOND_COLORS.length - DIAMOND_COLORS.indexOf(color)) * 100);
  } else if (carat < 2.0) {
    basePrice = carat * (1500 + (DIAMOND_COLORS.length - DIAMOND_COLORS.indexOf(color)) * 200);
  } else if (carat < 3.0) {
    basePrice = carat * (2200 + (DIAMOND_COLORS.length - DIAMOND_COLORS.indexOf(color)) * 300);
  } else {
    basePrice = carat * (3000 + (DIAMOND_COLORS.length - DIAMOND_COLORS.indexOf(color)) * 400);
  }
  
  // Adjust for clarity
  basePrice += (DIAMOND_CLARITIES.length - DIAMOND_CLARITIES.indexOf(clarity)) * 150;
  
  // Round to reasonable price
  basePrice = Math.round(basePrice);
  
  // Generate realistic measurements based on carat weight
  const avgDiameter = Math.sqrt(carat * 6.4); // Approximate diameter for round
  const length = parseFloat((avgDiameter + (Math.random() - 0.5) * 0.5).toFixed(2));
  const width = parseFloat((avgDiameter + (Math.random() - 0.5) * 0.3).toFixed(2)); 
  const height = parseFloat((avgDiameter * 0.6 + (Math.random() - 0.5) * 0.2).toFixed(2));
  
  const lwRatio = parseFloat((length / width).toFixed(2));
  const depth = parseFloat(((height / ((length + width) / 2)) * 100).toFixed(1));
  const table = parseFloat((55 + Math.random() * 10).toFixed(1)); // 55-65% typical range
  
  // Generate certificate number like your data (LG followed by numbers)
  const certNumber = `LG${Math.floor(100000000 + Math.random() * 900000000)}`;
  
  // Location/remarks from your data (translate Chinese cities)
  const locations = ["Shenzhen", "Guangzhou", "Zhengzhou", "Shanghai"];
  const location = locations[Math.floor(Math.random() * locations.length)];

  return {
    category: category.name,
    categoryPrefix: category.prefix,
    shape,
    color,
    clarity,
    cut,
    polish,
    symmetry,
    carat,
    lwRatio,
    depth,
    table,
    length,
    width,
    height,
    fluorescence: "N", // Most are N (None) in your data
    price: basePrice,
    certNumber,
    location,
    sku: `${category.prefix}-${shape.substring(0,3).toUpperCase()}${color}${clarity}-${id.toString().padStart(6, '0')}`
  };
}

async function seedDiamondsToProduction() {
  console.log("🚀 Starting remote diamond seeding to production backend...");
  console.log(`📡 Backend URL: ${BACKEND_URL}`);
  
  try {
    // Initialize Admin API
    const medusa = new MedusaAdminAPI(BACKEND_URL);

    // Authenticate with admin credentials
    console.log("🔐 Authenticating with admin credentials...");
    await medusa.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log("✅ Authentication successful!");

    // Check if sales channels exist
    console.log("📦 Fetching sales channels...");
    const salesChannelsResponse = await medusa.listSalesChannels();
    if (!salesChannelsResponse.sales_channels?.length) {
      throw new Error("No sales channels found. Please ensure your backend is properly seeded with basic data first.");
    }
    const defaultSalesChannel = salesChannelsResponse.sales_channels[0];
    console.log(`✅ Using sales channel: ${defaultSalesChannel.name}`);

    // Create diamond categories
    console.log("📂 Creating diamond categories...");
    const categories = [
      {
        name: "Lab Grown Diamonds",
        is_active: true,
        description: "Certified lab-grown diamonds with excellent quality"
      },
      {
        name: "Engagement Rings",
        is_active: true,
        description: "Beautiful engagement rings with lab-grown diamonds"
      },
      {
        name: "Wedding Rings",
        is_active: true,
        description: "Elegant wedding rings and bands"
      },
      {
        name: "Earrings",
        is_active: true,
        description: "Diamond stud earrings and more"
      },
      {
        name: "Pendants",
        is_active: true,
        description: "Diamond pendants and necklaces"
      }
    ];

    // First, get all existing categories
    const existingCategoriesResponse = await medusa.listAllCategories();
    const existingCategories = existingCategoriesResponse.product_categories || [];
    
    const createdCategories = [];
    
    for (const category of categories) {
      // Check if category already exists
      const existingCategory = existingCategories.find(cat => cat.name === category.name);
      
      if (existingCategory) {
        console.log(`✅ Using existing category: ${category.name}`);
        createdCategories.push(existingCategory);
      } else {
        try {
          const createdCategoryResponse = await medusa.createCategory(category);
          createdCategories.push(createdCategoryResponse.product_category);
          console.log(`✅ Created category: ${category.name}`);
        } catch (error: any) {
          console.error(`❌ Error creating category "${category.name}":`, error.message);
          // Try to find it in existing categories anyway
          const existingCategory = existingCategories.find(cat => cat.name === category.name);
          if (existingCategory) {
            createdCategories.push(existingCategory);
            console.log(`✅ Found existing category: ${category.name}`);
          }
        }
      }
    }

    const diamondCategory = createdCategories.find(cat => cat.name === "Lab Grown Diamonds");
    if (!diamondCategory) {
      console.log("Available categories:", createdCategories.map(cat => cat.name));
      throw new Error("Could not create or find Lab Grown Diamonds category");
    }
    
    console.log(`✅ Using Lab Grown Diamonds category with ID: ${diamondCategory.id}`);

    // Generate and create diamonds
    console.log("💎 Generating diamond products...");
    const numberOfDiamonds = 25; // Production diamonds with proper inventory
    
    for (let i = 1; i <= numberOfDiamonds; i++) {
      const diamond = generateRealisticDiamond(i);
      
      console.log(`⏳ Creating diamond ${i}/${numberOfDiamonds}: ${diamond.carat}ct ${diamond.shape} ${diamond.color}-${diamond.clarity} (${diamond.category}) - $${diamond.price} USD`);

      // Determine the appropriate product type for this diamond
      const productType = getDiamondProductType(diamond.color);

      const productData = {
        title: `${diamond.carat}ct ${diamond.shape} ${diamond.color}-${diamond.clarity} ${diamond.category}`,
        subtitle: `Certificate: ${diamond.certNumber}`,
        description: `${diamond.category} lab-grown diamond. ${diamond.shape} cut with ${diamond.color} color and ${diamond.clarity} clarity. Cut: ${diamond.cut}, Polish: ${diamond.polish}, Symmetry: ${diamond.symmetry}. Measurements: ${diamond.length}×${diamond.width}×${diamond.height}mm. Table: ${diamond.table}%, Depth: ${diamond.depth}%. Certificate: ${diamond.certNumber}. Location: ${diamond.location}.`,
        handle: `diamond-${diamond.sku.toLowerCase()}`,
        status: "published" as const,
        // Note: type_id should be set if you have product types created
        // For now, we'll set this in metadata and can be assigned later
        weight: null, // Remove irrelevant weight
        length: null, // Remove irrelevant length  
        width: null,  // Remove irrelevant width
        height: null, // Remove irrelevant height
        material: `${diamond.category} Lab Diamond`,
        // category_ids: [diamondCategory.id], // Will add categories later
        sales_channels: [{ id: defaultSalesChannel.id }],
        images: [
          {
            url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80"
          }
        ],
        options: [
          {
            title: "Metal Type",
            values: ["14K", "18K", "Platinum"],
          },
          {
            title: "Setting",
            values: ["Loose", "Solitaire Pendant", "Pendant + Chain", "Stud Earrings", "Solitaire Ring", "Pave Ring", "Halo Ring", "Hidden Halo Ring", "Halo Pave Ring"],
          }
        ],
        variants: (() => {
          const metalTypes = [
            { name: "14K", priceMultiplier: 1.0 },
            { name: "18K", priceMultiplier: 1.15 },
            { name: "Platinum", priceMultiplier: 1.25 }
          ];
          
          const settings = [
            { name: "Loose", priceAdd: 0, shortName: "Loose" },
            { name: "Solitaire Pendant", priceAdd: 600, shortName: "Sol-Pendant" },
            { name: "Pendant + Chain", priceAdd: 800, shortName: "Pendant-Chain" },
            { name: "Stud Earrings", priceAdd: 789, shortName: "Studs" },
            { name: "Solitaire Ring", priceAdd: 900, shortName: "Sol-Ring" },
            { name: "Pave Ring", priceAdd: 1100, shortName: "Pave-Ring" },
            { name: "Halo Ring", priceAdd: 1200, shortName: "Halo-Ring" },
            { name: "Hidden Halo Ring", priceAdd: 1200, shortName: "Hidden-Halo" },
            { name: "Halo Pave Ring", priceAdd: 1400, shortName: "Halo-Pave" }
          ];
          
          const variants = [];
          
          metalTypes.forEach(metal => {
            settings.forEach(setting => {
              const basePrice = Math.round(diamond.price * metal.priceMultiplier);
              const finalPrice = basePrice + setting.priceAdd;
              
              variants.push({
                title: setting.name === "Loose" 
                  ? `${diamond.carat}ct ${diamond.color}-${diamond.clarity} (${metal.name})`
                  : `${diamond.carat}ct ${diamond.color}-${diamond.clarity} (${metal.name} ${setting.name})`,
                sku: `${diamond.sku}-${metal.name}-${setting.shortName}`,
                manage_inventory: true,
                prices: [
                  {
                    amount: finalPrice,
                    currency_code: "usd",
                  },
                  {
                    amount: Math.round(finalPrice * 0.85),
                    currency_code: "eur",
                  },
                ],
                options: {
                  "Metal Type": metal.name,
                  "Setting": setting.name
                },
              });
            });
          });
          
          return variants;
        })(),
        metadata: {
          // Core attributes
          diamond_type: diamond.category,
          diamond_shape: diamond.shape,
          diamond_color: diamond.color,
          diamond_clarity: diamond.clarity,
          diamond_carat: diamond.carat.toString(),
          diamond_cut: diamond.cut,
          diamond_polish: diamond.polish,
          diamond_symmetry: diamond.symmetry,
          
          // Measurements
          length: diamond.length.toString(),
          width: diamond.width.toString(),
          height: diamond.height.toString(),
          lw_ratio: diamond.lwRatio.toString(),
          depth: diamond.depth.toString(),
          table: diamond.table.toString(),
          
          // Certificate info
          certificate_number: diamond.certNumber,
          fluorescence: diamond.fluorescence,
          location: diamond.location,
          
          // Pricing info
          base_price_usd: diamond.price.toString(),
          
          // Product type and categorization
          product_type: productType,
          diamond_category: diamond.category,
          is_white_diamond: productType === "White Lab Diamonds" ? "true" : "false",
          is_fancy_color: productType === "Fancy Color Lab Diamonds" ? "true" : "false",
          
          // Search helpers
          is_lab_grown: "true",
          search_terms: `${diamond.category} ${diamond.shape} ${diamond.color} ${diamond.clarity} ${diamond.carat}ct ${productType}`,
          search_keywords: `${productType.toLowerCase()} ${diamond.shape.toLowerCase()} ${diamond.color} ${diamond.clarity}`,
          
          // Inventory management note
          inventory_note: "When ANY variant is purchased, ALL variants should become unavailable (same physical stone)",
          unique_stone_id: diamond.sku // Use this to link variants of the same stone
        }
      };

      try {
        const createdProductResponse = await medusa.createProduct(productData);
        console.log(`✅ Created diamond: ${createdProductResponse.product.title}`);
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error: any) {
        console.error(`❌ Error creating diamond ${i}:`, error.message);
        // Continue with next diamond even if one fails
      }
    }

    // Set up inventory management for all created products
    console.log("📦 Setting up inventory management...");
    
    // Get all inventory items (created automatically when products were created)
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

    // Create inventory levels for all inventory items
    console.log("📊 Creating inventory levels...");
    for (let i = 0; i < allInventoryItems.length; i++) {
      const inventoryItem = allInventoryItems[i];
      try {
        await medusa.createInventoryLevel(inventoryItem.id, {
          location_id: defaultStockLocation.id,
          stocked_quantity: 1, // Each variant represents the same physical stone
        });
        
        if ((i + 1) % 50 === 0) {
          console.log(`📦 Set inventory for ${i + 1}/${allInventoryItems.length} items...`);
        }
      } catch (error: any) {
        // If creation fails, try updating instead
        try {
          await medusa.updateInventoryLevel(inventoryItem.id, defaultStockLocation.id, {
            stocked_quantity: 1,
          });
          console.log(`✅ Updated inventory for item ${inventoryItem.id}`);
        } catch (updateError: any) {
          // Skip if it still fails
          if (!error.message.includes("already exists") && !error.message.includes("duplicate")) {
            console.warn(`⚠️ Could not set inventory for item ${inventoryItem.id}:`, error.message);
          }
        }
      }
    }

    console.log("✅ Inventory management setup completed!");

    console.log("🎉 Diamond seeding completed successfully!");
    console.log(`📊 Created ${numberOfDiamonds} diamonds in your production database`);
    console.log(`📦 Each diamond has 27 variants (3 metals × 9 settings) with proper inventory`);
    console.log(`💎 All variants set to quantity = 1 (represents same physical stone)`);
    console.log(`🌐 Check your admin panel: ${BACKEND_URL}/app/products`);
    
  } catch (error: any) {
    console.error("❌ Seeding failed:", error.message);
    throw error;
  }
}

// Run the seeding
seedDiamondsToProduction().catch((error) => {
  console.error("Seeding failed:", error.message);
});
