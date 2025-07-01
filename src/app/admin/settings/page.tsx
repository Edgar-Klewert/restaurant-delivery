"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Settings, Save, Bell, Truck, DollarSign, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuthStore } from "@/lib/store"
import toast from "react-hot-toast"

interface AppSettings {
  general: {
    appName: string
    description: string
    supportEmail: string
    supportPhone: string
  }
  delivery: {
    baseDeliveryFee: number
    freeDeliveryMinimum: number
    maxDeliveryDistance: number
    estimatedDeliveryTime: number
  }
  business: {
    openingTime: string
    closingTime: string
    workingDays: string[]
    address: string
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
  }
  payment: {
    acceptCash: boolean
    acceptCard: boolean
    acceptPix: boolean
  }
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<AppSettings>({
    general: {
      appName: "DeliveryApp",
      description: "O melhor app de delivery da cidade",
      supportEmail: "suporte@deliveryapp.com",
      supportPhone: "(11) 99999-9999",
    },
    delivery: {
      baseDeliveryFee: 5.0,
      freeDeliveryMinimum: 50.0,
      maxDeliveryDistance: 10,
      estimatedDeliveryTime: 45,
    },
    business: {
      openingTime: "18:00",
      closingTime: "23:00",
      workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      address: "Rua Principal, 123 - Centro, São Paulo - SP",
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
    },
    payment: {
      acceptCash: true,
      acceptCard: true,
      acceptPix: true,
    },
  })

  useEffect(() => {
    if (user?.role !== "admin") {
      router.push("/")
      return
    }
    loadSettings()
  }, [user, router])

  const loadSettings = async () => {
    try {
      // Simular carregamento das configurações
      await new Promise((resolve) => setTimeout(resolve, 500))
      // As configurações já estão no estado inicial
    } catch (error) {
      toast.error("Erro ao carregar configurações")
      console.error(error)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      // Simular salvamento das configurações
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Configurações salvas com sucesso!")
    } catch (error) {
      toast.error("Erro ao salvar configurações")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = (section: keyof AppSettings, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const toggleWorkingDay = (day: string) => {
    const currentDays = settings.business.workingDays
    const newDays = currentDays.includes(day) ? currentDays.filter((d) => d !== day) : [...currentDays, day]

    updateSettings("business", "workingDays", newDays)
  }

  const getDayLabel = (day: string) => {
    const labels = {
      monday: "Segunda",
      tuesday: "Terça",
      wednesday: "Quarta",
      thursday: "Quinta",
      friday: "Sexta",
      saturday: "Sábado",
      sunday: "Domingo",
    }
    return labels[day as keyof typeof labels] || day
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Configurações do Sistema</h1>
          <p className="text-gray-600">Gerencie as configurações gerais da aplicação</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome da Aplicação</label>
              <Input
                value={settings.general.appName}
                onChange={(e) => updateSettings("general", "appName", e.target.value)}
                placeholder="Nome da aplicação"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <Textarea
                value={settings.general.description}
                onChange={(e) => updateSettings("general", "description", e.target.value)}
                placeholder="Descrição da aplicação"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email de Suporte</label>
              <Input
                type="email"
                value={settings.general.supportEmail}
                onChange={(e) => updateSettings("general", "supportEmail", e.target.value)}
                placeholder="suporte@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Telefone de Suporte</label>
              <Input
                value={settings.general.supportPhone}
                onChange={(e) => updateSettings("general", "supportPhone", e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Configurações de Delivery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Taxa Base de Entrega (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={settings.delivery.baseDeliveryFee}
                onChange={(e) => updateSettings("delivery", "baseDeliveryFee", Number.parseFloat(e.target.value))}
                placeholder="5.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Valor Mínimo para Frete Grátis (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={settings.delivery.freeDeliveryMinimum}
                onChange={(e) => updateSettings("delivery", "freeDeliveryMinimum", Number.parseFloat(e.target.value))}
                placeholder="50.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Distância Máxima de Entrega (km)</label>
              <Input
                type="number"
                value={settings.delivery.maxDeliveryDistance}
                onChange={(e) => updateSettings("delivery", "maxDeliveryDistance", Number.parseInt(e.target.value))}
                placeholder="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tempo Estimado de Entrega (min)</label>
              <Input
                type="number"
                value={settings.delivery.estimatedDeliveryTime}
                onChange={(e) => updateSettings("delivery", "estimatedDeliveryTime", Number.parseInt(e.target.value))}
                placeholder="45"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações do Negócio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Horário de Funcionamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Abertura</label>
                <Input
                  type="time"
                  value={settings.business.openingTime}
                  onChange={(e) => updateSettings("business", "openingTime", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fechamento</label>
                <Input
                  type="time"
                  value={settings.business.closingTime}
                  onChange={(e) => updateSettings("business", "closingTime", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Dias de Funcionamento</label>
              <div className="grid grid-cols-2 gap-2">
                {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                  <label key={day} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.business.workingDays.includes(day)}
                      onChange={() => toggleWorkingDay(day)}
                      className="rounded"
                    />
                    <span className="text-sm">{getDayLabel(day)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Endereço do Estabelecimento</label>
              <Textarea
                value={settings.business.address}
                onChange={(e) => updateSettings("business", "address", e.target.value)}
                placeholder="Endereço completo"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => updateSettings("notifications", "emailNotifications", e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium">Notificações por Email</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.notifications.smsNotifications}
                  onChange={(e) => updateSettings("notifications", "smsNotifications", e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium">Notificações por SMS</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.notifications.pushNotifications}
                  onChange={(e) => updateSettings("notifications", "pushNotifications", e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium">Notificações Push</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Métodos de Pagamento */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Métodos de Pagamento Aceitos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <label className="flex items-center space-x-3 p-4 border rounded-lg">
                <input
                  type="checkbox"
                  checked={settings.payment.acceptCash}
                  onChange={(e) => updateSettings("payment", "acceptCash", e.target.checked)}
                  className="rounded"
                />
                <div>
                  <span className="font-medium">Dinheiro</span>
                  <p className="text-sm text-gray-600">Pagamento em espécie</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-4 border rounded-lg">
                <input
                  type="checkbox"
                  checked={settings.payment.acceptCard}
                  onChange={(e) => updateSettings("payment", "acceptCard", e.target.checked)}
                  className="rounded"
                />
                <div>
                  <span className="font-medium">Cartão</span>
                  <p className="text-sm text-gray-600">Débito e crédito</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-4 border rounded-lg">
                <input
                  type="checkbox"
                  checked={settings.payment.acceptPix}
                  onChange={(e) => updateSettings("payment", "acceptPix", e.target.checked)}
                  className="rounded"
                />
                <div>
                  <span className="font-medium">PIX</span>
                  <p className="text-sm text-gray-600">Transferência instantânea</p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
