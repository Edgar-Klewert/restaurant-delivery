"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Filter, RefreshCw, User, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderStatusBadge } from "@/components/common/order-status-badge"
import { OrderCardSkeleton } from "@/components/layout/skeleton"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"
import { ordersAPI } from "@/lib/api"
import type { Order, OrderStatus } from "@/lib/types"
import toast from "react-hot-toast"

export default function AdminOrdersPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== "admin") {
      router.push("/")
      return
    }
    loadOrders()
  }, [user, router])

  useEffect(() => {
    filterOrders()
  }, [orders, statusFilter])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const ordersData = await ordersAPI.getAll()
      setOrders(ordersData)
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
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order,
        ),
      )
      toast.success("Status atualizado com sucesso!")
    } catch (error) {
      toast.error("Erro ao atualizar status")
      console.error(error)
    }
  }

  const getStatusOptions = (currentStatus: OrderStatus) => {
    const allStatuses: OrderStatus[] = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ]
    return allStatuses.filter((status) => status !== currentStatus)
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gerenciar Pedidos</h1>
          <p className="text-gray-600">Visualize e gerencie todos os pedidos</p>
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
              <SelectItem value="out_for_delivery">Saindo para Entrega</SelectItem>
              <SelectItem value="delivered">Entregues</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadOrders} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{orders.filter((o) => o.status === "pending").length}</p>
              <p className="text-sm text-gray-600">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{orders.filter((o) => o.status === "preparing").length}</p>
              <p className="text-sm text-gray-600">Preparando</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{orders.filter((o) => o.status === "ready").length}</p>
              <p className="text-sm text-gray-600">Prontos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{orders.filter((o) => o.status === "delivered").length}</p>
              <p className="text-sm text-gray-600">Entregues</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <OrderCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <OrderStatusBadge status={order.status} />
                    <Select
                      value={order.status}
                      onValueChange={(value) => updateOrderStatus(order.id, value as OrderStatus)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getStatusOptions(order.status).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status === "pending" && "Pendente"}
                            {status === "confirmed" && "Confirmado"}
                            {status === "preparing" && "Preparando"}
                            {status === "ready" && "Pronto"}
                            {status === "out_for_delivery" && "Saindo para Entrega"}
                            {status === "delivered" && "Entregue"}
                            {status === "cancelled" && "Cancelado"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{formatDate(order.createdAt)}</span>
                  <span className="font-medium text-orange-600">{formatCurrency(order.total)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Items */}
                  <div className="lg:col-span-2">
                    <h4 className="font-medium mb-3">Itens do Pedido:</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.quantity}x {item.dish.name}
                          </span>
                          <span>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{order.client?.name || "Cliente"}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{order.phone}</span>
                    </div>
                    {order.address && (
                      <div className="flex items-start space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span className="text-xs">{order.address}</span>
                      </div>
                    )}
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/orders/${order.id}`)}
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum pedido encontrado</p>
        </div>
      )}
    </div>
  )
}
