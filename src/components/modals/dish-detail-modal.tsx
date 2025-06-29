"use client"

import Image from "next/image"
import { Star, Clock, Plus, Minus } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/utils"
import { useCartStore, useAuthStore } from "@/lib/store"
import type { Dish } from "@/lib/types"
import toast from "react-hot-toast"

interface DishDetailsModalProps {
  dish: Dish | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DishDetailsModal({ dish, open, onOpenChange }: DishDetailsModalProps) {
  const { addItem } = useCartStore()
  const { user } = useAuthStore()
  const [quantity, setQuantity] = useState(1)
  const [observations, setObservations] = useState("")

  if (!dish) return null

  const handleAddToCart = () => {
    if (!user || user.role !== "client") {
      toast.error("Apenas clientes podem adicionar itens ao carrinho")
      return
    }

    addItem({
      dish,
      quantity,
      observations: observations.trim() || undefined,
    })

    toast.success(`${quantity}x ${dish.name} adicionado ao carrinho!`)
    onOpenChange(false)
    setQuantity(1)
    setObservations("")
  }

  const totalPrice = dish.price * quantity

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose />
        <DialogHeader>
          <DialogTitle>{dish.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          <div className="relative h-64 w-full rounded-lg overflow-hidden">
            <Image src={dish.image || "/placeholder.svg"} alt={dish.name} fill className="object-cover" />
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{dish.averageRating > 0 ? dish.averageRating.toFixed(1) : "N/A"}</span>
                <span className="text-gray-500">({dish.totalRatings} avaliações)</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-500">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{dish.preparationTime} min</span>
              </div>
            </div>

            <p className="text-gray-600">{dish.description}</p>

            <div className="space-y-2">
              <h4 className="font-medium">Ingredientes:</h4>
              <div className="flex flex-wrap gap-2">
                {dish.ingredients.map((ingredient, index) => (
                  <Badge key={index} variant="secondary">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Reviews */}
            {dish.ratings && dish.ratings.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Avaliações:</h4>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {dish.ratings.slice(0, 3).map((rating) => (
                    <div key={rating.id} className="border-l-2 border-gray-200 pl-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < rating.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{rating.user?.name}</span>
                      </div>
                      {rating.comment && <p className="text-sm text-gray-600">{rating.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add to Cart Section */}
          {user?.role === "client" && dish.active && (
            <div className="border-t pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Observações (opcional):</label>
                <Textarea
                  placeholder="Ex: Sem cebola, ponto da carne..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">Quantidade:</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalPrice)}</p>
                </div>
              </div>

              <Button onClick={handleAddToCart} className="w-full" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Adicionar ao Carrinho - {formatCurrency(totalPrice)}
              </Button>
            </div>
          )}

          {!dish.active && (
            <div className="text-center py-4">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                Prato Indisponível
              </Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
