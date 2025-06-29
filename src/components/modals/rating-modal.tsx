"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ratingsAPI } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import type { Dish, Order } from "@/lib/types"
import toast from "react-hot-toast"

interface RatingModalProps {
  dish: Dish | null
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRatingSubmitted?: () => void
}

export function RatingModal({ dish, order, open, onOpenChange, onRatingSubmitted }: RatingModalProps) {
  const { user } = useAuthStore()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  if (!dish || !order || !user) return null

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Selecione uma avaliação")
      return
    }

    try {
      setLoading(true)
      await ratingsAPI.create({
        userId: user.id,
        dishId: dish.id,
        orderId: order.id,
        rating,
        comment: comment.trim() || undefined,
      })

      toast.success("Avaliação enviada com sucesso!")
      onRatingSubmitted?.()
      onOpenChange(false)
      setRating(0)
      setComment("")
    } catch (error) {
      toast.error("Erro ao enviar avaliação")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose />
        <DialogHeader>
          <DialogTitle>Avaliar Prato</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <h3 className="font-medium text-lg mb-2">{dish.name}</h3>
            <p className="text-gray-600">Como foi sua experiência com este prato?</p>
          </div>

          {/* Rating Stars */}
          <div className="flex justify-center space-x-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <button key={index} onClick={() => setRating(index + 1)} className="transition-colors">
                <Star
                  className={`h-8 w-8 ${
                    index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"
                  }`}
                />
              </button>
            ))}
          </div>

          {rating > 0 && (
            <div className="text-center text-sm text-gray-600">
              {rating === 1 && "Muito ruim"}
              {rating === 2 && "Ruim"}
              {rating === 3 && "Regular"}
              {rating === 4 && "Bom"}
              {rating === 5 && "Excelente"}
            </div>
          )}

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Comentário (opcional):</label>
            <Textarea
              placeholder="Conte-nos mais sobre sua experiência..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={rating === 0 || loading} className="flex-1">
              {loading ? "Enviando..." : "Enviar Avaliação"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
