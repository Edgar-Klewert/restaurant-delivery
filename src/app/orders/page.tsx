"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderStatusBadge } from "@/components/common/order-status-badge"
import { RatingModal } from "@/components/modals/rating-modal"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"
import { ordersAPI } from "@/lib/api"
import type { Order, Dish } from "@/lib/types"
import toast from "react-hot-toast"

export default function OrdersPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [ratingModal, setRatingModal] = useState<{
    open: boolean
    dish: Dish | null
    order: Order | null
  }>({
    open: false,
    dish: null,
    order: null,
  })

  useEffect(() => {
    if (user?.role === "client") {
      loadOrders()
    }
  }, [user])

  if (!user || user.role !== "client") {
    router.push("/")
    return null
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      const ordersData = await ordersAPI.getByClientId(user.id)
      setOrders(ordersData)
    } catch (error) {
      toast.error("Erro ao carregar pedidos")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  const handleRateDish = (dish: Dish, order: Order) => {
    setRatingModal({
      open: true,
      dish,
      order,
    })
  }

  const handleRatingSubmitted = () => {
    toast.success("Avaliação enviada!")
    // Refresh orders to update rating status
    loadOrders()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Meus Pedidos</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-600 mb-4">Você ainda não fez nenhum pedido</h2>
            <Button onClick={() => router.push("/")} size="lg">
              Ver Cardápio
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{formatDate(order.createdAt)}</span>
                    <span className="font-medium text-orange-600">{formatCurrency(order.total)}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="font-medium">
                              {item.quantity}x {item.dish.name}
                            </span>
                            {item.observations && <p className="text-sm text-gray-600">Obs: {item.observations}</p>}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{formatCurrency(item.price * item.quantity)}</span>
                            {order.status === "delivered" && (
                              <Button variant="outline" size="sm" onClick={() => handleRateDish(item.dish, order)}>
                                <Star className="h-4 w-4 mr-1" />
                                Avaliar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Info */}
                    <div className="border-t pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tipo:</span>
                        <span>{order.type === "delivery" ? "Delivery" : "Retirada"}</span>
                      </div>
                      {order.address && (
                        <div className="flex justify-between">
                          <span>Endereço:</span>
                          <span className="text-right max-w-xs">{order.address}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Telefone:</span>
                        <span>{order.phone}</span>
                      </div>
                      {order.observations && (
                        <div className="flex justify-between">
                          <span>Observações:</span>
                          <span className="text-right max-w-xs">{order.observations}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <Button variant="outline" onClick={() => handleViewOrder(order.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <RatingModal
        dish={ratingModal.dish}
        order={ratingModal.order}
        open={ratingModal.open}
        onOpenChange={(open) => setRatingModal({ ...ratingModal, open })}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </div>
  )
}
