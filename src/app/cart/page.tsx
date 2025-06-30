"use client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { useCartStore, useAuthStore } from "@/lib/store"

export default function CartPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore()

  if (!user || user.role !== "client") {
    router.push("/")
    return null
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Seu carrinho está vazio</h2>
          <p className="text-gray-600 mb-6">Adicione alguns pratos deliciosos ao seu carrinho!</p>
          <Button onClick={() => router.push("/")} size="lg">
            Ver Cardápio
          </Button>
        </div>
      </div>
    )
  }

  const subtotal = getTotalPrice()
  const deliveryFee = 5.0 // Valor fixo para demo
  const total = subtotal + deliveryFee

  const handleProceedToCheckout = () => {
    router.push("/checkout")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Meu Carrinho</h1>
          <Button variant="outline" onClick={clearCart}>
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Carrinho
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.dish.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={item.dish.image || "/placeholder.svg"}
                      alt={item.dish.name}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.dish.name}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{item.dish.description}</p>
                      {item.observations && <p className="text-sm text-orange-600 mt-1">Obs: {item.observations}</p>}
                      <p className="font-bold text-orange-600 mt-2">{formatCurrency(item.dish.price)}</p>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.dish.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.dish.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <p className="font-bold">{formatCurrency(item.dish.price * item.quantity)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de entrega</span>
                    <span>{formatCurrency(deliveryFee)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-orange-600">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                <Button onClick={handleProceedToCheckout} className="w-full" size="lg">
                  Finalizar Pedido
                </Button>

                <Button variant="outline" onClick={() => router.push("/")} className="w-full">
                  Continuar Comprando
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
