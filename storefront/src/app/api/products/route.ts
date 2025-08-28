import { NextRequest, NextResponse } from "next/server"
import { getProductsList } from "@lib/data/products"
import { transformProductToDiamond } from "@modules/store/components/diamond-products-table/utils"
import type { Product } from "@modules/store/components/diamond-products-table/types"

export const revalidate = 300

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const region = searchParams.get('region') || 'us'
  const limit = parseInt(searchParams.get('limit') || '100')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const pageParam = Math.floor(offset / limit) + 1

    // Prefer Store SDK (requires publishable key). If it returns empty, fallback to Admin API for dev.
    let list: Product[] = []
    let count = 0
    try {
      const storeRes = await getProductsList({
        pageParam,
        queryParams: {
          limit: 100,
          fields: "+metadata,*variants.calculated_price,*variants.prices,+type.value",
        },
        countryCode: region,
      })
      list = (storeRes.response.products as unknown as Product[]) || []
      count = storeRes.response.count || 0
    } catch {
      // ignore; will try admin
    }

    if (!list.length) {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
      const adminEmail = process.env.MEDUSA_ADMIN_EMAIL || "admin@yourmail.com"
      const adminPassword = process.env.MEDUSA_ADMIN_PASSWORD || "bnmugz7hs4gsk65l0566eos2s4kxmeho"

      // Login to Admin and fetch products directly
      const loginRes = await fetch(`${backendUrl}/auth/user/emailpass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
        cache: 'no-store',
      })
      if (loginRes.ok) {
        const { token } = await loginRes.json() as any
        const adminRes = await fetch(`${backendUrl}/admin/products?limit=100&currency_code=usd&fields=id,title,handle,metadata,type.value,type.id,*variants.calculated_price,*variants.prices`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })
        if (adminRes.ok) {
          const adminJson = await adminRes.json()
          list = (adminJson.products as Product[]) || []
          count = adminJson.count || list.length || 0
        }
      }
    }

    const allTransformed = (list || []).map(transformProductToDiamond).filter(Boolean) as any[]

    // Calculate ranges once on the server to reduce client work
    let caratMin = 0.1, caratMax = 0, priceMin = 0, priceMax = 0
    if (allTransformed.length > 0) {
      const carats = allTransformed.map((d: any) => d.carat).filter((c: number) => c > 0)
      const prices = allTransformed.map((d: any) => d.price).filter((p: number) => p > 0)
      caratMin = Math.floor(Math.min(...carats) * 100) / 100
      caratMax = Math.ceil(Math.max(...carats) * 100) / 100
      priceMin = Math.floor(Math.min(...prices))
      priceMax = Math.ceil(Math.max(...prices))
    }

    const res = NextResponse.json(
      {
        diamonds: allTransformed,
        ranges: {
          caratRange: [caratMin || 0.1, caratMax || 5.0],
          priceRange: [priceMin || 100, priceMax || 50000]
        },
        count: count || allTransformed.length || 0,
        offset,
        limit
      },
      { status: 200 }
    )
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60")
    return res

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products', diamonds: [], ranges: { caratRange: [0.1, 5.0], priceRange: [100, 50000] }, count: 0 },
      { status: 500 }
    )
  }
}
