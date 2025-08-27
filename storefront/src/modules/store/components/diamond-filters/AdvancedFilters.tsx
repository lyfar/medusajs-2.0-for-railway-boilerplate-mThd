"use client"

import { Text } from "@medusajs/ui"
import { FilterProps, POLISH_GRADES, SYMMETRY_GRADES, FLUORESCENCE_LEVELS } from "./types"
import { InfoTooltip } from "./components"

export const AdvancedFilters = ({ filters, onFilterChange }: FilterProps) => {
  const togglePolish = (polish: string) => {
    const current = filters.selectedPolish || []
    const updated = current.includes(polish) 
      ? current.filter(p => p !== polish)
      : [...current, polish]
    onFilterChange({ ...filters, selectedPolish: updated })
  }

  const toggleSymmetry = (symmetry: string) => {
    const current = filters.selectedSymmetry || []
    const updated = current.includes(symmetry) 
      ? current.filter(s => s !== symmetry)
      : [...current, symmetry]
    onFilterChange({ ...filters, selectedSymmetry: updated })
  }

  const toggleFluorescence = (fluorescence: string) => {
    const current = filters.selectedFluorescence || []
    const updated = current.includes(fluorescence) 
      ? current.filter(f => f !== fluorescence)
      : [...current, fluorescence]
    onFilterChange({ ...filters, selectedFluorescence: updated })
  }

  return (
    <div className="space-y-6 border-t pt-6">
      <Text className="text-ui-fg-muted text-sm">
        Advanced filters for professional diamond evaluation
      </Text>
      
      {/* Polish */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Text className="font-medium text-sm uppercase tracking-wide">POLISH</Text>
          <InfoTooltip content="Polish grade indicates how smooth the diamond's surface is. Excellent and Very Good polish maximize light return and sparkle." />
        </div>
        <div className="flex space-x-3">
          {POLISH_GRADES.map(polish => (
            <button
              key={polish}
              onClick={() => togglePolish(polish)}
              className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                (filters.selectedPolish || []).includes(polish)
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-gray-300 hover:border-slate-900 bg-white'
              }`}
            >
              {polish}
            </button>
          ))}
        </div>
      </div>

      {/* Symmetry */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Text className="font-medium text-sm uppercase tracking-wide">SYMMETRY</Text>
          <InfoTooltip content="Symmetry measures how precisely the diamond's facets align. Excellent symmetry creates better light patterns and optical performance." />
        </div>
        <div className="flex space-x-3">
          {SYMMETRY_GRADES.map(symmetry => (
            <button
              key={symmetry}
              onClick={() => toggleSymmetry(symmetry)}
              className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                (filters.selectedSymmetry || []).includes(symmetry)
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-gray-300 hover:border-slate-900 bg-white'
              }`}
            >
              {symmetry}
            </button>
          ))}
        </div>
      </div>

      {/* Fluorescence */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Text className="font-medium text-sm uppercase tracking-wide">FLUORESCENCE</Text>
          <InfoTooltip content="Fluorescence is a diamond's reaction to UV light. None to Faint is preferred for most diamonds. Strong fluorescence may affect appearance in sunlight." />
        </div>
        <div className="flex flex-wrap gap-2">
          {FLUORESCENCE_LEVELS.map(fluorescence => (
            <button
              key={fluorescence}
              onClick={() => toggleFluorescence(fluorescence)}
              className={`px-3 py-2 border rounded-lg font-medium transition-all ${
                (filters.selectedFluorescence || []).includes(fluorescence)
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-gray-300 hover:border-slate-900 bg-white'
              }`}
            >
              {fluorescence}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
