"use client"

import Image from "next/image"
import { Star, Plus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { useCartStore, useAuthStore } from "@/lib/store"
import type { Dish } from "@/lib/types"
import toast from "react-hot-toast"

interface DishCardProps {
  dish: Dish
  onViewDetails?: (dish: Dish) => void
}

export function DishCard({ dish, onViewDetails }: DishCardProps) {
  const { addItem } = useCartStore()
  const { user } = useAuthStore()

  const handleAddToCart = () => {
    if (!user || user.role !== "client") {
      toast.error("Apenas clientes podem adicionar itens ao carrinho")
      return
    }

    addItem({
      dish,
      quantity: 1,
    })
    toast.success(`${dish.name} adicionado ao carrinho!`)
  }

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(dish)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="relative">
        <Image
          src={dish.image || "/placeholder.svg"}
          alt={dish.name}
          width={400}
          height={300}
          className="w-full h-32 sm:h-48 object-cover cursor-pointer"
          onClick={handleViewDetails}
        />
        {!dish.active && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Badge variant="destructive">Indisponível</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3
            className="font-semibold text-sm sm:text-lg cursor-pointer hover:text-orange-600 transition-colors line-clamp-2 flex-1 mr-2"
            onClick={handleViewDetails}
          >
            {dish.name}
          </h3>
          <div className="text-right">
            <p className="font-bold text-sm sm:text-lg text-orange-600">{formatCurrency(dish.price)}</p>
          </div>
        </div>

        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2 flex-1">{dish.description}</p>

        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-xs sm:text-sm font-medium">
              {dish.averageRating > 0 ? dish.averageRating.toFixed(1) : "N/A"}
            </span>
            <span className="text-xs sm:text-sm text-gray-500">({dish.totalRatings})</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
            <Badge variant="outline" className="text-xs">
              {dish.preparationTime} min
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {dish.ingredients.slice(0, 2).map((ingredient, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {ingredient}
            </Badge>
          ))}
          {dish.ingredients.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{dish.ingredients.length - 2}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3 sm:p-4 pt-0">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full">
          <Button variant="outline" className="flex-1 text-xs sm:text-sm" onClick={handleViewDetails}>
            Ver Detalhes
          </Button>
          {user?.role === "client" && dish.active && (
            <Button className="flex-1 text-xs sm:text-sm" onClick={handleAddToCart}>
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Adicionar
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
