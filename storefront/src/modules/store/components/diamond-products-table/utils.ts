import { Product, DiamondResult } from "./types"

export function transformProductToDiamond(product: Product): DiamondResult | null {
  const metadata = product.metadata
  
  if (!metadata || !metadata.diamond_shape || !metadata.diamond_carat || !metadata.diamond_color || 
      !metadata.diamond_clarity || !metadata.diamond_cut) {
    return null
  }

  // Get the lowest priced variant (convert from cents to currency units)
  const prices = product.variants
    .filter(v => v.calculated_price)
    .map(v => {
      const amount = v.calculated_price?.calculated_amount ?? 0
      return amount > 10000 ? amount / 100 : amount // handle both cents and already-unit cases
    })
  
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0

  const result = {
    id: product.id,
    shape: metadata.diamond_shape,
    carat: parseFloat(metadata.diamond_carat),
    color: metadata.diamond_color,
    clarity: metadata.diamond_clarity,
    cut: metadata.diamond_cut === 'EX' ? 'Excellent' : 
         metadata.diamond_cut === 'VG' ? 'Very Good' : 
         metadata.diamond_cut === 'ID' ? 'Ideal' : metadata.diamond_cut,
    price: lowestPrice,
    sku: product.variants[0]?.title?.split(' ')[0] || product.id,
    handle: product.handle,
    certificate: metadata.certificate_number || '',
    labType: metadata.diamond_type || 'HPHT',
    polish: metadata.diamond_polish,
    symmetry: metadata.diamond_symmetry,
    fluorescence: metadata.fluorescence,
    productType: product.type?.value || metadata.product_type || 'White Lab Diamonds',
    isOnSale: false
  }



  return result
}

export function applyFilters(diamonds: DiamondResult[], filters: any, selectedType: 'white' | 'fancy', searchQuery: string): DiamondResult[] {
  let filteredDiamonds = diamonds.filter(diamond => {
    // Filter by selected type
    if (selectedType === 'white') {
      return diamond.productType === 'White Lab Diamonds'
    } else {
      return diamond.productType === 'Fancy Color Lab Diamonds'
    }
  })

  // Apply additional filters if provided
  if (filters) {
    filteredDiamonds = filteredDiamonds.filter(diamond => {
      // Shape filter
      if (filters.selectedShapes && filters.selectedShapes.length > 0) {
        if (!filters.selectedShapes.includes(diamond.shape)) {
          return false
        }
      }

      // Cut grade filter (use actual backend values: ID, EX, VG, GD)
      if (filters.selectedCuts && filters.selectedCuts.length > 0) {
        // Map display names back to backend values
        const cutMapping: { [key: string]: string } = {
          'Ideal': 'ID',
          'Excellent': 'EX', 
          'Very Good': 'VG',
          'Good': 'GD'
        }
        const backendCut = cutMapping[diamond.cut] || diamond.cut
        if (!filters.selectedCuts.includes(backendCut)) {
          return false
        }
      }

      // Carat range filter
      if (filters.caratRange) {
        const [minCarat, maxCarat] = filters.caratRange
        if (diamond.carat < minCarat || diamond.carat > maxCarat) return false
      }

      // Price range filter  
      if (filters.priceRange) {
        const [minPrice, maxPrice] = filters.priceRange
        if (diamond.price < minPrice || diamond.price > maxPrice) return false
      }

      // Lab type filter
      if (filters.selectedLabTypes && filters.selectedLabTypes.length > 0) {
        if (!filters.selectedLabTypes.includes(diamond.labType)) {
          return false
        }
      }

      // Advanced filters (when showAdvanced is true)
      if (filters.showAdvanced) {
        // Polish filter
        if (filters.selectedPolish && filters.selectedPolish.length > 0) {
          if (!diamond.polish || !filters.selectedPolish.includes(diamond.polish)) {
            return false
          }
        }

        // Symmetry filter
        if (filters.selectedSymmetry && filters.selectedSymmetry.length > 0) {
          if (!diamond.symmetry || !filters.selectedSymmetry.includes(diamond.symmetry)) {
            return false
          }
        }

        // Fluorescence filter
        if (filters.selectedFluorescence && filters.selectedFluorescence.length > 0) {
          if (!diamond.fluorescence || !filters.selectedFluorescence.includes(diamond.fluorescence)) {
            return false
          }
        }
      }

      // White diamond specific filters
      if (selectedType === 'white') {
        // White color filter (exact matches)
        if (filters.selectedWhiteColors && filters.selectedWhiteColors.length > 0) {
          if (!filters.selectedWhiteColors.includes(diamond.color)) {
            return false
          }
        }

        // Clarity filter (exact matches)
        if (filters.selectedClarities && filters.selectedClarities.length > 0) {
          if (!filters.selectedClarities.includes(diamond.clarity)) {
            return false
          }
        }
      }

      // Fancy diamond specific filters
      if (selectedType === 'fancy') {
        // Fancy colors filter (exact matches with full names)
        if (filters.selectedFancyColors && filters.selectedFancyColors.length > 0) {
          if (!filters.selectedFancyColors.includes(diamond.color)) {
            return false
          }
        }

        // Clarity filter for fancy diamonds too
        if (filters.selectedClarities && filters.selectedClarities.length > 0) {
          if (!filters.selectedClarities.includes(diamond.clarity)) {
            return false
          }
        }
      }

      return true
    })
  }

  // Apply search query filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    filteredDiamonds = filteredDiamonds.filter(diamond =>
      diamond.shape.toLowerCase().includes(query) ||
      diamond.color.toLowerCase().includes(query) ||
      diamond.clarity.toLowerCase().includes(query) ||
      diamond.cut.toLowerCase().includes(query) ||
      diamond.sku.toLowerCase().includes(query) ||
      diamond.certificate.toLowerCase().includes(query)
    )
  }

  return filteredDiamonds
}

export function sortDiamonds(diamonds: DiamondResult[], sortConfig: { key: string; direction: 'asc' | 'desc' } | null): DiamondResult[] {
  if (!sortConfig) return diamonds

  return [...diamonds].sort((a, b) => {
    const { key, direction } = sortConfig
    
    const aValue = a[key as keyof DiamondResult]
    const bValue = b[key as keyof DiamondResult]
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1
    if (aValue > bValue) return direction === 'asc' ? 1 : -1
    return 0
  })
}
