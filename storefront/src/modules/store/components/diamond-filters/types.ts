export interface DiamondFilters {
  selectedType: 'white' | 'fancy'
  selectedShapes: string[]
  
  // White diamond filters (use actual values, not ranges)
  selectedWhiteColors: string[]
  selectedClarities: string[]
  
  // Fancy diamond filters (use actual backend color names)
  selectedFancyColors: string[]
  
  // Common filters
  selectedCuts: string[]
  caratRange: [number, number]
  priceRange: [number, number]
  selectedLabTypes: string[]
  selectedCertLabs: string[]
  
  // Advanced filters
  showAdvanced: boolean
  selectedPolish: string[]
  selectedSymmetry: string[]
  selectedFluorescence: string[]
}

export interface FilterProps {
  filters: DiamondFilters
  onFilterChange: (filters: DiamondFilters) => void
}

// Filter options based on actual backend data structure
export const SHAPES = ['Round', 'Oval', 'Cushion', 'Princess', 'Emerald', 'Asscher', 'Pear', 'Marquise', 'Radiant', 'Heart']

// White diamond colors (D-K scale, best to worst)
export const WHITE_COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']

// Fancy colors from backend (exact names as they appear in diamond_color field)
export const FANCY_COLORS = [
  'Fancy Green', 'Fancy Light Pink', 'Fancy Pink', 'Fancy Intense Pink',
  'Fancy Light Yellow', 'Fancy Yellow', 'Fancy Intense Yellow', 
  'Fancy Light Blue', 'Fancy Blue', 'Fancy Intense Blue',
  'Fancy Orange', 'Fancy Purple', 'Fancy Red', 'Fancy Brown'
]

// Clarity grades (best to worst)
export const CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2']

// Cut grades from backend (diamond_cut field)
export const CUT_GRADES = ['ID', 'EX', 'VG', 'GD']

// Lab growing types from backend (diamond_type field)
export const LAB_TYPES = ['HPHT', 'CVD', 'Natural']

// Certificate labs (backend uses IGI, GIA, GCAL)
export const CERT_LABS = ['IGI', 'GIA', 'GCAL']

// Advanced filter options (polish, symmetry, fluorescence)
export const POLISH_GRADES = ['EX', 'VG', 'GD']
export const SYMMETRY_GRADES = ['EX', 'VG', 'GD']
export const FLUORESCENCE_LEVELS = ['NONE', 'Faint', 'Medium', 'Strong']
