"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Clock, ChefHat, CheckCircle, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderStatusBadge } from "@/components/common/order-status-badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useAuthStore, useNotificationStore } from "@/lib/store"
import { ordersAPI } from "@/lib/api"
import type { Order, OrderStatus } from "@/lib/types"
import toast from "react-hot-toast"

export default function KitchenPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { addNotification } = useNotificationStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === "kitchen") {
      loadOrders()
    }
  }, [user])

  useEffect(() => {
    filterOrders()
  }, [orders, statusFilter])

  if (!user || user.role !== "kitchen") {
    router.push("/")
    return null
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      const ordersData = await ordersAPI.getAll()
      // Filter only active orders for kitchen
      const activeOrders = ordersData.filter((order) => !["delivered", "cancelled"].includes(order.status))
      setOrders(activeOrders)
    } catch (error) {
      toast.error("Erro ao carregar pedidos")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    if (statusFilter === "all") {
      setFilteredOrders(orders)
    } else {
      setFilteredOrders(orders.filter((order) => order.status === statusFilter))
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus)

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order,
        ),
      )

      // Add notification
      addNotification({
        title: "Status Atualizado",
        message: `Pedido #${orderId} marcado como ${getStatusText(newStatus)}`,
        type: "success",
      })

      toast.success("Status atualizado com sucesso!")
    } catch (error) {
      toast.error("Erro ao atualizar status")
      console.error(error)
    }
  }

  const getStatusText = (status: OrderStatus) => {
    const statusMap = {
      pending: "Pendente",
      confirmed: "Confirmado",
      preparing: "Preparando",
      ready: "Pronto",
      out_for_delivery: "Saiu para entrega",
      delivered: "Entregue",
      cancelled: "Cancelado",
    }
    return statusMap[status]
  }

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow = {
      pending: "confirmed",
      confirmed: "preparing",
      preparing: "ready",
      ready: "out_for_delivery",
    } as const

    return statusFlow[currentStatus] || null
  }


  const getPriorityLevel = (order: Order) => {
    const orderTime = new Date(order.createdAt).getTime()
    const now = Date.now()
    const minutesAgo = (now - orderTime) / (1000 * 60)

    if (minutesAgo > 30) return "high"
    if (minutesAgo > 15) return "medium"
    return "low"
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Painel da Cozinha</h1>
          <p className="text-gray-600">Gerencie os pedidos em andamento</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="confirmed">Confirmados</SelectItem>
              <SelectItem value="preparing">Preparando</SelectItem>
              <SelectItem value="ready">Prontos</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadOrders} variant="outline">
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold">{orders.filter((o) => o.status === "pending").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ChefHat className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Preparando</p>
                <p className="text-2xl font-bold">{orders.filter((o) => o.status === "preparing").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Prontos</p>
                <p className="text-2xl font-bold">{orders.filter((o) => o.status === "ready").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">T</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Hoje</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <ChefHat className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            {statusFilter === "all"
              ? "Nenhum pedido ativo"
              : `Nenhum pedido ${getStatusText(statusFilter as OrderStatus).toLowerCase()}`}
          </h2>
          <p className="text-gray-500">Os pedidos aparecerão aqui conforme chegarem</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const priority = getPriorityLevel(order)
            const nextStatus = getNextStatus(order.status)

            return (
              <Card key={order.id} className={`${priority === "high" ? "ring-2 ring-red-200" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {priority === "high" && (
                        <Badge variant="destructive" className="text-xs">
                          Urgente
                        </Badge>
                      )}
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{formatDate(order.createdAt)}</span>
                    <span className="font-medium">{formatCurrency(order.total)}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="font-medium">
                          {item.quantity}x {item.dish.name}
                        </span>
                        <span className="text-gray-600">{item.dish.preparationTime}min</span>
                      </div>
                    ))}
                  </div>

                  {/* Order Info */}
                  <div className="border-t pt-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Tipo:</span>
                      <span>{order.type === "delivery" ? "Delivery" : "Retirada"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cliente:</span>
                      <span>{order.client?.name || "N/A"}</span>
                    </div>
                    {order.observations && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                        <strong>Obs:</strong> {order.observations}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {nextStatus && (
                    <Button onClick={() => updateOrderStatus(order.id, nextStatus)} className="w-full" size="sm">
                      Marcar como {getStatusText(nextStatus)}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
