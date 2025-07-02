"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Truck, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { TableSkeleton } from "@/components/layout/skeleton"
import { useAuthStore } from "@/lib/store"
import { deliveryAPI } from "@/lib/api"
import type { DeliveryPerson } from "@/lib/types"
import toast from "react-hot-toast"

export default function AdminDeliveryPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState<{
    open: boolean
    person: DeliveryPerson | null
    isNew: boolean
  }>({
    open: false,
    person: null,
    isNew: false,
  })

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    vehicle: "",
    active: true,
  })

  useEffect(() => {
    if (user?.role !== "admin") {
      router.push("/")
      return
    }
    loadDeliveryPersons()
  }, [user, router])

  const loadDeliveryPersons = async () => {
    try {
      setLoading(true)
      const data = await deliveryAPI.getAll()
      setDeliveryPersons(data)
    } catch (error) {
      toast.error("Erro ao carregar entregadores")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (person: DeliveryPerson) => {
    setFormData({
      name: person.name,
      phone: person.phone,
      vehicle: person.vehicle,
      active: person.active,
    })
    setEditModal({ open: true, person, isNew: false })
  }

  const handleNew = () => {
    setFormData({
      name: "",
      phone: "",
      vehicle: "",
      active: true,
    })
    setEditModal({ open: true, person: null, isNew: true })
  }

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.vehicle) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    try {
      const personData = {
        name: formData.name,
        phone: formData.phone,
        vehicle: formData.vehicle,
        active: formData.active,
      }

      if (editModal.isNew) {
        await deliveryAPI.create(personData)
        toast.success("Entregador criado com sucesso!")
      } else if (editModal.person) {
        await deliveryAPI.update(editModal.person.id, personData)
        toast.success("Entregador atualizado com sucesso!")
      }

      setEditModal({ open: false, person: null, isNew: false })
      loadDeliveryPersons()
    } catch (error) {
      toast.error("Erro ao salvar entregador")
      console.error(error)
    }
  }

  const toggleActive = async (person: DeliveryPerson) => {
    try {
      await deliveryAPI.update(person.id, { active: !person.active })
      toast.success(`Entregador ${!person.active ? "ativado" : "desativado"} com sucesso!`)
      loadDeliveryPersons()
    } catch (error) {
      toast.error("Erro ao atualizar status")
      console.error(error)
    }
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gerenciar Entregadores</h1>
          <p className="text-gray-600">Gerencie sua equipe de delivery</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Entregador
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold">{deliveryPersons.filter((p) => p.active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{deliveryPersons.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold">🏍️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em Entrega</p>
                <p className="text-2xl font-bold">{deliveryPersons.filter((p) => p.currentOrders.length > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Persons List */}
      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : deliveryPersons.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Entregadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4">Telefone</th>
                    <th className="text-left py-3 px-4">Veículo</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Entregas Ativas</th>
                    <th className="text-left py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryPersons.map((person) => (
                    <tr key={person.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-orange-600" />
                          </div>
                          <span className="font-medium">{person.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{person.phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Truck className="h-4 w-4 text-gray-400" />
                          <span>{person.vehicle}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={person.active ? "default" : "secondary"}>
                          {person.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{person.currentOrders.length}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(person)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={person.active ? "secondary" : "default"}
                            size="sm"
                            onClick={() => toggleActive(person)}
                          >
                            {person.active ? "Desativar" : "Ativar"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12">
          <Truck className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Nenhum entregador cadastrado</h2>
          <p className="text-gray-500 mb-6">Adicione entregadores para começar a fazer deliveries</p>
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeiro Entregador
          </Button>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={editModal.open} onOpenChange={(open) => setEditModal({ ...editModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editModal.isNew ? "Novo Entregador" : "Editar Entregador"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Telefone *</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Veículo *</label>
              <Input
                value={formData.vehicle}
                onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                placeholder="Ex: Moto Honda CG 160"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="active" className="text-sm font-medium">
                Entregador ativo
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button variant="outline" onClick={() => setEditModal({ ...editModal, open: false })} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="flex-1">
                {editModal.isNew ? "Criar Entregador" : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
// This code is for the admin delivery management page in a restaurant delivery app.