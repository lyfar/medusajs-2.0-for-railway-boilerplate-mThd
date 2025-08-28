import { Product, DiamondResult } from "./types"

export function transformProductToDiamond(product: Product): DiamondResult | null {
  const m: any = product.metadata || {}

  // Support new simplified metadata first; fallback to legacy keys if present
  const shape = m.shape || m.diamond_shape
  const caratStr = m.carat_weight || m.diamond_carat
  const clarity = m.clarity || m.diamond_clarity
  const cut = m.cut_grade || m.diamond_cut
  const labCert = m.lab_certificate || m.certificate_lab || m.diamond_type // fallback naming
  const certificate = m.certificate_number || m.certificate || ""

  // White: color_grade; Fancy: fancy_color (optionally include color_intensity)
  const color = (m.color_grade || (m.fancy_color && (m.color_intensity ? `${m.fancy_color}` : m.fancy_color)) || m.diamond_color)

  if (!shape || !caratStr || !color || !clarity || !cut) {
    return null
  }

  const carat = parseFloat(String(caratStr))

  // Use backend-provided pricing units as-is: prefer calculated_price, fallback to prices[0].amount
  const prices = product.variants.map((v: any) => {
    const calc = v?.calculated_price?.calculated_amount
    if (typeof calc === 'number' && calc > 0) return calc
    const base = Array.isArray(v?.prices) ? v.prices[0]?.amount : undefined
    return typeof base === 'number' && base > 0 ? base : 0
  })
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0

  return {
    id: product.id,
    shape,
    carat,
    color,
    clarity,
    // New metadata already stores readable values (Excellent, Very Good, Good, Fair)
    cut: cut,
    price: lowestPrice,
    sku: product.variants[0]?.title?.split(" ")[0] || product.id,
    handle: product.handle,
    certificate,
    labType: labCert || "IGI",
    polish: undefined,
    symmetry: undefined,
    fluorescence: undefined,
    productType: product.type?.value || 'White Lab Diamonds',
    isOnSale: false,
  }
}

export function applyFilters(diamonds: DiamondResult[], filters: any, selectedType: 'white' | 'fancy', searchQuery: string): DiamondResult[] {
  // Prefer type-filtered list, but if none match, show all so the table is not empty
  const byType = diamonds.filter((d) => selectedType === 'white' ? d.productType === 'White Lab Diamonds' : d.productType === 'Fancy Color Lab Diamonds')
  let filteredDiamonds = byType.length > 0 ? byType : diamonds

  // Apply additional filters if provided
  if (filters) {
    filteredDiamonds = filteredDiamonds.filter(diamond => {
      // Shape filter
      if (filters.selectedShapes && filters.selectedShapes.length > 0) {
        if (!filters.selectedShapes.includes(diamond.shape)) {
          return false
        }
      }

      // Color filters
      // Generic color filter used by NewDiamondFilters
      if (Array.isArray(filters.selectedColors) && filters.selectedColors.length > 0) {
        if (!filters.selectedColors.includes(diamond.color)) return false
      }
      // Backward compatibility with per-type keys
      if (selectedType === 'white' && Array.isArray(filters.selectedWhiteColors) && filters.selectedWhiteColors.length > 0) {
        if (!filters.selectedWhiteColors.includes(diamond.color)) return false
      }
      if (selectedType === 'fancy' && Array.isArray(filters.selectedFancyColors) && filters.selectedFancyColors.length > 0) {
        if (!filters.selectedFancyColors.includes(diamond.color)) return false
      }

      // Cut grade filter
      if (filters.selectedCuts && filters.selectedCuts.length > 0) {
        if (!filters.selectedCuts.includes(diamond.cut)) {
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

      // Lab (certificate) filter
      if (filters.selectedLabTypes && filters.selectedLabTypes.length > 0) {
        if (!filters.selectedLabTypes.includes(diamond.labType)) {
          return false
        }
      }

      // Advanced filters (when showAdvanced is true)
      if (filters.showAdvanced) {
        if (filters.selectedPolish && filters.selectedPolish.length > 0) {
          if (!diamond.polish || !filters.selectedPolish.includes(diamond.polish)) {
            return false
          }
        }
        if (filters.selectedSymmetry && filters.selectedSymmetry.length > 0) {
          if (!diamond.symmetry || !filters.selectedSymmetry.includes(diamond.symmetry)) {
            return false
          }
        }
        if (filters.selectedFluorescence && filters.selectedFluorescence.length > 0) {
          if (!diamond.fluorescence || !filters.selectedFluorescence.includes(diamond.fluorescence)) {
            return false
          }
        }
      }

      // Common clarity filter
      if (filters.selectedClarities && filters.selectedClarities.length > 0) {
        if (!filters.selectedClarities.includes(diamond.clarity)) {
          return false
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
