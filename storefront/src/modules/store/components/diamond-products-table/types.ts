export interface Product {
  id: string
  title: string
  handle: string
  type?: {
    id: string
    value: string
  }
  variants: {
    id: string
    title: string
    calculated_price?: {
      calculated_amount: number
      currency_code: string
    }
    options: {
      option_id: string
      value: string
    }[]
  }[]
  metadata: {
    diamond_shape?: string
    diamond_carat?: string
    diamond_color?: string
    diamond_clarity?: string
    diamond_cut?: string
    diamond_type?: string // HPHT, CVD, Natural
    diamond_polish?: string
    diamond_symmetry?: string
    fluorescence?: string
    certificate_number?: string
    product_type?: string
    base_price_usd?: string
  }
}

export interface DiamondResult {
  id: string
  shape: string
  carat: number
  color: string
  clarity: string
  cut: string
  price: number
  originalPrice?: number
  sku: string
  handle: string
  certificate: string
  labType: string // HPHT, CVD, Natural
  polish?: string
  symmetry?: string
  fluorescence?: string
  isOnSale?: boolean
  productType: string
}

export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

export interface DiamondProductsTableProps {
  searchQuery?: string
  selectedType?: 'white' | 'fancy'
  filters?: any
}
