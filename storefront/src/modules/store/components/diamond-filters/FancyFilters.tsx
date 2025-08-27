"use client"

import { Text } from "@medusajs/ui"
import { InfoTooltip } from "./components"
import { FilterProps, FANCY_COLORS, CLARITIES } from "./types"

export const FancyFilters = ({ filters, onFilterChange }: FilterProps) => {
  const toggleFancyColor = (color: string) => {
    const current = filters.selectedFancyColors || []
    const updated = current.includes(color) 
      ? current.filter(c => c !== color)
      : [...current, color]
    onFilterChange({ ...filters, selectedFancyColors: updated })
  }

  const toggleClarity = (clarity: string) => {
    const current = filters.selectedClarities || []
    const updated = current.includes(clarity) 
      ? current.filter(c => c !== clarity)
      : [...current, clarity]
    onFilterChange({ ...filters, selectedClarities: updated })
  }

  return (
    <div className="space-y-6">
      {/* Visual Indicator for Fancy Filters */}
      <div className="bg-gradient-to-r from-pink-100 to-blue-100 border-l-4 border-pink-500 p-4 rounded-lg">
        <Text className="font-semibold text-pink-700">🌈 FANCY COLOR DIAMONDS - Premium Colored Stones</Text>
        <Text className="text-sm text-gray-600 mt-1">Currently viewing {FANCY_COLORS.length} fancy color options</Text>
      </div>
      
      {/* Fancy Colors */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Text className="font-medium text-sm uppercase tracking-wide">FANCY COLOR</Text>
          <InfoTooltip content="Fancy colored diamonds like pink, blue, yellow, and green. Each color with different intensities (Light, Fancy, Intense, Vivid). Pink and blue are most rare." />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {FANCY_COLORS.map(color => (
            <button
              key={color}
              onClick={() => toggleFancyColor(color)}
              className={`px-3 py-2 text-sm border rounded-lg font-medium transition-all ${
                (filters.selectedFancyColors || []).includes(color)
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-gray-300 hover:border-slate-900 bg-white'
              }`}
            >
              {color.replace('Fancy ', '')}
            </button>
          ))}
        </div>
      </div>
      
      {/* Clarity for Fancy Diamonds */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Text className="font-medium text-sm uppercase tracking-wide">CLARITY</Text>
          <InfoTooltip content="Clarity is less critical for fancy colors than white diamonds, as the color can mask inclusions. Focus on color intensity and beauty." />
        </div>
        <div className="flex flex-wrap gap-2">
          {CLARITIES.map(clarity => (
            <button
              key={clarity}
              onClick={() => toggleClarity(clarity)}
              className={`px-3 py-2 border rounded-lg font-medium transition-all ${
                (filters.selectedClarities || []).includes(clarity)
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-gray-300 hover:border-slate-900 bg-white'
              }`}
            >
              {clarity}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
