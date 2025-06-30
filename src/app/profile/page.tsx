"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, MapPin, Edit, Save, X, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import { useAuthStore } from "@/lib/store"
import toast from "react-hot-toast"
import Image from "next/image"

export default function ProfilePage() {
  const router = useRouter()
  const { user, updateUser } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "client") {
      router.push("/")
      return
    }

    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      avatar: user.avatar || "",
    })
  }, [user, router])

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Nome e email são obrigatórios")
      return
    }

    try {
      setLoading(true)
      // Simular atualização via API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      updateUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        avatar: formData.avatar,
      })

      toast.success("Perfil atualizado com sucesso!")
      setEditing(false)
    } catch (error) {
      toast.error("Erro ao atualizar perfil")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (!user) return

    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      avatar: user.avatar || "",
    })
    setEditing(false)
  }

  if (!user || user.role !== "client") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Meu Perfil</h1>
            <p className="text-sm sm:text-base text-gray-600">Gerencie suas informações pessoais</p>
          </div>
          {!editing && (
            <Button onClick={() => setEditing(true)} className="w-full sm:w-auto">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {formData.avatar ? (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden">
                    <Image
                      src={formData.avatar || "/placeholder.svg"}
                      alt="Avatar"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  </div>
                )}
                {editing && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    onClick={() => {
                      // Trigger image upload modal or file input
                    }}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {editing && (
                <div className="w-full max-w-xs">
                  <label className="block text-sm font-medium mb-2 text-center">Foto de Perfil</label>
                  <ImageUpload
                    value={formData.avatar}
                    onChange={(value) => setFormData({ ...formData, avatar: value })}
                    placeholder="Adicionar foto"
                    className="h-32"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Nome Completo</label>
                {editing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Seu nome completo"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm sm:text-base">{user.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                {editing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm sm:text-base break-all">{user.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Telefone</label>
              {editing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm sm:text-base">{user.phone || "Não informado"}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Endereço</label>
              {editing ? (
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Seu endereço completo"
                  rows={3}
                />
              ) : (
                <div className="flex items-start space-x-2 p-3 bg-gray-50 rounded-md">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-sm sm:text-base">{user.address || "Não informado"}</span>
                </div>
              )}
            </div>

            {editing && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                <Button onClick={handleSave} disabled={loading} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={loading} className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm font-medium">Tipo de Conta:</span>
              <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded capitalize w-fit">
                {user.role}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm font-medium">Membro desde:</span>
              <span className="text-sm text-gray-600">{new Date(user.createdAt).toLocaleDateString("pt-BR")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
