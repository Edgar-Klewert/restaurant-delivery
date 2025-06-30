"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DishCard } from "@/components/common/dish-card"
import { DishCardSkeleton } from "@/components/layout/skeleton"
import { DishDetailsModal } from "@/components/modals/dish-detail-modal"
import { categoriesAPI, dishesAPI } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import type { Category, Dish } from "@/lib/types"
import toast from "react-hot-toast"

export default function KitchenMenuPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [dishes, setDishes] = useState<Dish[]>([])
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [dishModal, setDishModal] = useState<{
    open: boolean
    dish: Dish | null
  }>({
    open: false,
    dish: null,
  })

  useEffect(() => {
    if (user?.role !== "kitchen") {
      router.push("/")
      return
    }
    loadData()
  }, [user, router])

  useEffect(() => {
    filterDishes()
  }, [dishes, selectedCategory, searchTerm])

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

    if (selectedCategory !== "all") {
      filtered = filtered.filter((dish) => dish.categoryId === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (dish) =>
          dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dish.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredDishes(filtered)
  }

  const handleViewDetails = (dish: Dish) => {
    setDishModal({
      open: true,
      dish,
    })
  }

  if (!user || user.role !== "kitchen") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Cardápio - Visualização</h1>
        <p className="text-gray-600">Consulte informações dos pratos para preparação</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar pratos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory("all")}
          >
            Todos
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Dishes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <DishCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredDishes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} onViewDetails={handleViewDetails} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm || selectedCategory !== "all"
              ? "Nenhum prato encontrado com os filtros aplicados"
              : "Nenhum prato disponível no momento"}
          </p>
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
