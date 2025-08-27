"use client"

import { useState, useEffect } from "react"
import { transformProductToDiamond } from "../components/diamond-products-table/utils"
import { DiamondResult, Product } from "../components/diamond-products-table/types"

export interface ProductRanges {
  caratRange: [number, number]
  priceRange: [number, number]
}

export const useProductData = () => {
  const [allDiamonds, setAllDiamonds] = useState<DiamondResult[]>([])
  const [loading, setLoading] = useState(true)
  const [ranges, setRanges] = useState<ProductRanges>({
    caratRange: [0.1, 5.0],
    priceRange: [100, 50000]
  })

  useEffect(() => {
    const fetchDiamonds = async () => {
      setLoading(true)
      try {
        const countryCode = 'dk'
        const response = await fetch(`/api/products?region=${countryCode}&limit=100`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        
        const data = await response.json()
        const products: Product[] = data.products || []
        
        // Transform all products to diamonds
        const allTransformed = products.map(transformProductToDiamond)
        const validDiamonds = allTransformed.filter((diamond): diamond is DiamondResult => diamond !== null)
        
        setAllDiamonds(validDiamonds)

        // Calculate actual ranges from the data
        if (validDiamonds.length > 0) {
          const carats = validDiamonds.map(d => d.carat).filter(c => c > 0)
          const prices = validDiamonds.map(d => d.price).filter(p => p > 0)
          
          const minCarat = Math.min(...carats)
          const maxCarat = Math.max(...carats)
          const minPrice = Math.min(...prices)
          const maxPrice = Math.max(...prices)
          
          setRanges({
            caratRange: [Math.floor(minCarat * 100) / 100, Math.ceil(maxCarat * 100) / 100],
            priceRange: [Math.floor(minPrice), Math.ceil(maxPrice)]
          })
        }
      } catch (error) {
        console.error('❌ Error fetching diamonds:', error)
        setAllDiamonds([])
      } finally {
        setLoading(false)
      }
    }

    fetchDiamonds()
  }, [])

  return { allDiamonds, loading, ranges }
}
