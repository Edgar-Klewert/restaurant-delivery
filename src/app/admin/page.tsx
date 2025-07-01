"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp, Users, ShoppingBag, DollarSign, Clock, Star, ChefHat, Truck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store"
import { dashboardAPI } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import type { DashboardStats } from "@/lib/types"
import toast from "react-hot-toast"

export default function AdminDashboard() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === "admin") {
      loadStats()
    }
  }, [user])

  if (!user || user.role !== "admin") {
    router.push("/")
    return null
  }

  const loadStats = async () => {
    try {
      setLoading(true)
      const statsData = await dashboardAPI.getStats()
      setStats(statsData)
    } catch (error) {
      toast.error("Erro ao carregar estatísticas")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600">Erro ao carregar dados</h2>
          <Button onClick={loadStats} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
          <p className="text-gray-600">Visão geral do seu negócio</p>
        </div>
        <div className="flex space-x-4">
          <Button onClick={() => router.push("/admin/orders")} variant="outline">
            Ver Pedidos
          </Button>
          <Button onClick={() => router.push("/admin/reports")}>Relatórios Detalhados</Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">+20.1% em relação ao mês passado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">+15% em relação ao mês passado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">+5.2% em relação ao mês passado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">+12% em relação ao mês passado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Popular Dishes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Pratos Mais Populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.popularDishes.slice(0, 5).map((item, index) => (
                <div key={item.dish.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{item.dish.name}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(item.dish.price)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.orders}</p>
                    <p className="text-sm text-gray-600">pedidos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Status dos Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.ordersByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span className="capitalize">
                      {item.status === "pending" && "Pendentes"}
                      {item.status === "confirmed" && "Confirmados"}
                      {item.status === "preparing" && "Preparando"}
                      {item.status === "ready" && "Prontos"}
                      {item.status === "out_for_delivery" && "Saindo para entrega"}
                      {item.status === "delivered" && "Entregues"}
                      {item.status === "cancelled" && "Cancelados"}
                    </span>
                  </div>
                  <span className="font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push("/admin/menu")}>
          <CardContent className="p-6 text-center">
            <ChefHat className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Gerenciar Cardápio</h3>
            <p className="text-gray-600 text-sm">Adicionar, editar ou remover pratos</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push("/admin/delivery")}
        >
          <CardContent className="p-6 text-center">
            <Truck className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Entregadores</h3>
            <p className="text-gray-600 text-sm">Gerenciar equipe de delivery</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push("/admin/reports")}
        >
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Relatórios</h3>
            <p className="text-gray-600 text-sm">Análises detalhadas e insights</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
