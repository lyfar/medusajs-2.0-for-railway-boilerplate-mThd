"use client"

import { Text } from "@medusajs/ui"
import { RangeSlider, DiamondShapeIcon, InfoTooltip } from "./components"
import { FilterProps, SHAPES, CUT_GRADES, LAB_TYPES, CERT_LABS } from "./types"
import { ProductRanges } from "../../hooks/useProductData"

interface CommonFiltersProps extends FilterProps {
  ranges: ProductRanges
}

export const CommonFilters = ({ filters, onFilterChange, ranges }: CommonFiltersProps) => {
  const toggleShape = (shape: string) => {
    const current = filters.selectedShapes || []
    const updated = current.includes(shape) 
      ? current.filter(s => s !== shape)
      : [...current, shape]
    onFilterChange({ ...filters, selectedShapes: updated })
  }

  const toggleCut = (cut: string) => {
    const current = filters.selectedCuts || []
    const updated = current.includes(cut) 
      ? current.filter(c => c !== cut)
      : [...current, cut]
    onFilterChange({ ...filters, selectedCuts: updated })
  }

  const toggleLabType = (labType: string) => {
    const current = filters.selectedLabTypes || []
    const updated = current.includes(labType) 
      ? current.filter(l => l !== labType)
      : [...current, labType]
    onFilterChange({ ...filters, selectedLabTypes: updated })
  }

  const toggleCertLab = (certLab: string) => {
    const current = filters.selectedCertLabs || []
    const updated = current.includes(certLab) 
      ? current.filter(c => c !== certLab)
      : [...current, certLab]
    onFilterChange({ ...filters, selectedCertLabs: updated })
  }

  return (
    <div className="space-y-6">
      {/* Shape Selector */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Text className="font-medium text-sm uppercase tracking-wide">SHAPE</Text>
          <InfoTooltip content="Diamond shape affects price and style. Round diamonds are most popular and expensive, while fancy shapes (oval, cushion, etc.) offer unique beauty at better value." />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {SHAPES.map(shape => (
            <DiamondShapeIcon
              key={shape}
              shape={shape}
              selected={(filters.selectedShapes || []).includes(shape)}
              onClick={() => toggleShape(shape)}
            />
          ))}
        </div>
      </div>

      {/* Cut Grade Selector */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Text className="font-medium text-sm uppercase tracking-wide">CUT</Text>
          <InfoTooltip content="Cut quality determines how well a diamond reflects light. ID=Ideal, EX=Excellent, VG=Very Good, GD=Good. Ideal and Excellent cuts maximize brilliance." />
        </div>
        <div className="flex space-x-3">
          {CUT_GRADES.map(cut => (
            <button
              key={cut}
              onClick={() => toggleCut(cut)}
              className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                (filters.selectedCuts || []).includes(cut)
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-gray-300 hover:border-slate-900 bg-white'
              }`}
            >
              {cut}
            </button>
          ))}
        </div>
      </div>

      {/* Carat Range */}
      <RangeSlider
        label="CARAT"
        min={ranges.caratRange[0]}
        max={ranges.caratRange[1]}
        step={0.01}
        value={filters.caratRange}
        onChange={(newRange) => onFilterChange({ ...filters, caratRange: newRange })}
        format={(val) => val.toFixed(2)}
        info="Carat measures diamond weight (200mg = 1 carat). Larger diamonds are exponentially rarer and more valuable. Popular engagement ring sizes are 0.5-2 carats."
      />

      {/* Price Range */}
      <RangeSlider
        label="PRICE"
        min={ranges.priceRange[0]}
        max={ranges.priceRange[1]}
        step={100}
        value={filters.priceRange}
        onChange={(newRange) => onFilterChange({ ...filters, priceRange: newRange })}
        format={(val) => `$${val.toLocaleString()}`}
        info="Diamond prices vary based on the 4 C's: Carat, Color, Clarity, and Cut. Lab-grown diamonds offer 20-40% savings compared to natural diamonds."
      />

      {/* Lab Type Selector */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Text className="font-medium text-sm uppercase tracking-wide">LAB TYPE</Text>
          <InfoTooltip content="Growing method: HPHT (High Pressure High Temperature), CVD (Chemical Vapor Deposition), or Natural. HPHT often produces better fancy colors." />
        </div>
        <div className="flex space-x-3">
          {LAB_TYPES.map(labType => (
            <button
              key={labType}
              onClick={() => toggleLabType(labType)}
              className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                (filters.selectedLabTypes || []).includes(labType)
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-gray-300 hover:border-slate-900 bg-white'
              }`}
            >
              {labType}
            </button>
          ))}
        </div>
      </div>

      {/* Certification Lab Selector */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Text className="font-medium text-sm uppercase tracking-wide">CERTIFICATE</Text>
          <InfoTooltip content="Laboratory certification ensures diamond quality and authenticity. IGI and GIA are the most trusted labs. GCAL provides detailed light performance reports." />
        </div>
        <div className="flex space-x-3">
          {CERT_LABS.map(certLab => (
            <button
              key={certLab}
              onClick={() => toggleCertLab(certLab)}
              className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                (filters.selectedCertLabs || []).includes(certLab)
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-gray-300 hover:border-slate-900 bg-white'
              }`}
            >
              {certLab}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
