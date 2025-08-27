# 🚀 Seed Diamonds to Production Railway Backend

## Quick Setup & Run

### 1. Install Dependencies
```bash
cd backend
pnpm install
```

### 2. Run Production Seeding
```bash
pnpm run seed:diamonds:remote
```

This will:
- ✅ Connect to your Railway production backend
- ✅ Authenticate using admin credentials  
- ✅ Create diamond categories
- ✅ Generate 50 unique lab-grown diamonds
- ✅ Create ~150 product variants (with settings)
- ✅ Set proper inventory levels

## What Gets Created

### 📊 Database Results
- **5 Categories**: Lab Grown Diamonds, Engagement Rings, Wedding Rings, Earrings, Pendants
- **50 Unique Diamonds** with realistic attributes
- **~150 Product Variants** (loose diamonds + settings)
- **Complete Metadata** for advanced filtering

### 💎 Diamond Specifications
Each diamond includes:
- Shape, Color, Clarity, Cut, Carat Weight
- Lab Certification (IGI, GIA, GCAL)
- Advanced specs: L/W Ratio, Depth, Table, etc.
- Unique SKUs: `LV-ROUNDDVS1-00000001`

### 🛍️ Product Variants
For each diamond:
1. **Loose Diamond** (base price)
2. **Solitaire Ring (14K)** (+$600)
3. **Halo Ring (14K)** (+$600)

## Configuration

The script uses these production settings:
```typescript
BACKEND_URL = "https://backend-production-c68b.up.railway.app"
ADMIN_EMAIL = "admin@yourmail.com"
ADMIN_PASSWORD = "bnmugz7hs4gsk65l0566eos2s4kxmeho"
```

## Verification

After running, check your results at:
🌐 **Admin Panel**: https://backend-production-c68b.up.railway.app/app/products

Filter by "Lab Grown Diamonds" category to see all your diamonds.

## API Access

Your diamonds will be available via:
- **Store API**: `GET /store/products`
- **Admin API**: `GET /admin/products`
- **With your API Key**: `sk_2d9454be7fe80ebc67c8d0761a9cfe377a5a05541e17ca81a346880e53df70b7`

## Customization

To modify the seeding:
- **Change quantity**: Edit `numberOfDiamonds = 50` in the script
- **Adjust attributes**: Modify the arrays (DIAMOND_SHAPES, DIAMOND_COLORS, etc.)
- **Update pricing**: Change the pricing logic in `generateRandomDiamond()`

## Safety Features

- ✅ **Non-destructive**: Only creates new data, doesn't modify existing
- ✅ **Error handling**: Continues if individual diamonds fail
- ✅ **Rate limiting**: Built-in delays to avoid overwhelming API
- ✅ **Duplicate protection**: Skips existing categories

## Troubleshooting

If seeding fails:
1. **Check internet connection** to Railway
2. **Verify admin credentials** are correct
3. **Ensure backend is running** and accessible
4. **Check API rate limits** (script includes delays)

Run the command again - it will skip existing categories and continue.

## Next Steps

After successful seeding:
1. ✅ Verify diamonds in admin panel
2. ✅ Test API endpoints
3. ✅ Build frontend search functionality
4. ✅ Configure search filters with metadata
5. ✅ Test purchasing flow
