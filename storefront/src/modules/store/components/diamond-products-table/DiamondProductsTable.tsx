"use client"

import { useState, useMemo } from "react"
import { Text, Button, Badge } from "@medusajs/ui"
import { ChevronDown } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { DiamondProductsTableProps, DiamondResult, SortConfig } from "./types"
import { applyFilters, sortDiamonds } from "./utils"
import { useProductData } from "../../hooks/useProductData"

const DiamondProductsTable = ({ 
  searchQuery = "",
  selectedType = 'white',
  filters = {}
}: DiamondProductsTableProps) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)
  const { allDiamonds, loading } = useProductData()

  // Apply filters and sorting on client side
  const filteredAndSortedDiamonds = useMemo(() => {
    const filtered = applyFilters(allDiamonds, filters, selectedType, searchQuery)
    return sortDiamonds(filtered, sortConfig)
  }, [allDiamonds, filters, selectedType, searchQuery, sortConfig])

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const SortButton = ({ 
    field, 
    children 
  }: { 
    field: string; 
    children: React.ReactNode 
  }) => {
    const isActive = sortConfig?.key === field
    const isAsc = isActive && sortConfig?.direction === 'asc'
    
    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center space-x-1 hover:text-ui-fg-base transition-colors"
      >
        <span>{children}</span>
        {isActive && (
          <ChevronDown 
            size={16} 
            className={`transition-transform ${isAsc ? 'rotate-180' : ''}`}
          />
        )}
      </button>
    )
  }

  const DiamondShapeIcon = ({ shape }: { shape: string }) => {
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

    return (
      <div className="flex items-center space-x-2">
        <span className="text-lg">{getShapeIcon(shape)}</span>
        <Text className="font-medium">{shape}</Text>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-ui-bg-subtle animate-pulse rounded" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 w-full bg-ui-bg-subtle animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <Text className="text-ui-fg-muted">
          {filteredAndSortedDiamonds.length} diamonds found
        </Text>
      </div>

      {/* Simple Table using MedusaJS components */}
      <div className="border border-ui-border-base rounded-lg overflow-hidden">
        {selectedType === 'white' ? (
          <div>
            {/* Header */}
            <div className="bg-ui-bg-subtle border-b border-ui-border-base">
              <div className="grid grid-cols-9 gap-2 p-3 text-sm font-medium">
                <div><SortButton field="shape">Shape</SortButton></div>
                <div><SortButton field="carat">Carat</SortButton></div>
                <div><SortButton field="color">Color</SortButton></div>
                <div><SortButton field="clarity">Clarity</SortButton></div>
                <div><SortButton field="cut">Cut</SortButton></div>
                <div><SortButton field="labType">Lab</SortButton></div>
                <div><SortButton field="price">Price</SortButton></div>
                <div>Certificate</div>
                <div>Action</div>
              </div>
            </div>
            
            {/* Rows */}
            <div>
              {filteredAndSortedDiamonds.map((diamond) => (
                <div key={diamond.id} className="border-b border-ui-border-subtle last:border-b-0 hover:bg-ui-bg-subtle">
                  <div className="grid grid-cols-9 gap-2 p-3 text-sm">
                    <div>
                      <DiamondShapeIcon shape={diamond.shape} />
                    </div>
                    <div>
                      <Text className="font-medium">{diamond.carat}ct</Text>
                    </div>
                    <div>
                      <Text>{diamond.color}</Text>
                    </div>
                    <div>
                      <Text>{diamond.clarity}</Text>
                    </div>
                    <div>
                      <Text>{diamond.cut}</Text>
                    </div>
                    <div>
                      <Badge>{diamond.labType}</Badge>
                    </div>
                    <div>
                      <Text className="font-semibold">${diamond.price.toLocaleString()}</Text>
                    </div>
                    <div>
                      <Text className="text-xs text-ui-fg-muted">{diamond.certificate}</Text>
                    </div>
                    <div>
                      <LocalizedClientLink href={`/products/${diamond.handle}`}>
                        <Button variant="secondary" size="small">
                          View
                        </Button>
                      </LocalizedClientLink>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {/* Header for Fancy */}
            <div className="bg-ui-bg-subtle border-b border-ui-border-base">
              <div className="grid grid-cols-8 gap-2 p-3 text-sm font-medium">
                <div><SortButton field="shape">Shape</SortButton></div>
                <div><SortButton field="carat">Carat</SortButton></div>
                <div><SortButton field="color">Fancy Color</SortButton></div>
                <div><SortButton field="clarity">Clarity</SortButton></div>
                <div><SortButton field="labType">Lab</SortButton></div>
                <div><SortButton field="price">Price</SortButton></div>
                <div>Certificate</div>
                <div>Action</div>
              </div>
            </div>
            
            {/* Rows for Fancy */}
            <div>
              {filteredAndSortedDiamonds.map((diamond) => (
                <div key={diamond.id} className="border-b border-ui-border-subtle last:border-b-0 hover:bg-ui-bg-subtle">
                  <div className="grid grid-cols-8 gap-2 p-3 text-sm">
                    <div>
                      <DiamondShapeIcon shape={diamond.shape} />
                    </div>
                    <div>
                      <Text className="font-medium">{diamond.carat}ct</Text>
                    </div>
                    <div>
                      <Text>{diamond.color}</Text>
                    </div>
                    <div>
                      <Text>{diamond.clarity}</Text>
                    </div>
                    <div>
                      <Badge>{diamond.labType}</Badge>
                    </div>
                    <div>
                      <Text className="font-semibold">${diamond.price.toLocaleString()}</Text>
                    </div>
                    <div>
                      <Text className="text-xs text-ui-fg-muted">{diamond.certificate}</Text>
                    </div>
                    <div>
                      <LocalizedClientLink href={`/products/${diamond.handle}`}>
                        <Button variant="secondary" size="small">
                          View
                        </Button>
                      </LocalizedClientLink>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {filteredAndSortedDiamonds.length === 0 && !loading && (
        <div className="text-center py-12">
          <Text className="text-ui-fg-muted">No diamonds found matching your criteria.</Text>
        </div>
      )}
    </div>
  )
}

DiamondProductsTable.displayName = 'DiamondProductsTable'

export { DiamondProductsTable }
