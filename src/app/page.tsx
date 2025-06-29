"use client"

import { useEffect, useState } from "react"
import { DishCard } from "@/components/common/dish-card"
import { DishCardSkeleton } from "@/components/layout/skeleton"
import { AdvancedFilter } from "@/components/ui/advanced-filter"
import { categoriesAPI, dishesAPI } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import type { Category, Dish } from "@/lib/types"
import toast from "react-hot-toast"
import { DishDetailsModal } from "@/components/modals/dish-detail-modal"

export default function HomePage() {
  const { user } = useAuthStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [dishes, setDishes] = useState<Dish[]>([])
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [dishModal, setDishModal] = useState<{
    open: boolean
    dish: Dish | null
  }>({
    open: false,
    dish: null,
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterDishes()
  }, [dishes, searchTerm, activeFilters])

  const loadData = async () => {
    try {
      setLoading(true)
      const [categoriesData, dishesData] = await Promise.all([categoriesAPI.getAll(), dishesAPI.getAll()])
      setCategories(categoriesData)
      setDishes(dishesData)
    } catch (error) {
      toast.error("Erro ao carregar dados")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filterDishes = () => {
    let filtered = dishes

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (dish) =>
          dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dish.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dish.ingredients.some((ingredient) => ingredient.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Category filter
    if (activeFilters.category) {
      filtered = filtered.filter((dish) => dish.categoryId === activeFilters.category)
    }

    // Price range filter
    if (activeFilters.price) {
      const { min, max } = activeFilters.price
      filtered = filtered.filter((dish) => {
        if (min && dish.price < min) return false
        if (max && dish.price > max) return false
        return true
      })
    }

    // Preparation time filter
    if (activeFilters.preparationTime) {
      const { min, max } = activeFilters.preparationTime
      filtered = filtered.filter((dish) => {
        if (min && dish.preparationTime < min) return false
        if (max && dish.preparationTime > max) return false
        return true
      })
    }

    // Rating filter
    if (activeFilters.rating) {
      const minRating = Number.parseFloat(activeFilters.rating)
      filtered = filtered.filter((dish) => dish.averageRating >= minRating)
    }

    // Availability filter
    if (activeFilters.availability) {
      filtered = filtered.filter((dish) => {
        if (activeFilters.availability.includes("available") && !dish.active) return false
        if (activeFilters.availability.includes("unavailable") && dish.active) return false
        return true
      })
    }

    setFilteredDishes(filtered)
  }

  const handleFilterChange = (key: string, value: any) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleClearFilters = () => {
    setActiveFilters({})
  }

  const handleViewDetails = (dish: Dish) => {
    setDishModal({
      open: true,
      dish,
    })
  }

  const filterOptions = [
    {
      key: "category",
      label: "Categoria",
      type: "select" as const,
      options: categories.map((cat) => ({ value: cat.id, label: cat.name })),
    },
    {
      key: "price",
      label: "Preço (R$)",
      type: "range" as const,
      min: 0,
      max: 100,
      step: 0.01,
    },
    {
      key: "preparationTime",
      label: "Tempo de Preparo (min)",
      type: "range" as const,
      min: 0,
      max: 60,
      step: 1,
    },
    {
      key: "rating",
      label: "Avaliação Mínima",
      type: "select" as const,
      options: [
        { value: "4", label: "4+ estrelas" },
        { value: "3", label: "3+ estrelas" },
        { value: "2", label: "2+ estrelas" },
        { value: "1", label: "1+ estrelas" },
      ],
    },
    {
      key: "availability",
      label: "Disponibilidade",
      type: "checkbox" as const,
      options: [
        { value: "available", label: "Disponível" },
        { value: "unavailable", label: "Indisponível" },
      ],
    },
  ]

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4">Bem-vindo ao DeliveryApp</h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8">Faça login para ver nosso cardápio e fazer pedidos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          {user.role === "client" ? "Nosso Cardápio" : "Cardápio"}
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          {user.role === "client" ? "Escolha seus pratos favoritos e faça seu pedido" : "Visualização do cardápio"}
        </p>
      </div>

      {/* Advanced Filters */}
      <div className="mb-6 sm:mb-8">
        <AdvancedFilter
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filterOptions}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          placeholder="Buscar pratos, ingredientes..."
        />
      </div>

      {/* Results Summary */}
      <div className="mb-4 sm:mb-6">
        <p className="text-sm text-gray-600">
          {loading
            ? "Carregando..."
            : `${filteredDishes.length} prato${filteredDishes.length !== 1 ? "s" : ""} encontrado${filteredDishes.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Dishes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <DishCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredDishes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredDishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} onViewDetails={handleViewDetails} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🍽️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum prato encontrado</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || Object.values(activeFilters).some(Boolean)
                ? "Tente ajustar os filtros de busca"
                : "Nenhum prato disponível no momento"}
            </p>
            {(searchTerm || Object.values(activeFilters).some(Boolean)) && (
              <button
                onClick={() => {
                  setSearchTerm("")
                  handleClearFilters()
                }}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      )}

      <DishDetailsModal
        dish={dishModal.dish}
        open={dishModal.open}
        onOpenChange={(open) => setDishModal({ ...dishModal, open })}
      />
    </div>
  )
}
