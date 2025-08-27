"use client"

import { Text } from "@medusajs/ui"
import { FilterProps, WHITE_COLORS, CLARITIES } from "./types"
import { InfoTooltip } from "./components"

export const WhiteFilters = ({ filters, onFilterChange }: FilterProps) => {
  const handleColorToggle = (color: string) => {
    const currentColors = filters.selectedWhiteColors || []
    const newColors = currentColors.includes(color)
      ? currentColors.filter(c => c !== color)
      : [...currentColors, color]
    
    onFilterChange({ ...filters, selectedWhiteColors: newColors })
  }

  const handleClarityToggle = (clarity: string) => {
    const currentClarities = filters.selectedClarities || []
    const newClarities = currentClarities.includes(clarity)
      ? currentClarities.filter(c => c !== clarity)
      : [...currentClarities, clarity]
    
    onFilterChange({ ...filters, selectedClarities: newClarities })
  }

  return (
    <div className="space-y-6">
      {/* Visual Indicator for White Filters */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <Text className="font-semibold text-blue-700">💎 WHITE LAB DIAMONDS - Classic Colorless Stones</Text>
        <Text className="text-sm text-gray-600 mt-1">Currently viewing {WHITE_COLORS.length} color grades D-K</Text>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <p className="font-sans txt-medium font-medium text-sm uppercase tracking-wide">COLOR</p>
          <InfoTooltip content="Color grades from D (colorless) to K (faint yellow). D-F are colorless, G-J near-colorless. Lower grades offer better value with minimal visible difference." />
        </div>
        <div className="flex flex-wrap gap-2">
          {WHITE_COLORS.map(color => (
            <button
              key={color}
              onClick={() => handleColorToggle(color)}
              className={`px-3 py-2 border rounded-lg font-medium transition-all ${
                (filters.selectedWhiteColors || []).includes(color)
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-gray-300 hover:border-slate-900 bg-white'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <p className="font-sans txt-medium font-medium text-sm uppercase tracking-wide">CLARITY</p>
          <InfoTooltip content="Clarity measures internal and external flaws. FL (Flawless) is perfect, while SI1-SI2 (Slightly Included) offers good value with flaws invisible to naked eye." />
        </div>
        <div className="flex flex-wrap gap-2">
          {CLARITIES.map(clarity => (
            <button
              key={clarity}
              onClick={() => handleClarityToggle(clarity)}
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
