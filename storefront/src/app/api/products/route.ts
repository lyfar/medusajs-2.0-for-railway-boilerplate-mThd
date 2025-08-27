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

    const {
      response: { products, count }
    } = await getProductsList({
      pageParam,
      queryParams: {
        limit: 100, // Always fetch all diamonds
        fields: "+metadata,*variants.calculated_price,+type.value"
      },
      countryCode: region
    })
    const list: Product[] = (products as unknown as Product[]) || []
    const allTransformed = list.map(transformProductToDiamond).filter(Boolean)

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
        count: count || 0,
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
