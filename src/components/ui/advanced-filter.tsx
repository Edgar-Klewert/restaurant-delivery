"use client"

import { useState } from "react"
import { X, Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface FilterOption {
  key: string
  label: string
  type: "select" | "range" | "checkbox"
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  step?: number
}

interface AdvancedFilterProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filters: FilterOption[]
  activeFilters: Record<string, any>
  onFilterChange: (key: string, value: any) => void
  onClearFilters: () => void
  className?: string
  placeholder?: string
}

export function AdvancedFilter({
  searchValue,
  onSearchChange,
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
  className,
  placeholder = "Buscar...",
}: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length

  const renderFilterInput = (filter: FilterOption) => {
    const value = activeFilters[filter.key]

    switch (filter.type) {
      case "select":
        return (
          <Select
            value={value || "all"} // Updated default value to "all"
            onValueChange={(newValue) => onFilterChange(filter.key, newValue || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Selecionar ${filter.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem> // Updated value to "all"
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "range":
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Mín"
                value={value?.min || ""}
                onChange={(e) =>
                  onFilterChange(filter.key, {
                    ...value,
                    min: e.target.value ? Number(e.target.value) : null,
                  })
                }
                min={filter.min}
                max={filter.max}
                step={filter.step}
              />
              <span className="text-gray-500">até</span>
              <Input
                type="number"
                placeholder="Máx"
                value={value?.max || ""}
                onChange={(e) =>
                  onFilterChange(filter.key, {
                    ...value,
                    max: e.target.value ? Number(e.target.value) : null,
                  })
                }
                min={filter.min}
                max={filter.max}
                step={filter.step}
              />
            </div>
          </div>
        )

      case "checkbox":
        return (
          <div className="space-y-2">
            {filter.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value?.includes(option.value) || false}
                  onChange={(e) => {
                    const currentValues = value || []
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter((v: string) => v !== option.value)
                    onFilterChange(filter.key, newValues.length > 0 ? newValues : null)
                  }}
                  className="rounded"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Mobile Filter Button */}
        <div className="flex space-x-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="relative">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Filtros Avançados</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {filters.map((filter) => (
                  <div key={filter.key}>
                    <label className="block text-sm font-medium mb-2">{filter.label}</label>
                    {renderFilterInput(filter)}
                  </div>
                ))}
                <div className="flex space-x-2 pt-4">
                  <Button onClick={onClearFilters} variant="outline" className="flex-1">
                    Limpar
                  </Button>
                  <Button onClick={() => setIsOpen(false)} className="flex-1">
                    Aplicar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value) return null

            const filter = filters.find((f) => f.key === key)
            if (!filter) return null

            let displayValue = ""
            if (filter.type === "select") {
              const option = filter.options?.find((o) => o.value === value)
              displayValue = option?.label || value
            } else if (filter.type === "range") {
              const min = value.min ? `${value.min}` : ""
              const max = value.max ? `${value.max}` : ""
              displayValue = `${min}${min && max ? " - " : ""}${max}`
            } else if (filter.type === "checkbox") {
              displayValue = `${value.length} selecionado${value.length > 1 ? "s" : ""}`
            }

            return (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                <span className="text-xs">
                  {filter.label}: {displayValue}
                </span>
                <button onClick={() => onFilterChange(key, null)} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
