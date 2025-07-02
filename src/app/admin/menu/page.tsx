"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DishCardSkeleton } from "@/components/layout/skeleton"
import { AdvancedFilter } from "@/components/ui/advanced-filter"
import { ImageUpload } from "@/components/ui/image-upload"
import { formatCurrency } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"
import { dishesAPI, categoriesAPI } from "@/lib/api"
import type { Dish, Category } from "@/lib/types"
import toast from "react-hot-toast"
import Image from "next/image"

export default function AdminMenuPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [dishes, setDishes] = useState<Dish[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState<{
    open: boolean
    dish: Dish | null
    isNew: boolean
  }>({
    open: false,
    dish: null,
    isNew: false,
  })

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    preparationTime: "",
    ingredients: "",
    active: true,
    image: "",
  })

  useEffect(() => {
    if (user?.role !== "admin") {
      router.push("/")
      return
    }
    loadData()
  }, [user, router])

  useEffect(() => {
    filterDishes()
  }, [dishes, searchTerm, activeFilters])

  const loadData = async () => {
    try {
      setLoading(true)
      const [dishesData, categoriesData] = await Promise.all([dishesAPI.getAll(), categoriesAPI.getAll()])
      setDishes(dishesData)
      setCategories(categoriesData)
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
          dish.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Category filter
    if (activeFilters.category) {
      filtered = filtered.filter((dish) => dish.categoryId === activeFilters.category)
    }

    // Status filter
    if (activeFilters.status) {
      filtered = filtered.filter((dish) => {
        if (activeFilters.status.includes("active") && !dish.active) return false
        if (activeFilters.status.includes("inactive") && dish.active) return false
        return true
      })
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

  const handleEdit = (dish: Dish) => {
    setFormData({
      name: dish.name,
      description: dish.description,
      price: dish.price.toString(),
      categoryId: dish.categoryId,
      preparationTime: dish.preparationTime.toString(),
      ingredients: dish.ingredients.join(", "),
      active: dish.active,
      image: dish.image,
    })
    setEditModal({ open: true, dish, isNew: false })
  }

  const handleNew = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      preparationTime: "",
      ingredients: "",
      active: true,
      image: "",
    })
    setEditModal({ open: true, dish: null, isNew: true })
  }

  const handleSave = async () => {
    if (!formData.name || !formData.description || !formData.price || !formData.categoryId) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    try {
      const dishData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        categoryId: formData.categoryId,
        preparationTime: Number.parseInt(formData.preparationTime) || 15,
        ingredients: formData.ingredients.split(",").map((i) => i.trim()),
        active: formData.active,
        image: formData.image || "/placeholder.svg?height=300&width=400",
      }

      if (editModal.isNew) {
        await dishesAPI.create(dishData)
        toast.success("Prato criado com sucesso!")
      } else if (editModal.dish) {
        await dishesAPI.update(editModal.dish.id, dishData)
        toast.success("Prato atualizado com sucesso!")
      }

      setEditModal({ open: false, dish: null, isNew: false })
      loadData()
    } catch (error) {
      toast.error("Erro ao salvar prato")
      console.error(error)
    }
  }

  const handleDelete = async (dish: Dish) => {
    if (!confirm(`Tem certeza que deseja excluir "${dish.name}"?`)) return

    try {
      await dishesAPI.delete(dish.id)
      toast.success("Prato excluído com sucesso!")
      loadData()
    } catch (error) {
      toast.error("Erro ao excluir prato")
      console.error(error)
    }
  }

  const toggleActive = async (dish: Dish) => {
    try {
      await dishesAPI.update(dish.id, { active: !dish.active })
      toast.success(`Prato ${!dish.active ? "ativado" : "desativado"} com sucesso!`)
      loadData()
    } catch (error) {
      toast.error("Erro ao atualizar status")
      console.error(error)
    }
  }

  const filterOptions = [
    {
      key: "category",
      label: "Categoria",
      type: "select" as const,
      options: categories.map((cat) => ({ value: cat.id, label: cat.name })),
    },
    {
      key: "status",
      label: "Status",
      type: "checkbox" as const,
      options: [
        { value: "active", label: "Ativo" },
        { value: "inactive", label: "Inativo" },
      ],
    },
    {
      key: "price",
      label: "Preço (R$)",
      type: "range" as const,
      min: 0,
      max: 100,
      step: 0.01,
    },
  ]

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gerenciar Cardápio</h1>
          <p className="text-sm sm:text-base text-gray-600">Adicione, edite ou remova pratos do cardápio</p>
        </div>
        <Button onClick={handleNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Prato
        </Button>
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
          placeholder="Buscar pratos..."
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
            <Card key={dish.id} className={`overflow-hidden ${!dish.active ? "opacity-60" : ""}`}>
              <div className="relative">
                <Image
                  src={dish.image || "/placeholder.svg"}
                  alt={dish.name}
                  width={400}
                  height={200}
                  className="w-full h-32 sm:h-48 object-cover"
                />
                {!dish.active && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Badge variant="destructive">Inativo</Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm sm:text-lg line-clamp-1">{dish.name}</h3>
                  <p className="font-bold text-sm sm:text-lg text-orange-600 ml-2">{formatCurrency(dish.price)}</p>
                </div>

                <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{dish.description}</p>

                <div className="flex items-center justify-between mb-3 gap-2">
                  <Badge variant="outline" className="text-xs">
                    {dish.preparationTime} min
                  </Badge>
                  <Badge variant="secondary" className="text-xs line-clamp-1">
                    {categories.find((c) => c.id === dish.categoryId)?.name}
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(dish)} className="flex-1 text-xs">
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant={dish.active ? "secondary" : "default"}
                    size="sm"
                    onClick={() => toggleActive(dish)}
                    className="flex-1 text-xs"
                  >
                    {dish.active ? "Desativar" : "Ativar"}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(dish)} className="sm:w-auto">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                : "Adicione o primeiro prato ao cardápio"}
            </p>
            {!searchTerm && !Object.values(activeFilters).some(Boolean) && (
              <Button onClick={handleNew}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Prato
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={editModal.open} onOpenChange={(open) => setEditModal({ ...editModal, open })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editModal.isNew ? "Novo Prato" : "Editar Prato"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Imagem do Prato</label>
              <ImageUpload
                value={formData.image}
                onChange={(value) => setFormData({ ...formData, image: value })}
                placeholder="Adicione uma imagem do prato"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do prato"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Preço *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descrição *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do prato"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Categoria *</label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tempo de Preparo (min)</label>
                <Input
                  type="number"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                  placeholder="15"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ingredientes</label>
              <Textarea
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                placeholder="Ingrediente 1, Ingrediente 2, Ingrediente 3..."
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="active" className="text-sm font-medium">
                Prato ativo
              </label>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <Button variant="outline" onClick={() => setEditModal({ ...editModal, open: false })} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="flex-1">
                {editModal.isNew ? "Criar Prato" : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
// This code is part of a Next.js application that manages an admin menu page.