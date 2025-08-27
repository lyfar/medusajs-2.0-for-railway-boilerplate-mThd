import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows";

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

// Generate random diamond attributes
function generateRandomDiamond(id: number) {
  const shape = DIAMOND_SHAPES[Math.floor(Math.random() * DIAMOND_SHAPES.length)];
  const color = DIAMOND_COLORS[Math.floor(Math.random() * DIAMOND_COLORS.length)];
  const clarity = DIAMOND_CLARITIES[Math.floor(Math.random() * DIAMOND_CLARITIES.length)];
  const cut = DIAMOND_CUTS[Math.floor(Math.random() * DIAMOND_CUTS.length)];
  const lab = DIAMOND_LABS[Math.floor(Math.random() * DIAMOND_LABS.length)];
  
  // Generate carat weight (0.18 to 5.00 for most diamonds)
  const carat = parseFloat((Math.random() * (5.0 - 0.18) + 0.18).toFixed(2));
  
  // Generate price based on carat and attributes (simplified pricing)
  const basePrice = Math.floor(
    carat * 1000 + 
    (DIAMOND_COLORS.length - DIAMOND_COLORS.indexOf(color)) * 200 +
    (DIAMOND_CLARITIES.length - DIAMOND_CLARITIES.indexOf(clarity)) * 300 +
    (DIAMOND_CUTS.length - DIAMOND_CUTS.indexOf(cut)) * 100
  );
  
  // Generate advanced attributes
  const lwRatio = parseFloat((Math.random() * (2.55 - 1.0) + 1.0).toFixed(2));
  const depth = parseFloat((Math.random() * (80 - 50) + 50).toFixed(1));
  const table = parseFloat((Math.random() * (70 - 50) + 50).toFixed(1));
  const length = parseFloat((Math.random() * (15 - 4) + 4).toFixed(2));
  const width = parseFloat((Math.random() * (15 - 4) + 4).toFixed(2));
  const height = parseFloat((Math.random() * (10 - 2) + 2).toFixed(2));
  
  const fluorescence = Math.random() > 0.8 ? ["Faint", "Medium", "Strong"][Math.floor(Math.random() * 3)] : "NONE";
  const polish = ["Good", "Very Good", "Excellent"][Math.floor(Math.random() * 3)];
  const symmetry = ["Good", "Very Good", "Excellent"][Math.floor(Math.random() * 3)];

  return {
    shape,
    color,
    clarity,
    cut,
    carat,
    lab,
    lwRatio,
    depth,
    table,
    length,
    width,
    height,
    fluorescence,
    polish,
    symmetry,
    price: basePrice,
    sku: `LV-${shape.toUpperCase()}${color}${clarity}-${id.toString().padStart(8, '0')}`
  };
}

export default async function seedDiamondData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  
  logger.info("Starting diamond data seeding...");

  // Get default sales channel
  const [defaultSalesChannel] = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel) {
    throw new Error("Default Sales Channel not found. Please run the main seed script first.");
  }

  // Create diamond categories
  logger.info("Creating diamond categories...");
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
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
      ],
    },
  });

  const diamondCategory = categoryResult.find(cat => cat.name === "Lab Grown Diamonds");
  
  // Generate diamond products
  logger.info("Generating diamond products...");
  const numberOfDiamonds = 100; // Generate 100 diamonds
  const diamonds = [];

  for (let i = 1; i <= numberOfDiamonds; i++) {
    const diamond = generateRandomDiamond(i);
    
    diamonds.push({
      title: `${diamond.carat}ct ${diamond.shape} ${diamond.color}-${diamond.clarity} ${diamond.cut} Lab Diamond`,
      category_ids: [diamondCategory!.id],
      description: `Certified ${diamond.lab} lab-grown diamond. ${diamond.shape} cut with ${diamond.color} color and ${diamond.clarity} clarity. Features ${diamond.cut} cut quality with excellent specifications.`,
      handle: `diamond-${diamond.sku.toLowerCase()}`,
      weight: Math.floor(diamond.carat * 100), // Weight in centigrams
      status: ProductStatus.PUBLISHED,
      images: [
        {
          url: `https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80`, // Generic diamond image
        }
      ],
      options: [
        {
          title: "Shape",
          values: [diamond.shape],
        },
        {
          title: "Color",
          values: [diamond.color],
        },
        {
          title: "Clarity", 
          values: [diamond.clarity],
        },
        {
          title: "Cut",
          values: [diamond.cut],
        },
        {
          title: "Carat",
          values: [diamond.carat.toString()],
        },
        {
          title: "Lab",
          values: [diamond.lab],
        },
        {
          title: "Metal Type",
          values: METAL_TYPES,
        },
        {
          title: "Setting",
          values: SETTING_TYPES,
        }
      ],
      variants: [
        // Base diamond (loose stone)
        {
          title: `${diamond.carat}ct ${diamond.shape} (Loose Diamond)`,
          sku: diamond.sku,
          options: {
            Shape: diamond.shape,
            Color: diamond.color,
            Clarity: diamond.clarity,
            Cut: diamond.cut,
            Carat: diamond.carat.toString(),
            Lab: diamond.lab,
            "Metal Type": "None",
            Setting: "Loose Diamond"
          },
          prices: [
            {
              amount: diamond.price,
              currency_code: "usd",
            },
            {
              amount: Math.floor(diamond.price * 0.85), // EUR conversion
              currency_code: "eur",
            },
          ],
        },
        // Add setting variants
        ...SETTING_TYPES.slice(0, 3).flatMap(setting => // Limit to 3 settings to avoid too many variants
          METAL_TYPES.map(metal => ({
            title: `${diamond.carat}ct ${diamond.shape} ${setting} (${metal})`,
            sku: `${diamond.sku}-${setting.replace(/\s+/g, '').toUpperCase()}-${metal}`,
            options: {
              Shape: diamond.shape,
              Color: diamond.color,
              Clarity: diamond.clarity,
              Cut: diamond.cut,
              Carat: diamond.carat.toString(),
              Lab: diamond.lab,
              "Metal Type": metal,
              Setting: setting
            },
            prices: [
              {
                amount: diamond.price + (metal === "Platinum" ? 1200 : metal === "18K" ? 800 : 600),
                currency_code: "usd",
              },
              {
                amount: Math.floor((diamond.price + (metal === "Platinum" ? 1200 : metal === "18K" ? 800 : 600)) * 0.85),
                currency_code: "eur",
              },
            ],
          }))
        )
      ],
      sales_channels: [
        {
          id: defaultSalesChannel.id,
        },
      ],
      // Store advanced diamond attributes as metadata
      metadata: {
        diamond_shape: diamond.shape,
        diamond_color: diamond.color,
        diamond_clarity: diamond.clarity,
        diamond_cut: diamond.cut,
        diamond_carat: diamond.carat.toString(),
        diamond_lab: diamond.lab,
        lw_ratio: diamond.lwRatio.toString(),
        depth: diamond.depth.toString(),
        table: diamond.table.toString(),
        length: diamond.length.toString(),
        width: diamond.width.toString(),
        height: diamond.height.toString(),
        fluorescence: diamond.fluorescence,
        polish: diamond.polish,
        symmetry: diamond.symmetry,
        certificate_number: `${diamond.lab}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        is_lab_grown: "true"
      }
    });
  }

  // Create products in batches to avoid overwhelming the system
  const batchSize = 10;
  for (let i = 0; i < diamonds.length; i += batchSize) {
    const batch = diamonds.slice(i, i + batchSize);
    logger.info(`Creating diamond batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(diamonds.length / batchSize)}`);
    
    await createProductsWorkflow(container).run({
      input: {
        products: batch,
      },
    });
  }

  logger.info("Finished creating diamond products.");

  // Set inventory levels for all diamonds
  logger.info("Setting diamond inventory levels...");
  
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
  });

  // Get stock locations
  const { data: stockLocations } = await query.graph({
    entity: "stock_location", 
    fields: ["id", "name"],
  });

  if (stockLocations.length === 0) {
    logger.warn("No stock locations found. Please run the main seed script first.");
    return;
  }

  const stockLocation = stockLocations[0];
  
  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    // Each diamond is unique, so set quantity to 1
    const inventoryLevel = {
      location_id: stockLocation.id,
      stocked_quantity: 1,
      inventory_item_id: inventoryItem.id,
    };
    inventoryLevels.push(inventoryLevel);
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryLevels,
    },
  });

  logger.info(`Successfully seeded ${numberOfDiamonds} diamonds with their variants and inventory.`);
}
