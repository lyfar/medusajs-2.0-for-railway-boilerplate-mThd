"use client"

import { Suspense, useState, useCallback, useRef } from "react"

import { NewDiamondFilters } from "../components/diamond-filters/NewDiamondFilters"
import { DiamondProductsTable } from "../components/diamond-products-table"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const [selectedType, setSelectedType] = useState<'white' | 'fancy'>('white')
  const [searchQuery, setSearchQuery] = useState("")
  const [currentFilters, setCurrentFilters] = useState<any>({})

  // Use refs to avoid stale closures in useCallback
  const selectedTypeRef = useRef(selectedType)
  const searchQueryRef = useRef(searchQuery)
  selectedTypeRef.current = selectedType
  searchQueryRef.current = searchQuery

  const handleFiltersChange = useCallback((filters: any) => {
    setCurrentFilters(filters)
    if (filters.selectedType !== selectedTypeRef.current) {
      setSelectedType(filters.selectedType)
    }
    if (filters.searchQuery !== searchQueryRef.current) {
      setSearchQuery(filters.searchQuery)
    }
  }, [])

  return (
    <div className="py-6">
      {/* Header */}
      <div 
        className="relative h-32 bg-gradient-to-r from-gray-900 to-gray-800 mb-8"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl text-white font-light">Diamonds</h1>
        </div>
      </div>

      <div className="content-container">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <NewDiamondFilters onFiltersChange={handleFiltersChange} />
          </div>

          {/* Results Area */}
          <div className="flex-1">
            <Suspense fallback={<div className="text-ui-fg-subtle">Loading…</div>}>
              <DiamondProductsTable 
                key={`table-${selectedType}`}
                searchQuery={searchQuery}
                selectedType={selectedType}
                filters={currentFilters}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

StoreTemplate.displayName = 'StoreTemplate'

export default StoreTemplate
