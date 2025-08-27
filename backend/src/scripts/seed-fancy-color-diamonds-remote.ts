// Seed Fancy Color Lab Diamonds to complement existing White Lab Diamonds
// This script focuses specifically on fancy colored diamonds with proper color grading

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

  async createProductCategory(data: any) {
    return this.request("/admin/product-categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async listProductCategories(params: any = {}) {
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
}

// Fancy Color Diamond Attributes
const DIAMOND_SHAPES = [
  "Round", "Oval", "Cushion", "Princess", "Emerald", 
  "Asscher", "Pear", "Marquise", "Radiant", "Heart"
];

// Fancy Color Diamonds - Color Hues and Intensities
const FANCY_COLOR_COMBINATIONS = [
  // Yellow diamonds (most common fancy color)
  { hue: "Yellow", intensity: "Fancy Light", display: "Fancy Light Yellow", premium: 1.5 },
  { hue: "Yellow", intensity: "Fancy", display: "Fancy Yellow", premium: 2.0 },
  { hue: "Yellow", intensity: "Fancy Intense", display: "Fancy Intense Yellow", premium: 2.8 },
  { hue: "Yellow", intensity: "Fancy Vivid", display: "Fancy Vivid Yellow", premium: 4.0 },

  // Pink diamonds (very popular, expensive)
  { hue: "Pink", intensity: "Faint", display: "Faint Pink", premium: 3.0 },
  { hue: "Pink", intensity: "Very Light", display: "Very Light Pink", premium: 4.5 },
  { hue: "Pink", intensity: "Light", display: "Light Pink", premium: 6.0 },
  { hue: "Pink", intensity: "Fancy Light", display: "Fancy Light Pink", premium: 8.5 },
  { hue: "Pink", intensity: "Fancy", display: "Fancy Pink", premium: 12.0 },
  { hue: "Pink", intensity: "Fancy Intense", display: "Fancy Intense Pink", premium: 18.0 },
  { hue: "Pink", intensity: "Fancy Vivid", display: "Fancy Vivid Pink", premium: 25.0 },

  // Blue diamonds (rare, very expensive)
  { hue: "Blue", intensity: "Faint", display: "Faint Blue", premium: 5.0 },
  { hue: "Blue", intensity: "Very Light", display: "Very Light Blue", premium: 8.0 },
  { hue: "Blue", intensity: "Light", display: "Light Blue", premium: 12.0 },
  { hue: "Blue", intensity: "Fancy Light", display: "Fancy Light Blue", premium: 20.0 },
  { hue: "Blue", intensity: "Fancy", display: "Fancy Blue", premium: 30.0 },
  { hue: "Blue", intensity: "Fancy Intense", display: "Fancy Intense Blue", premium: 45.0 },

  // Green diamonds (rare)
  { hue: "Green", intensity: "Faint", display: "Faint Green", premium: 6.0 },
  { hue: "Green", intensity: "Very Light", display: "Very Light Green", premium: 10.0 },
  { hue: "Green", intensity: "Light", display: "Light Green", premium: 15.0 },
  { hue: "Green", intensity: "Fancy", display: "Fancy Green", premium: 25.0 },

  // Orange diamonds (rare)
  { hue: "Orange", intensity: "Fancy Light", display: "Fancy Light Orange", premium: 8.0 },
  { hue: "Orange", intensity: "Fancy", display: "Fancy Orange", premium: 15.0 },
  { hue: "Orange", intensity: "Fancy Intense", display: "Fancy Intense Orange", premium: 22.0 },

  // Purple diamonds (very rare)
  { hue: "Purple", intensity: "Faint", display: "Faint Purple", premium: 8.0 },
  { hue: "Purple", intensity: "Light", display: "Light Purple", premium: 18.0 },
  { hue: "Purple", intensity: "Fancy", display: "Fancy Purple", premium: 35.0 },

  // Brown/Champagne diamonds (more affordable fancy colors)
  { hue: "Brown", intensity: "Light", display: "Light Brown", premium: 0.8 },
  { hue: "Brown", intensity: "Fancy Light", display: "Fancy Light Brown", premium: 1.2 },
  { hue: "Brown", intensity: "Fancy", display: "Fancy Brown", premium: 1.8 },
];

const DIAMOND_CLARITIES = ["SI2", "SI1", "VS2", "VS1", "VVS2", "VVS1", "IF", "FL"];
const DIAMOND_CUTS = ["Fair", "Good", "Very Good", "Excellent", "Ideal"];

// Enhanced metal types and settings for fancy colors
const METAL_TYPES = [
  { name: "14K Yellow Gold", multiplier: 1.0, abbrev: "14KY" },
  { name: "14K White Gold", multiplier: 1.0, abbrev: "14KW" },
  { name: "14K Rose Gold", multiplier: 1.1, abbrev: "14KR" },
  { name: "18K Yellow Gold", multiplier: 1.3, abbrev: "18KY" },
  { name: "18K White Gold", multiplier: 1.3, abbrev: "18KW" },
  { name: "18K Rose Gold", multiplier: 1.4, abbrev: "18KR" },
  { name: "Platinum", multiplier: 1.8, abbrev: "PT" }
];

const SETTING_TYPES = [
  { name: "Loose", addition: 0, abbrev: "Loose" },
  { name: "Solitaire Pendant", addition: 450, abbrev: "Pendant" },
  { name: "Pendant + Chain", addition: 680, abbrev: "Chain" },
  { name: "Stud Earrings", addition: 890, abbrev: "Studs" },
  { name: "Solitaire Ring", addition: 750, abbrev: "Solitaire" },
  { name: "Pave Ring", addition: 1200, abbrev: "Pave" },
  { name: "Halo Ring", addition: 980, abbrev: "Halo" },
  { name: "Hidden Halo Ring", addition: 1150, abbrev: "Hidden" },
  { name: "Halo Pave Ring", addition: 1450, abbrev: "HaloPave" }
];

// Chinese cities translated to English
const DIAMOND_LOCATIONS = [
  "Shanghai", "Beijing", "Shenzhen", "Guangzhou", "Chengdu", 
  "Hangzhou", "Wuhan", "Xi'an", "Nanjing", "Tianjin",
  "Antwerp", "New York", "Mumbai", "Tel Aviv", "Bangkok"
];

function generateFancyColorDiamond(id: number) {
  // Lab types - HPHT often produces better fancy colors
  const categories = [
    { name: "HPHT", prefix: "HPHT", fancyColorBonus: 1.2 },
    { name: "CVD", prefix: "CVD", fancyColorBonus: 1.0 }, 
    { name: "Natural", prefix: "NAT", fancyColorBonus: 1.5 }
  ];
  
  const category = categories[Math.floor(Math.random() * categories.length)];
  const shape = DIAMOND_SHAPES[Math.floor(Math.random() * DIAMOND_SHAPES.length)];
  const fancyColor = FANCY_COLOR_COMBINATIONS[Math.floor(Math.random() * FANCY_COLOR_COMBINATIONS.length)];
  const clarity = DIAMOND_CLARITIES[Math.floor(Math.random() * DIAMOND_CLARITIES.length)];
  
  // Cut grades for fancy colors (less critical than for white diamonds)
  const cutGrades = ["EX", "VG", "GD", "ID"];
  const polishGrades = ["EX", "VG"];
  const symmetryGrades = ["EX", "VG"];
  
  const cut = cutGrades[Math.floor(Math.random() * cutGrades.length)];
  const polish = polishGrades[Math.floor(Math.random() * polishGrades.length)];
  const symmetry = symmetryGrades[Math.floor(Math.random() * symmetryGrades.length)];
  
  // Fancy color diamonds often in smaller carat weights
  const carat = parseFloat((Math.random() * (3.5 - 0.3) + 0.3).toFixed(2));
  
  // Fancy color pricing (much higher than white diamonds)
  let basePrice = 1000; // Base price for small fancy color
  
  // Price based on carat
  if (carat < 0.5) {
    basePrice = carat * 3000;
  } else if (carat < 1.0) {
    basePrice = carat * 6000;
  } else if (carat < 2.0) {
    basePrice = carat * 12000;
  } else {
    basePrice = carat * 20000;
  }
  
  // Apply fancy color premium
  basePrice *= fancyColor.premium;
  
  // Apply lab type bonus
  basePrice *= category.fancyColorBonus;
  
  // Adjust for clarity (less important for fancy colors)
  basePrice += (DIAMOND_CLARITIES.length - DIAMOND_CLARITIES.indexOf(clarity)) * 200;
  
  // Round to reasonable price
  basePrice = Math.round(basePrice);
  
  // Generate measurements
  const avgDiameter = Math.sqrt(carat * 6.4);
  const length = parseFloat((avgDiameter + (Math.random() - 0.5) * 0.5).toFixed(2));
  const width = parseFloat((avgDiameter + (Math.random() - 0.5) * 0.3).toFixed(2)); 
  const height = parseFloat((avgDiameter * 0.6 + (Math.random() - 0.5) * 0.2).toFixed(2));
  
  const lwRatio = parseFloat((length / width).toFixed(2));
  const depth = parseFloat((height / ((length + width) / 2) * 100).toFixed(1));
  const table = parseFloat((56 + (Math.random() - 0.5) * 8).toFixed(1));
  
  // Generate certificate number (LG format)
  const certNumber = `LG${Math.floor(100000000 + Math.random() * 900000000)}`;
  
  const fluorescence = ["NONE", "Faint", "Medium"][Math.floor(Math.random() * 3)];
  const location = DIAMOND_LOCATIONS[Math.floor(Math.random() * DIAMOND_LOCATIONS.length)];
  
  // Create shape abbreviation
  const shapeAbbrev = {
    "Round": "RD", "Oval": "OV", "Cushion": "CU", "Princess": "PR", "Emerald": "EM",
    "Asscher": "AS", "Pear": "PE", "Marquise": "MQ", "Radiant": "RA", "Heart": "HT"
  }[shape] || shape.substring(0, 2).toUpperCase();
  
  // Create color abbreviation
  const colorAbbrev = fancyColor.display.split(' ').map(word => 
    word === 'Fancy' ? 'F' : 
    word === 'Light' ? 'L' : 
    word === 'Intense' ? 'I' : 
    word === 'Vivid' ? 'V' : 
    word === 'Very' ? '' : 
    word.substring(0, 1)
  ).join('');
  
  // Generate SKU: HPHT-CU-FVP-VS1-000027
  const sku = `${category.prefix}-${shapeAbbrev}-${colorAbbrev}-${clarity}-${String(id).padStart(6, '0')}`;
  
  return {
    id,
    sku,
    category: category.name,
    shape,
    color: fancyColor.display,
    colorHue: fancyColor.hue,
    colorIntensity: fancyColor.intensity,
    clarity,
    carat,
    cut,
    polish,
    symmetry,
    length,
    width,
    height,
    lwRatio,
    depth,
    table,
    certNumber,
    fluorescence,
    location,
    price: basePrice,
    colorPremium: fancyColor.premium
  };
}

async function seedFancyColorDiamonds() {
  console.log("🌈 Starting Fancy Color Lab Diamonds seeding...");
  console.log(`📡 Backend URL: ${BACKEND_URL}`);

  try {
    const medusa = new MedusaAdminAPI(BACKEND_URL);

    // Login
    console.log("🔐 Authenticating with admin credentials...");
    await medusa.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log("✅ Authentication successful!");

    // Get sales channels
    console.log("📺 Fetching sales channels...");
    const salesChannelsResponse = await medusa.listSalesChannels();
    const salesChannels = salesChannelsResponse.sales_channels || [];
    
    if (salesChannels.length === 0) {
      throw new Error("No sales channels found! Please ensure your backend has sales channels configured.");
    }
    
    console.log(`✅ Found ${salesChannels.length} sales channels`);

    // Get or create Fancy Color Lab Diamonds category
    console.log("🏷️ Setting up Fancy Color Lab Diamonds category...");
    const allCategoriesResponse = await medusa.listAllCategories();
    const allCategories = allCategoriesResponse.product_categories || [];
    
    let fancyColorCategory = allCategories.find(cat => cat.name === "Fancy Color Lab Diamonds");
    
    if (!fancyColorCategory) {
      console.log("🎨 Creating 'Fancy Color Lab Diamonds' category...");
      const categoryResponse = await medusa.createProductCategory({
        name: "Fancy Color Lab Diamonds",
        handle: "fancy-color-lab-diamonds",
        description: "Premium fancy colored lab grown diamonds in various hues and intensities",
        is_active: true,
        is_internal: false
      });
      fancyColorCategory = categoryResponse.product_category;
      console.log("✅ Created Fancy Color Lab Diamonds category");
    } else {
      console.log("✅ Found existing Fancy Color Lab Diamonds category");
    }

    // Get stock locations for inventory
    console.log("🏪 Fetching stock locations...");
    const stockLocationsResponse = await medusa.listStockLocations();
    const stockLocations = stockLocationsResponse.stock_locations || [];
    
    if (stockLocations.length === 0) {
      console.error("❌ No stock locations found! Please ensure your backend has stock locations configured.");
      throw new Error("No stock locations available");
    }
    
    const defaultStockLocation = stockLocations[0];
    console.log(`✅ Using stock location: ${defaultStockLocation.name}`);

    // Generate and create fancy color diamond products
    console.log("🎨 Generating fancy color diamond products...");
    const numProducts = 15; // Start with 15 fancy color diamonds
    let createdCount = 0;
    let skippedCount = 0;

    for (let i = 1; i <= numProducts; i++) {
      const diamond = generateFancyColorDiamond(27 + i); // Start after white diamond IDs
      const productType = "Fancy Color Lab Diamonds";

      try {
        // Create full product title and description
        const fullTitle = `${diamond.carat}ct ${diamond.shape} ${diamond.color} ${diamond.clarity} ${diamond.category}`;
        const shortTitle = `${diamond.carat}ct ${diamond.color.split(' ').pop()} ${diamond.clarity}`;
        
        const description = `
Exquisite ${diamond.carat} carat ${diamond.shape} cut ${diamond.color} lab grown diamond with ${diamond.clarity} clarity.

**Diamond Specifications:**
• Shape: ${diamond.shape}
• Carat Weight: ${diamond.carat}ct  
• Color: ${diamond.color} (${diamond.colorHue} hue, ${diamond.colorIntensity} intensity)
• Clarity: ${diamond.clarity}
• Cut Grade: ${diamond.cut}
• Polish: ${diamond.polish}
• Symmetry: ${diamond.symmetry}

**Measurements:**
• Dimensions: ${diamond.length} × ${diamond.width} × ${diamond.height} mm
• L/W Ratio: ${diamond.lwRatio}
• Depth: ${diamond.depth}%
• Table: ${diamond.table}%

**Certificate & Provenance:**
• Lab Type: ${diamond.category} Lab Grown
• Certificate: ${diamond.certNumber}
• Fluorescence: ${diamond.fluorescence}
• Source: ${diamond.location}

**About Fancy Color Lab Diamonds:**
Fancy colored lab diamonds are among the most sought-after gemstones, offering vibrant colors that are rare in nature. ${diamond.color} diamonds are particularly prized for their ${diamond.colorIntensity.toLowerCase()} color saturation. Lab grown fancy colors offer exceptional value compared to their natural counterparts while maintaining the same physical and optical properties.

This ${diamond.category} lab grown diamond represents cutting-edge technology and sustainable luxury, perfect for creating a truly unique and meaningful piece of jewelry.
        `.trim();

        // Create handle
        const colorHandle = diamond.color.toLowerCase().replace(/\s+/g, '-');
        const handle = `diamond-${diamond.category.toLowerCase()}-${diamond.shape.toLowerCase()}-${colorHandle}-${String(diamond.id).padStart(6, '0')}`;

        // Generate all variants (Metal Type × Setting combinations)
        const variants = (() => {
          const variants: any[] = [];
          
          METAL_TYPES.forEach(metal => {
            SETTING_TYPES.forEach(setting => {
              const variantPrice = Math.round(diamond.price * metal.multiplier + setting.addition);
              const variantSku = `${diamond.sku}-${metal.abbrev}-${setting.abbrev}`;
              const variantTitle = `${shortTitle} (${metal.name} ${setting.name})`;
              
              variants.push({
                title: variantTitle,
                sku: variantSku,
                manage_inventory: true,
                allow_backorder: false,
                prices: [
                  {
                    currency_code: "usd",
                    amount: variantPrice,
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
        })();

        // Create product payload
        const productData = {
          title: fullTitle,
          subtitle: `Certificate: ${diamond.certNumber}`,
          description,
          handle,
          status: "published",
          weight: null,
          length: null, 
          width: null,
          height: null,
          material: `${diamond.category} Fancy Color Lab Diamond`,
          // category_ids: [fancyColorCategory.id], // Will add categories later  
          sales_channels: [{ id: salesChannels[0].id }],
          options: [
            {
              title: "Metal Type",
              values: METAL_TYPES.map(metal => metal.name)
            },
            {
              title: "Setting", 
              values: SETTING_TYPES.map(setting => setting.name)
            }
          ],
          variants,
          metadata: {
            // Core fancy color attributes
            diamond_type: diamond.category,
            diamond_shape: diamond.shape,
            diamond_color: diamond.color,
            diamond_color_hue: diamond.colorHue,
            diamond_color_intensity: diamond.colorIntensity,
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
            color_premium_multiplier: diamond.colorPremium.toString(),
            
            // Product type and categorization
            product_type: productType,
            diamond_category: diamond.category,
            is_white_diamond: "false",
            is_fancy_color: "true",
            
            // Fancy color specific
            fancy_color_hue: diamond.colorHue,
            fancy_color_intensity: diamond.colorIntensity,
            rarity_level: diamond.colorPremium > 10 ? "Very Rare" : diamond.colorPremium > 5 ? "Rare" : "Uncommon",
            
            // Search helpers
            is_lab_grown: "true",
            search_terms: `${diamond.category} ${diamond.shape} ${diamond.color} ${diamond.clarity} ${diamond.carat}ct ${productType} ${diamond.colorHue}`,
            search_keywords: `fancy color lab diamonds ${diamond.shape.toLowerCase()} ${diamond.colorHue.toLowerCase()} ${diamond.clarity} ${diamond.colorIntensity.toLowerCase()}`,
            
            // Inventory management
            inventory_note: "When ANY variant is purchased, ALL variants should become unavailable (same physical stone)",
            unique_stone_id: diamond.sku
          }
        };

        // Create the product
        const productResponse = await medusa.createProduct(productData);
        const createdProduct = productResponse.product;
        
        // Set inventory for all variants
        for (const variant of createdProduct.variants) {
          if (variant.inventory_items && variant.inventory_items.length > 0) {
            const inventoryItem = variant.inventory_items[0];
            try {
              await medusa.createInventoryLevel(inventoryItem.inventory_item_id, {
                location_id: defaultStockLocation.id,
                stocked_quantity: 1,
              });
            } catch (inventoryError: any) {
              // Inventory level might already exist, continue
              console.log(`⚠️ Inventory for ${variant.sku}: ${inventoryError.message}`);
            }
          }
        }
        
        createdCount++;
        console.log(`✨ Created: "${fullTitle}" (${variants.length} variants)`);
        
        // Delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error: any) {
        skippedCount++;
        console.warn(`⚠️ Could not create diamond ${diamond.sku}:`, error.message);
      }
    }

    console.log("");
    console.log("🎉 Fancy Color Lab Diamonds seeding completed!");
    console.log(`📊 Results: ${createdCount} created, ${skippedCount} skipped`);
    console.log(`💎 Total variants created: ~${createdCount * (METAL_TYPES.length * SETTING_TYPES.length)}`);
    console.log("");
    console.log("🌈 You now have both:");
    console.log("   🤍 White Lab Diamonds (D-K colors)"); 
    console.log("   🎨 Fancy Color Lab Diamonds (Yellow, Pink, Blue, Green, etc.)");
    console.log("");
    console.log(`🌐 Check your admin: ${BACKEND_URL}/app/products`);
    console.log("   → Filter by 'Fancy Color Lab Diamonds' category");
    console.log("   → See the premium pricing for rare colors");
    console.log("   → Notice the enhanced color metadata");

  } catch (error: any) {
    console.error("❌ Fancy color diamond seeding failed:", error.message);
    throw error;
  }
}

seedFancyColorDiamonds().catch((error) => {
  console.error("Fancy color seeding script failed:", error.message);
});
