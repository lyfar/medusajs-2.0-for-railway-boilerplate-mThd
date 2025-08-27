"use client"

import { Text } from "@medusajs/ui"
import { InformationCircle } from "@medusajs/icons"

export const InfoTooltip = ({ content }: { content: string }) => (
  <div className="relative group">
    <InformationCircle className="w-4 h-4 text-ui-fg-muted hover:text-ui-fg-base cursor-help" />
    <div className="absolute left-6 top-0 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
      {content}
      <div className="absolute left-0 top-2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900 transform -translate-x-full"></div>
    </div>
  </div>
)

export const RangeSlider = ({ 
  label, 
  min, 
  max, 
  value, 
  onChange, 
  format = (val: number) => val.toString(),
  step = 1,
  info
}: {
  label: string
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  format?: (val: number) => string
  step?: number
  info?: string
}) => {
  const formatValue = (val: number) => format(val)

  const handleLeftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    onChange([newValue, value[1]])
  }

  const handleRightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    onChange([value[0], newValue])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Text className="font-medium text-sm uppercase tracking-wide">{label}</Text>
        {info && <InfoTooltip content={info} />}
      </div>
      <div className="space-y-3">
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1">Min</label>
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={value[0]}
              onChange={(e) => {
                const newVal = parseFloat(e.target.value) || min
                if (newVal <= value[1]) {
                  onChange([newVal, value[1]])
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1">Max</label>
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={value[1]}
              onChange={(e) => {
                const newVal = parseFloat(e.target.value) || max
                if (newVal >= value[0]) {
                  onChange([value[0], newVal])
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
        <div className="text-xs text-gray-500 text-center">
          {formatValue(value[0])} - {formatValue(value[1])}
        </div>
      </div>
    </div>
  )
}

const getShapeIcon = (shape: string) => {
  const iconClass = "w-8 h-8 fill-current stroke-current stroke-1"
  
  switch (shape) {
    case 'Round':
      return (
        <svg viewBox="0 0 32 32" className={iconClass}>
          <circle cx="16" cy="16" r="12" fill="none" />
          <circle cx="16" cy="16" r="8" fill="none" />
          <path d="M16 4 L20 8 L16 12 L12 8 Z" fill="none" />
          <path d="M28 16 L24 20 L20 16 L24 12 Z" fill="none" />
          <path d="M16 28 L12 24 L16 20 L20 24 Z" fill="none" />
          <path d="M4 16 L8 12 L12 16 L8 20 Z" fill="none" />
        </svg>
      )
    case 'Oval':
      return (
        <svg viewBox="0 0 32 32" className={iconClass}>
          <ellipse cx="16" cy="16" rx="8" ry="12" fill="none" />
          <ellipse cx="16" cy="16" rx="5" ry="9" fill="none" />
        </svg>
      )
    case 'Princess':
      return (
        <svg viewBox="0 0 32 32" className={iconClass}>
          <rect x="6" y="6" width="20" height="20" fill="none" />
          <rect x="10" y="10" width="12" height="12" fill="none" />
          <path d="M6 6 L16 16 L26 6" fill="none" />
          <path d="M26 6 L16 16 L26 26" fill="none" />
          <path d="M26 26 L16 16 L6 26" fill="none" />
          <path d="M6 26 L16 16 L6 6" fill="none" />
        </svg>
      )
    case 'Cushion':
      return (
        <svg viewBox="0 0 32 32" className={iconClass}>
          <rect x="6" y="6" width="20" height="20" rx="4" fill="none" />
          <rect x="10" y="10" width="12" height="12" rx="2" fill="none" />
          <path d="M6 10 L16 16 L26 10" fill="none" />
          <path d="M26 10 L16 16 L26 22" fill="none" />
          <path d="M26 22 L16 16 L6 22" fill="none" />
          <path d="M6 22 L16 16 L6 10" fill="none" />
        </svg>
      )
    case 'Emerald':
      return (
        <svg viewBox="0 0 32 32" className={iconClass}>
          <path d="M8 6 L24 6 L26 10 L24 26 L8 26 L6 10 Z" fill="none" />
          <path d="M11 10 L21 10 L19 22 L13 22 Z" fill="none" />
          <line x1="8" y1="6" x2="11" y2="10" />
          <line x1="24" y1="6" x2="21" y2="10" />
          <line x1="6" y1="10" x2="26" y2="10" />
        </svg>
      )
    case 'Asscher':
      return (
        <svg viewBox="0 0 32 32" className={iconClass}>
          <path d="M8 8 L24 8 L24 24 L8 24 Z" fill="none" />
          <path d="M12 12 L20 12 L20 20 L12 20 Z" fill="none" />
          <path d="M8 8 L16 16 L24 8" fill="none" />
          <path d="M24 8 L16 16 L24 24" fill="none" />
          <path d="M24 24 L16 16 L8 24" fill="none" />
          <path d="M8 24 L16 16 L8 8" fill="none" />
        </svg>
      )
    case 'Pear':
      return (
        <svg viewBox="0 0 32 32" className={iconClass}>
          <path d="M16 6 L20 10 L22 16 L20 22 L16 26 L12 22 L10 16 L12 10 Z" fill="none" />
          <path d="M16 10 L18 13 L19 16 L18 19 L16 22 L14 19 L13 16 L14 13 Z" fill="none" />
          <circle cx="16" cy="8" r="2" fill="none" />
        </svg>
      )
    case 'Marquise':
      return (
        <svg viewBox="0 0 32 32" className={iconClass}>
          <path d="M16 4 L24 16 L16 28 L8 16 Z" fill="none" />
          <path d="M16 8 L20 16 L16 24 L12 16 Z" fill="none" />
        </svg>
      )
    case 'Radiant':
      return (
        <svg viewBox="0 0 32 32" className={iconClass}>
          <path d="M8 8 L24 8 L26 10 L24 24 L8 24 L6 10 Z" fill="none" />
          <path d="M11 11 L21 11 L21 21 L11 21 Z" fill="none" />
          <path d="M8 8 L16 16 L24 8" fill="none" />
          <path d="M24 8 L16 16 L24 24" fill="none" />
          <path d="M24 24 L16 16 L8 24" fill="none" />
          <path d="M8 24 L16 16 L8 8" fill="none" />
        </svg>
      )
    case 'Heart':
      return (
        <svg viewBox="0 0 32 32" className={iconClass}>
          <path d="M16 26 C16 26 6 18 6 12 C6 8 9 6 12 6 C14 6 16 8 16 8 C16 8 18 6 20 6 C23 6 26 8 26 12 C26 18 16 26 16 26 Z" fill="none" />
          <circle cx="11" cy="11" r="2" fill="none" />
          <circle cx="21" cy="11" r="2" fill="none" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 32 32" className={iconClass}>
          <circle cx="16" cy="16" r="12" fill="none" />
        </svg>
      )
  }
}

export const DiamondShapeIcon = ({ shape, selected, onClick }: { 
  shape: string; 
  selected: boolean; 
  onClick: () => void; 
}) => (
  <button
    onClick={onClick}
    className={`p-4 border-2 rounded-lg transition-all text-center min-h-[100px] ${
      selected 
        ? 'border-blue-500 bg-blue-100 text-blue-800' 
        : 'border-gray-300 hover:border-blue-400 text-gray-800 hover:text-blue-700 bg-white hover:bg-gray-50'
    }`}
    title={shape}
  >
    <div className="w-8 h-8 mx-auto flex items-center justify-center mb-3">
      <div className={`w-6 h-6 border-2 ${selected ? 'border-blue-600' : 'border-current'} rounded`}>
        {/* Simple shapes */}
        {shape === 'Round' && <div className="w-full h-full rounded-full border border-current"></div>}
        {shape === 'Oval' && <div className="w-full h-full rounded-full border border-current transform scale-y-125"></div>}
        {shape === 'Princess' && <div className="w-full h-full border border-current"></div>}
        {shape === 'Cushion' && <div className="w-full h-full border border-current rounded-lg"></div>}
        {shape === 'Emerald' && <div className="w-full h-3/4 border border-current mx-auto mt-1"></div>}
        {shape === 'Asscher' && <div className="w-full h-full border border-current transform rotate-45"></div>}
        {shape === 'Pear' && <div className="w-full h-full border border-current rounded-full rounded-t-none"></div>}
        {shape === 'Marquise' && <div className="w-2 h-full border border-current rounded-full mx-auto"></div>}
        {shape === 'Radiant' && <div className="w-full h-full border border-current transform rotate-45"></div>}
        {shape === 'Heart' && <div className="w-full h-full border border-current rounded-t-full"></div>}
      </div>
    </div>
    <div className="text-sm font-semibold text-current">{shape}</div>
  </button>
)
