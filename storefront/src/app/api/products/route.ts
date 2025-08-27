import { NextRequest, NextResponse } from "next/server"
import { getProductsList } from "@lib/data/products"

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
    
    return NextResponse.json({
      products: products || [],
      count: count || 0,
      offset,
      limit
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products', products: [], count: 0 },
      { status: 500 }
    )
  }
}
