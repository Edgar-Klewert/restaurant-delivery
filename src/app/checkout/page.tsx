"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, CreditCard, Truck, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { useCartStore, useAuthStore, useOrderStore, useNotificationStore } from "@/lib/store"
import { ordersAPI, deliveryAPI } from "@/lib/api"
import type { Order } from "@/lib/types"
import toast from "react-hot-toast"

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { setCurrentOrder, addToHistory } = useOrderStore()
  const { addNotification } = useNotificationStore()

  const [orderType, setOrderType] = useState<"delivery" | "takeaway">("delivery")
  const [address, setAddress] = useState(user?.address || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [observations, setObservations] = useState("")
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [loading, setLoading] = useState(false)
  const [calculatingFee, setCalculatingFee] = useState(false)

  useEffect(() => {
    if (orderType === "delivery" && address) {
      calculateDeliveryFee()
    } else {
      setDeliveryFee(0)
    }
  }, [orderType, address])

  if (!user || user.role !== "client") {
    router.push("/")
    return null
  }

  if (items.length === 0) {
    router.push("/cart")
    return null
  }

  const calculateDeliveryFee = async () => {
    try {
      setCalculatingFee(true)
      const fee = await deliveryAPI.calculateDeliveryFee(address)
      setDeliveryFee(fee)
    } catch (error) {
      toast.error("Erro ao calcular frete")
      setDeliveryFee(5.0) // Fallback
    } finally {
      setCalculatingFee(false)
    }
  }

  const subtotal = getTotalPrice()
  const total = subtotal + (orderType === "delivery" ? deliveryFee : 0)

  const handleSubmitOrder = async () => {
    if (!phone) {
      toast.error("Telefone é obrigatório")
      return
    }

    if (orderType === "delivery" && !address) {
      toast.error("Endereço é obrigatório para delivery")
      return
    }

    try {
      setLoading(true)

      const orderData: Omit<Order, "id" | "createdAt" | "updatedAt"> = {
        clientId: user.id,
        items: items.map((item, index) => ({
          id: (index + 1).toString(),
          dishId: item.dish.id,
          dish: item.dish,
          quantity: item.quantity,
          price: item.dish.price,
          observations: item.observations,
        })),
        status: "pending",
        type: orderType,
        total,
        deliveryFee: orderType === "delivery" ? deliveryFee : 0,
        address: orderType === "delivery" ? address : undefined,
        phone,
        observations: observations.trim() || undefined,
        estimatedTime: orderType === "delivery" ? 45 : 25,
      }

      const newOrder = await ordersAPI.create(orderData)

      // Update stores
      setCurrentOrder(newOrder)
      addToHistory(newOrder)
      clearCart()

      // Add notification
      addNotification({
        title: "Pedido Realizado!",
        message: `Seu pedido #${newOrder.id} foi recebido e está sendo processado.`,
        type: "success",
      })

      toast.success("Pedido realizado com sucesso!")
      router.push(`/orders/${newOrder.id}`)
    } catch (error) {
      toast.error("Erro ao realizar pedido")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Finalizar Pedido</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Tipo de Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={orderType === "delivery" ? "default" : "outline"}
                    onClick={() => setOrderType("delivery")}
                    className="h-20 flex-col"
                  >
                    <Truck className="h-6 w-6 mb-2" />
                    Delivery
                  </Button>
                  <Button
                    variant={orderType === "takeaway" ? "default" : "outline"}
                    onClick={() => setOrderType("takeaway")}
                    className="h-20 flex-col"
                  >
                    <Store className="h-6 w-6 mb-2" />
                    Retirada
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            {orderType === "delivery" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Endereço Completo *</label>
                    <Textarea
                      placeholder="Rua, número, bairro, cidade..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                    />
                  </div>
                  {calculatingFee && <p className="text-sm text-gray-600">Calculando frete...</p>}
                </CardContent>
              </Card>
            )}

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Telefone *</label>
                  <Input placeholder="(11) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Observações (opcional)</label>
                  <Textarea
                    placeholder="Instruções especiais, ponto de referência..."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Forma de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select defaultValue="money">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="money">Dinheiro</SelectItem>
                    <SelectItem value="card">Cartão na Entrega</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.dish.id} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.dish.name}
                      </span>
                      <span>{formatCurrency(item.dish.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {orderType === "delivery" && (
                    <div className="flex justify-between">
                      <span>Taxa de entrega</span>
                      <span>{calculatingFee ? "..." : formatCurrency(deliveryFee)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-orange-600">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  Tempo estimado: {orderType === "delivery" ? "45" : "25"} minutos
                </div>

                <Button onClick={handleSubmitOrder} disabled={loading || calculatingFee} className="w-full" size="lg">
                  {loading ? "Processando..." : `Confirmar Pedido - ${formatCurrency(total)}`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
