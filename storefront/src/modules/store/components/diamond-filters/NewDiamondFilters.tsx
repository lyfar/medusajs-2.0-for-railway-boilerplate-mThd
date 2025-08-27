"use client"

import { useState, useCallback, useEffect } from "react"
import { Button, Input, Badge, Text, Heading } from "@medusajs/ui"
import { clx } from "@medusajs/ui"
import { useProductData } from "../../hooks/useProductData"

interface FilterState {
  selectedType: 'white' | 'fancy'
  selectedShapes: string[]
  caratRange: [number, number]
  priceRange: [number, number]
  selectedColors: string[]
  selectedClarities: string[]
}

const SHAPES = ['Round', 'Oval', 'Princess', 'Cushion', 'Emerald', 'Asscher', 'Pear', 'Marquise', 'Radiant', 'Heart']
const WHITE_COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']
const FANCY_COLORS = ['Fancy Yellow', 'Fancy Pink', 'Fancy Blue', 'Fancy Green', 'Fancy Orange']
const CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2']

interface NewDiamondFiltersProps {
  onFiltersChange?: (filters: FilterState) => void
}

export const NewDiamondFilters = ({ onFiltersChange }: NewDiamondFiltersProps) => {
  const { ranges, loading } = useProductData()
  
  const [filters, setFilters] = useState<FilterState>({
    selectedType: 'white',
    selectedShapes: [],
    caratRange: ranges.caratRange,
    priceRange: ranges.priceRange,
    selectedColors: [],
    selectedClarities: []
  })

  // Update ranges when data loads
  useEffect(() => {
    setFilters((prev: FilterState) => ({
      ...prev,
      caratRange: ranges.caratRange,
      priceRange: ranges.priceRange
    }))
  }, [ranges])

  // Notify parent of changes
  useEffect(() => {
    onFiltersChange?.(filters)
  }, [filters, onFiltersChange])

  const toggleShape = useCallback((shape: string) => {
    setFilters((prev: FilterState) => ({
      ...prev,
      selectedShapes: prev.selectedShapes.includes(shape)
        ? prev.selectedShapes.filter((s: string) => s !== shape)
        : [...prev.selectedShapes, shape]
    }))
  }, [])

  const toggleColor = useCallback((color: string) => {
    setFilters((prev: FilterState) => ({
      ...prev,
      selectedColors: prev.selectedColors.includes(color)
        ? prev.selectedColors.filter((c: string) => c !== color)
        : [...prev.selectedColors, color]
    }))
  }, [])

  const toggleClarity = useCallback((clarity: string) => {
    setFilters((prev: FilterState) => ({
      ...prev,
      selectedClarities: prev.selectedClarities.includes(clarity)
        ? prev.selectedClarities.filter((c: string) => c !== clarity)
        : [...prev.selectedClarities, clarity]
    }))
  }, [])

  const getShapeIcon = (shape: string) => {
    const shapes: { [key: string]: string } = {
      'Round': '●',
      'Oval': '⬮',
      'Princess': '■',
      'Cushion': '▢', 
      'Emerald': '▭',
      'Asscher': '◊',
      'Pear': '♦',
      'Marquise': '◗',
      'Radiant': '◈',
      'Heart': '♥'
    }
    return shapes[shape] || '●'
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Type Selector */}
      <div className="space-y-3">
        <Heading level="h3" className="text-sm uppercase tracking-wide">TYPE</Heading>
        <div className="flex space-x-2">
          <Button
            variant={filters.selectedType === 'white' ? 'primary' : 'secondary'}
            onClick={() => setFilters((prev: FilterState) => ({ ...prev, selectedType: 'white', selectedColors: [] }))}
            className="flex-1"
          >
            White Diamonds
          </Button>
          <Button
            variant={filters.selectedType === 'fancy' ? 'primary' : 'secondary'}
            onClick={() => setFilters((prev: FilterState) => ({ ...prev, selectedType: 'fancy', selectedColors: [] }))}
            className="flex-1"
          >
            Fancy Colors
          </Button>
        </div>
      </div>

      {/* Shape Selector */}
      <div className="space-y-3">
        <Heading level="h3" className="text-sm uppercase tracking-wide">SHAPE</Heading>
        <div className="grid grid-cols-4 gap-3">
          {SHAPES.map(shape => (
            <Button
              key={shape}
              variant={filters.selectedShapes.includes(shape) ? 'primary' : 'secondary'}
              onClick={() => toggleShape(shape)}
              className="h-20 flex flex-col items-center justify-center p-3 min-w-0"
            >
              <div className="text-xl mb-2 flex items-center justify-center h-6">
                {getShapeIcon(shape)}
              </div>
              <span className="text-xs text-center leading-tight truncate w-full">
                {shape}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Color Selector */}
      <div className="space-y-3">
        <Heading level="h3" className="text-sm uppercase tracking-wide">COLOR</Heading>
        <div className="flex flex-wrap gap-2">
          {(filters.selectedType === 'white' ? WHITE_COLORS : FANCY_COLORS).map(color => (
            <button
              key={color}
              onClick={() => toggleColor(color)}
              className={clx(
                "px-3 py-1 rounded-md text-sm cursor-pointer transition-colors border",
                filters.selectedColors.includes(color)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-400"
              )}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Clarity Selector */}
      <div className="space-y-3">
        <Heading level="h3" className="text-sm uppercase tracking-wide">CLARITY</Heading>
        <div className="flex flex-wrap gap-2">
          {CLARITIES.map(clarity => (
            <button
              key={clarity}
              onClick={() => toggleClarity(clarity)}
              className={clx(
                "px-3 py-1 rounded-md text-sm cursor-pointer transition-colors border",
                filters.selectedClarities.includes(clarity)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-400"
              )}
            >
              {clarity}
            </button>
          ))}
        </div>
      </div>

      {/* Carat Range */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-900">CARAT</h3>
        <div className="space-y-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <Text className="block text-xs text-ui-fg-subtle mb-1">Min</Text>
              <Input
                type="number"
                value={filters.caratRange[0]}
                onChange={(e: any) => {
                  const val = parseFloat(e.target.value) || ranges.caratRange[0]
                  if (val <= filters.caratRange[1]) {
                    setFilters((prev: FilterState) => ({ ...prev, caratRange: [val, prev.caratRange[1]] }))
                  }
                }}
                min={ranges.caratRange[0]}
                max={ranges.caratRange[1]}
                step={0.01}
                className="text-sm"
              />
            </div>
            <div className="flex-1">
              <Text className="block text-xs text-ui-fg-subtle mb-1">Max</Text>
              <Input
                type="number"
                value={filters.caratRange[1]}
                onChange={(e: any) => {
                  const val = parseFloat(e.target.value) || ranges.caratRange[1]
                  if (val >= filters.caratRange[0]) {
                    setFilters((prev: FilterState) => ({ ...prev, caratRange: [prev.caratRange[0], val] }))
                  }
                }}
                min={ranges.caratRange[0]}
                max={ranges.caratRange[1]}
                step={0.01}
                className="text-sm"
              />
            </div>
          </div>
          <Text className="text-xs text-ui-fg-subtle text-center">
            {filters.caratRange[0].toFixed(2)} - {filters.caratRange[1].toFixed(2)} carats
          </Text>
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Heading level="h3" className="text-sm uppercase tracking-wide">PRICE</Heading>
        <div className="space-y-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <Text className="block text-xs text-ui-fg-subtle mb-1">Min</Text>
              <Input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e: any) => {
                  const val = parseFloat(e.target.value) || ranges.priceRange[0]
                  if (val <= filters.priceRange[1]) {
                    setFilters((prev: FilterState) => ({ ...prev, priceRange: [val, prev.priceRange[1]] }))
                  }
                }}
                min={ranges.priceRange[0]}
                max={ranges.priceRange[1]}
                step={100}
                className="text-sm"
              />
            </div>
            <div className="flex-1">
              <Text className="block text-xs text-ui-fg-subtle mb-1">Max</Text>
              <Input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e: any) => {
                  const val = parseFloat(e.target.value) || ranges.priceRange[1]
                  if (val >= filters.priceRange[0]) {
                    setFilters((prev: FilterState) => ({ ...prev, priceRange: [prev.priceRange[0], val] }))
                  }
                }}
                min={ranges.priceRange[0]}
                max={ranges.priceRange[1]}
                step={100}
                className="text-sm"
              />
            </div>
          </div>
          <Text className="text-xs text-ui-fg-subtle text-center">
            ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}
          </Text>
        </div>
      </div>

      {/* Clear Filters */}
      <Button 
        variant="secondary" 
        onClick={() => setFilters({
          selectedType: 'white',
          selectedShapes: [],
          caratRange: ranges.caratRange,
          priceRange: ranges.priceRange,
          selectedColors: [],
          selectedClarities: []
        })}
        className="w-full"
      >
        Clear All Filters
      </Button>
    </div>
  )
}
