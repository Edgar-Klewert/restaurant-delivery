"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Phone, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderStatusBadge } from "@/components/common/order-status-badge"
import { OrderTimeline } from "@/components/common/order-timeline"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"
import { ordersAPI } from "@/lib/api"
import type { Order } from "@/lib/types"
import toast from "react-hot-toast"

interface OrderDetailsPageProps {
  params: {
    id: string
  }
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
  }, [params.id])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const orderData = await ordersAPI.getById(params.id)
      setOrder(orderData)
    } catch (error) {
      toast.error("Erro ao carregar pedido")
      console.error(error)
      router.push("/orders")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    router.push("/")
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando pedido...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600">Pedido não encontrado</h2>
          <Button onClick={() => router.push("/orders")} className="mt-4">
            Voltar aos Pedidos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">Pedido #{order.id}</h1>
            <p className="text-gray-600">{formatDate(order.createdAt)}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Status do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTimeline currentStatus={order.status} estimatedTime={order.estimatedTime} />
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Itens do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-4">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.dish.name}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{item.dish.description}</p>
                        {item.observations && <p className="text-sm text-orange-600 mt-1">Obs: {item.observations}</p>}
                        <p className="text-sm text-gray-500 mt-1">Quantidade: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(item.price)} cada</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Info */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.total - order.deliveryFee)}</span>
                </div>
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Taxa de entrega</span>
                    <span>{formatCurrency(order.deliveryFee)}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-orange-600">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{order.type === "delivery" ? "Delivery" : "Retirada"}</p>
                    <p className="text-sm text-gray-600">Tempo estimado: {order.estimatedTime} min</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Contato</p>
                    <p className="text-sm text-gray-600">{order.phone}</p>
                  </div>
                </div>

                {order.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Endereço</p>
                      <p className="text-sm text-gray-600">{order.address}</p>
                    </div>
                  </div>
                )}

                {order.observations && (
                  <div className="border-t pt-4">
                    <p className="font-medium mb-2">Observações</p>
                    <p className="text-sm text-gray-600">{order.observations}</p>
                  </div>
                )}

                {order.deliveryPerson && (
                  <div className="border-t pt-4">
                    <p className="font-medium mb-2">Entregador</p>
                    <p className="text-sm text-gray-600">{order.deliveryPerson.name}</p>
                    <p className="text-sm text-gray-600">{order.deliveryPerson.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
