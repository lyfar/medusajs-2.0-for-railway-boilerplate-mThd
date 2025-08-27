"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { Text, Button } from "@medusajs/ui"
import { ChevronDown } from "@medusajs/icons"
import { WhiteFilters } from "./WhiteFilters"
import { FancyFilters } from "./FancyFilters"
import { CommonFilters } from "./CommonFilters"
import { AdvancedFilters } from "./AdvancedFilters"
import { DiamondFilters as DiamondFiltersType } from "./types"
import { useProductData } from "../../hooks/useProductData"

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface DiamondFiltersProps {
  onFiltersChange?: (filters: DiamondFiltersType) => void
}

export const DiamondFilters = ({ onFiltersChange }: DiamondFiltersProps) => {
  const { ranges, loading } = useProductData()
  
  const defaultFilters = useMemo<DiamondFiltersType>(() => ({
    selectedType: 'white',
    selectedShapes: [],
    selectedWhiteColors: [],
    selectedClarities: [],
    selectedFancyColors: [],
    selectedCuts: [],
    caratRange: ranges.caratRange,
    priceRange: ranges.priceRange,
    selectedLabTypes: [],
    selectedCertLabs: [],
    showAdvanced: false,
    selectedPolish: [],
    selectedSymmetry: [],
    selectedFluorescence: []
  }), [ranges])

  const [filters, setFilters] = useState<DiamondFiltersType>(defaultFilters)
  
  // Update filters when ranges change
  useEffect(() => {
    setFilters(defaultFilters)
  }, [defaultFilters])
  
  // Debounce filter changes to prevent excessive API calls
  const debouncedFilters = useDebounce(filters, 300)

  // Notify parent of filter changes (debounced)
  useEffect(() => {
    onFiltersChange?.(debouncedFilters)
  }, [debouncedFilters, onFiltersChange])

  const handleFilterChange = useCallback((newFilters: DiamondFiltersType) => {
    setFilters(newFilters)
  }, [])

  const handleTypeChange = useCallback((type: 'white' | 'fancy') => {
    setFilters(prevFilters => ({
      ...prevFilters,
      selectedType: type,
      // Reset type-specific filters when switching
      ...(type === 'white' ? {
        selectedFancyColors: [],
      } : {
        selectedWhiteColors: [],
      })
    }))
  }, [])

  return (
    <div className="bg-white border border-ui-border-base rounded-lg p-6 space-y-6">
      {/* Product Type Selector */}
      <div className="flex space-x-1 bg-ui-bg-subtle rounded-lg p-1">
        <button
          onClick={() => handleTypeChange('white')}
          className={`flex-1 py-2 px-4 rounded-md transition-all ${
            filters.selectedType === 'white' 
              ? 'bg-white text-ui-fg-base shadow-sm' 
              : 'text-ui-fg-subtle hover:text-ui-fg-base'
          }`}
        >
          White Lab Diamonds
        </button>
        <button
          onClick={() => handleTypeChange('fancy')}
          className={`flex-1 py-2 px-4 rounded-md transition-all ${
            filters.selectedType === 'fancy' 
              ? 'bg-white text-ui-fg-base shadow-sm' 
              : 'text-ui-fg-subtle hover:text-ui-fg-base'
          }`}
        >
          Fancy Color Lab Diamonds
        </button>
      </div>

      {/* Common Filters */}
      <CommonFilters filters={filters} onFilterChange={handleFilterChange} ranges={ranges} />

      {/* Type-specific Filters */}
      {filters.selectedType === 'white' ? (
        <WhiteFilters filters={filters} onFilterChange={handleFilterChange} />
      ) : (
        <FancyFilters filters={filters} onFilterChange={handleFilterChange} />
      )}

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => handleFilterChange({ ...filters, showAdvanced: !filters.showAdvanced })}
        className="flex items-center space-x-2 text-ui-fg-base hover:text-ui-fg-subtle transition-colors"
      >
        <Text>Advanced Diamond Filters</Text>
        <ChevronDown className={`transform transition-transform ${filters.showAdvanced ? 'rotate-180' : ''}`} />
      </button>

      {/* Advanced Filters */}
      {filters.showAdvanced && (
        <AdvancedFilters filters={filters} onFilterChange={handleFilterChange} />
      )}
    </div>
  )
}

DiamondFilters.displayName = 'DiamondFilters'
