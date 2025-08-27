# Diamond Seeding Guide

## Overview
This seeding system creates realistic lab-grown diamonds with all the proper attributes for a professional diamond ecommerce store.

## What Gets Created

### 🏷️ Categories
- Lab Grown Diamonds
- Engagement Rings  
- Wedding Rings
- Earrings
- Pendants

### 💎 Diamond Attributes
Each diamond includes:

**Core Attributes:**
- **Shape**: Round, Oval, Cushion, Princess, Emerald, Asscher, Pear, Marquise, Radiant, Heart
- **Color**: K, J, I, H, G, F, E, D (industry standard color grades)
- **Clarity**: SI2, SI1, VS2, VS1, VVS2, VVS1, IF, FL
- **Cut**: Fair, Good, Very Good, Excellent, Ideal
- **Carat Weight**: 0.18ct to 5.00ct (realistic range)
- **Lab Certification**: IGI, GIA, GCAL

**Advanced Attributes:**
- L/W Ratio: 1.0 to 2.55
- Depth: 50% to 80%
- Table: 50% to 70%  
- Length: 4mm to 15mm
- Width: 4mm to 15mm
- Height: 2mm to 10mm
- Fluorescence: NONE, Faint, Medium, Strong
- Polish: Good, Very Good, Excellent
- Symmetry: Good, Very Good, Excellent

### 🎯 Product Variants
Each diamond comes with multiple variants:
1. **Loose Diamond** - Base diamond stone
2. **Setting Options**:
   - Solitaire Pendant + Metal Type
   - Solitaire Ring + Metal Type  
   - Halo Ring + Metal Type
3. **Metal Types**: 14K, 18K, Platinum

### 🏷️ SKU Format
Unique SKUs like: `LV-ROUNDDVS1-00000001`
- LV = Lab Grown prefix
- ROUND = Shape
- D = Color
- VS1 = Clarity
- 8-digit ID = Unique identifier

### 💰 Pricing
Dynamic pricing based on:
- Carat weight
- Color grade (D being most expensive)
- Clarity grade (FL being most expensive)
- Cut quality (Ideal being most expensive)
- Setting additions (Platinum +$1200, 18K +$800, 14K +$600)

## How to Run

### Prerequisites
1. Make sure your main MedusaJS seed has been run first:
   ```bash
   cd backend
   pnpm run seed
   ```

### Run Diamond Seeding
```bash
cd backend
pnpm run seed:diamonds
```

This will create **100 unique diamonds** with all their variants (approximately 400+ products total).

## Database Structure

### Product Metadata
Each diamond stores additional data in metadata:
```json
{
  "diamond_shape": "Round",
  "diamond_color": "D", 
  "diamond_clarity": "VS1",
  "diamond_cut": "Ideal",
  "diamond_carat": "1.25",
  "diamond_lab": "GIA",
  "lw_ratio": "1.02",
  "depth": "62.5",
  "table": "57.0",
  "length": "6.85",
  "width": "6.88", 
  "height": "4.30",
  "fluorescence": "NONE",
  "polish": "Excellent",
  "symmetry": "Excellent",
  "certificate_number": "GIA-2347891234",
  "is_lab_grown": "true"
}
```

## Inventory Management
- Each diamond is unique (quantity = 1)
- Variants represent different settings for the same stone
- Inventory tracked per variant

## Search & Filter Integration
The metadata structure supports advanced filtering for:
- Shape, Color, Clarity, Cut filters
- Carat weight ranges
- Price ranges  
- L/W Ratio, Depth, Table dimensions
- Lab certification filtering

## Customization Options
Users can:
1. Select a loose diamond
2. Choose a setting type
3. Select metal type
4. View detailed specifications
5. See certification details

## Next Steps
1. Run the seeding command
2. Check your admin panel to see the products
3. Test the frontend search and filtering
4. Customize the generated data as needed

## Modifying the Seed Data
To adjust the seeding:
- Edit `src/scripts/seed-diamonds.ts`
- Modify the attribute arrays (shapes, colors, etc.)
- Adjust the `numberOfDiamonds` variable
- Customize pricing logic in `generateRandomDiamond()`
