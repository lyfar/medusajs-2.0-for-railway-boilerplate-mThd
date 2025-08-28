"use client"

import { useState, useEffect } from "react"
import { DiamondResult } from "../components/diamond-products-table/types"

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
        const response = await fetch(`/api/products?region=${countryCode}&limit=100`, { cache: 'no-store' })

        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }

        const data = await response.json()
        if (process.env.NODE_ENV === 'development') {
          // quick debug
          console.log('Diamonds payload:', data)
        }
        const validDiamonds: DiamondResult[] = data.diamonds || []
        setAllDiamonds(validDiamonds)
        if (data.ranges) {
          setRanges(data.ranges)
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
