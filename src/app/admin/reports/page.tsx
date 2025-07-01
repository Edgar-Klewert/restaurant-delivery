"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp, Download, Calendar, DollarSign, ShoppingBag, Users, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardCardSkeleton } from "@/components/layout/skeleton"
import { formatCurrency } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"
import { dashboardAPI } from "@/lib/api"
import type { DashboardStats } from "@/lib/types"
import toast from "react-hot-toast"

export default function AdminReportsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("7days")

  useEffect(() => {
    if (user?.role !== "admin") {
      router.push("/")
      return
    }
    loadStats()
  }, [user, router, period])

  const loadStats = async () => {
    try {
      setLoading(true)
      // Calculate date range based on period
      const endDate = new Date()
      const startDate = new Date()

      switch (period) {
        case "7days":
          startDate.setDate(endDate.getDate() - 7)
          break
        case "30days":
          startDate.setDate(endDate.getDate() - 30)
          break
        case "90days":
          startDate.setDate(endDate.getDate() - 90)
          break
        default:
          startDate.setDate(endDate.getDate() - 7)
      }

      const statsData = await dashboardAPI.getStats(startDate.toISOString(), endDate.toISOString())
      setStats(statsData)
    } catch (error) {
      toast.error("Erro ao carregar relatórios")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    if (!stats) return

    const reportData = {
      period,
      generatedAt: new Date().toISOString(),
      stats,
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `relatorio-${period}-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Relatório exportado com sucesso!")
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Relatórios e Análises</h1>
          <p className="text-gray-600">Insights detalhados sobre seu negócio</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="90days">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline" disabled={!stats}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <DashboardCardSkeleton key={index} />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Main KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  Média: {formatCurrency(stats.totalRevenue / Math.max(stats.totalOrders, 1))} por pedido
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {(stats.totalOrders / Number.parseInt(period.replace("days", ""))).toFixed(1)} pedidos/dia
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</div>
                <p className="text-xs text-muted-foreground">Por pedido realizado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalClients}</div>
                <p className="text-xs text-muted-foreground">
                  {(stats.totalOrders / Math.max(stats.totalClients, 1)).toFixed(1)} pedidos/cliente
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Receita por Período
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.revenueByPeriod.slice(-7).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(item.date).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </p>
                        <p className="text-xs text-gray-600">{item.orders} pedidos</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(item.revenue)}</p>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{
                              width: `${(item.revenue / Math.max(...stats.revenueByPeriod.map((r) => r.revenue))) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Dishes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Pratos Mais Vendidos
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
                        <p className="text-sm text-gray-600">vendidos</p>
                        <p className="text-xs text-green-600">{formatCurrency(item.orders * item.dish.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Status dos Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {stats.ordersByStatus.map((item) => (
                  <div key={item.status} className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">{item.count}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {item.status === "pending" && "Pendentes"}
                      {item.status === "confirmed" && "Confirmados"}
                      {item.status === "preparing" && "Preparando"}
                      {item.status === "ready" && "Prontos"}
                      {item.status === "out_for_delivery" && "Saindo"}
                      {item.status === "delivered" && "Entregues"}
                      {item.status === "cancelled" && "Cancelados"}
                    </p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{
                          width: `${(item.count / Math.max(stats.totalOrders, 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-600">Erro ao carregar relatórios</h2>
          <Button onClick={loadStats} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      )}
    </div>
  )
}
