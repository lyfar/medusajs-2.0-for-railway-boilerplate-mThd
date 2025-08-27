"use client"

import { useState } from "react"
import { Text, Button } from "@medusajs/ui"
import { ChevronDown, ChevronUp } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface DiamondResult {
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
  isOnSale?: boolean
}

// Mock data - in real app, this would come from your products API
const mockDiamonds: DiamondResult[] = [
  {
    id: "1",
    shape: "Round",
    carat: 0.21,
    color: "D",
    clarity: "VS1",
    cut: "Ideal",
    price: 51,
    originalPrice: 79,
    sku: "HPHT-RD-D-VS1-000001",
    handle: "diamond-hpht-rd-d-vs1-000001",
    certificate: "LG123456789",
    isOnSale: true
  },
  {
    id: "2", 
    shape: "Round",
    carat: 0.20,
    color: "F",
    clarity: "VS1",
    cut: "Ideal",
    price: 51,
    originalPrice: 79,
    sku: "HPHT-RD-F-VS1-000002",
    handle: "diamond-hpht-rd-f-vs1-000002",
    certificate: "LG123456790",
    isOnSale: true
  },
  {
    id: "3",
    shape: "Round", 
    carat: 0.23,
    color: "D",
    clarity: "VVS2",
    cut: "Excellent",
    price: 58,
    originalPrice: 89,
    sku: "HPHT-RD-D-VVS2-000003",
    handle: "diamond-hpht-rd-d-vvs2-000003",
    certificate: "LG123456791",
    isOnSale: true
  },
  {
    id: "4",
    shape: "Round",
    carat: 0.24,
    color: "D", 
    clarity: "SI1",
    cut: "Ideal",
    price: 58,
    originalPrice: 89,
    sku: "HPHT-RD-D-SI1-000004",
    handle: "diamond-hpht-rd-d-si1-000004",
    certificate: "LG123456792",
    isOnSale: true
  },
  {
    id: "5",
    shape: "Round",
    carat: 0.24,
    color: "D",
    clarity: "SI1", 
    cut: "Excellent",
    price: 58,
    originalPrice: 89,
    sku: "HPHT-RD-D-SI1-000005",
    handle: "diamond-hpht-rd-d-si1-000005",
    certificate: "LG123456793",
    isOnSale: true
  }
]

const DiamondShapeIcon = ({ shape }: { shape: string }) => (
  <div className="w-6 h-6 flex items-center justify-center text-ui-fg-subtle">
    {shape === 'Round' && <div className="w-4 h-4 rounded-full border border-current" />}
    {shape === 'Oval' && <div className="w-3 h-4 rounded-full border border-current" />}
    {shape === 'Cushion' && <div className="w-3 h-3 rounded border border-current" />}
    {shape === 'Princess' && <div className="w-3 h-3 border border-current" />}
    {shape === 'Emerald' && <div className="w-3 h-4 border border-current" />}
    {shape === 'Asscher' && <div className="w-3 h-3 border border-current transform rotate-45" />}
    {shape === 'Pear' && <div className="w-3 h-4 rounded-full rounded-t-none border border-current" />}
    {shape === 'Marquise' && <div className="w-2 h-4 rounded-full border border-current" />}
    {shape === 'Radiant' && <div className="w-3 h-3 border border-current transform rotate-45" />}
    {shape === 'Heart' && <div className="w-3 h-3 border border-current" />}
  </div>
)

const SortableHeader = ({ 
  label, 
  sortKey, 
  currentSort, 
  onSort 
}: { 
  label: string
  sortKey: string
  currentSort: { key: string; direction: 'asc' | 'desc' } | null
  onSort: (key: string) => void
}) => {
  const isActive = currentSort?.key === sortKey
  
  return (
    <button 
      onClick={() => onSort(sortKey)}
      className="flex items-center space-x-1 hover:text-ui-fg-base transition-colors"
    >
      <Text className="font-medium">{label}</Text>
      {isActive ? (
        currentSort?.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
      ) : (
        <ChevronDown size={16} className="opacity-50" />
      )}
    </button>
  )
}

const DiamondResultsTable = ({ searchQuery = "" }: { searchQuery?: string }) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [diamonds] = useState<DiamondResult[]>(mockDiamonds)

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedDiamonds = [...diamonds].sort((a, b) => {
    if (!sortConfig) return 0
    
    const aValue = a[sortConfig.key as keyof DiamondResult]
    const bValue = b[sortConfig.key as keyof DiamondResult]
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  return (
    <div className="space-y-4">
      {/* Search and Results Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="looking"
              defaultValue={searchQuery}
              className="w-64 px-4 py-2 border border-ui-border-base rounded-lg focus:outline-none focus:border-ui-fg-base"
            />
            <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1">
              Search
            </Button>
          </div>
          <Button variant="secondary" className="px-4 py-2">
            How Magic Search Works
          </Button>
        </div>
        <Text className="text-ui-fg-subtle">
          <strong>321,117</strong> lab-grown diamonds found
        </Text>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg border border-ui-border-base overflow-hidden">
        {/* Table Header */}
        <div className="bg-slate-900 text-white px-4 py-3">
          <div className="grid grid-cols-6 gap-4 items-center">
            <SortableHeader 
              label="Shape" 
              sortKey="shape" 
              currentSort={sortConfig} 
              onSort={handleSort} 
            />
            <SortableHeader 
              label="Price" 
              sortKey="price" 
              currentSort={sortConfig} 
              onSort={handleSort} 
            />
            <SortableHeader 
              label="Carat" 
              sortKey="carat" 
              currentSort={sortConfig} 
              onSort={handleSort} 
            />
            <SortableHeader 
              label="Color" 
              sortKey="color" 
              currentSort={sortConfig} 
              onSort={handleSort} 
            />
            <SortableHeader 
              label="Clarity" 
              sortKey="clarity" 
              currentSort={sortConfig} 
              onSort={handleSort} 
            />
            <SortableHeader 
              label="Cut" 
              sortKey="cut" 
              currentSort={sortConfig} 
              onSort={handleSort} 
            />
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-ui-border-base">
          {sortedDiamonds.map((diamond, index) => (
            <LocalizedClientLink 
              key={diamond.id} 
              href={`/products/${diamond.handle}`}
              className="block hover:bg-ui-bg-subtle transition-colors"
            >
              <div className="px-4 py-3">
                <div className="grid grid-cols-6 gap-4 items-center">
                  {/* Shape */}
                  <div className="flex items-center space-x-3">
                    <Text className="text-xs text-ui-fg-muted font-mono">
                      (F)
                    </Text>
                    <DiamondShapeIcon shape={diamond.shape} />
                    <Text className="font-medium">{diamond.shape}</Text>
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    {diamond.isOnSale && diamond.originalPrice && (
                      <Text className="text-sm text-ui-fg-muted line-through">
                        ${diamond.originalPrice}
                      </Text>
                    )}
                    <Text className={`font-semibold ${diamond.isOnSale ? 'text-red-600' : 'text-ui-fg-base'}`}>
                      ${diamond.price}
                    </Text>
                  </div>

                  {/* Carat */}
                  <Text className="font-medium">
                    {diamond.carat}
                  </Text>

                  {/* Color */}
                  <Text className="font-medium">
                    {diamond.color}
                  </Text>

                  {/* Clarity */}
                  <Text className="font-medium">
                    {diamond.clarity}
                  </Text>

                  {/* Cut */}
                  <Text className="font-medium">
                    {diamond.cut}
                  </Text>
                </div>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </div>

      {/* Load More */}
      <div className="text-center pt-4">
        <Button variant="secondary" className="px-8 py-2">
          Load More Results
        </Button>
      </div>
    </div>
  )
}

export default DiamondResultsTable
