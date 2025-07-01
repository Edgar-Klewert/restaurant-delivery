"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, UserIcon, Mail, Phone, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TableSkeleton } from "@/components/layout/skeleton"
import { formatDate } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"
import { mockUsers } from "@/lib/mock-data"
import toast from "react-hot-toast"

export default function AdminUsersPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [roleFilter, setRoleFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState({
    open: false,
    user: null,
    isNew: false,
  })

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "client",
    phone: "",
    address: "",
  })

  useEffect(() => {
    if (user?.role !== "admin") {
      router.push("/")
      return
    }
    loadUsers()
  }, [user, router])

  useEffect(() => {
    filterUsers()
  }, [users, roleFilter, searchTerm])

  const loadUsers = async () => {
    try {
      setLoading(true)
      // Simular carregamento da API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setUsers(mockUsers)
    } catch (error) {
      toast.error("Erro ao carregar usuários")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredUsers(filtered)
  }

  const handleEdit = (editUser) => {
    setFormData({
      name: editUser.name,
      email: editUser.email,
      role: editUser.role,
      phone: editUser.phone || "",
      address: editUser.address || "",
    })
    setEditModal({ open: true, user: editUser, isNew: false })
  }

  const handleNew = () => {
    setFormData({
      name: "",
      email: "",
      role: "client",
      phone: "",
      address: "",
    })
    setEditModal({ open: true, user: null, isNew: true })
  }

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Nome e email são obrigatórios")
      return
    }

    try {
      // Simular salvamento na API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (editModal.isNew) {
        const newUser = {
          ...formData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }
        setUsers([...users, newUser])
        toast.success("Usuário criado com sucesso!")
      } else if (editModal.user) {
        setUsers(users.map((u) => (u.id === editModal.user.id ? { ...u, ...formData } : u)))
        toast.success("Usuário atualizado com sucesso!")
      }

      setEditModal({ open: false, user: null, isNew: false })
    } catch (error) {
      toast.error("Erro ao salvar usuário")
      console.error(error)
    }
  }

  const handleDelete = async (deleteUser) => {
    if (!confirm(`Tem certeza que deseja excluir "${deleteUser.name}"?`)) return

    try {
      // Simular exclusão na API
      await new Promise((resolve) => setTimeout(resolve, 500))
      setUsers(users.filter((u) => u.id !== deleteUser.id))
      toast.success("Usuário excluído com sucesso!")
    } catch (error) {
      toast.error("Erro ao excluir usuário")
      console.error(error)
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "kitchen":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "kitchen":
        return "Cozinha"
      default:
        return "Cliente"
    }
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gerenciar Usuários</h1>
          <p className="text-gray-600">Gerencie todos os usuários do sistema</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">C</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clientes</p>
                <p className="text-2xl font-bold">{users.filter((u) => u.role === "client").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold text-sm">K</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cozinha</p>
                <p className="text-2xl font-bold">{users.filter((u) => u.role === "kitchen").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">A</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold">{users.filter((u) => u.role === "admin").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Perfis</SelectItem>
              <SelectItem value="client">Clientes</SelectItem>
              <SelectItem value="kitchen">Cozinha</SelectItem>
              <SelectItem value="admin">Administradores</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : filteredUsers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Usuário</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Perfil</th>
                    <th className="text-left py-3 px-4">Telefone</th>
                    <th className="text-left py-3 px-4">Cadastro</th>
                    <th className="text-left py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((userData) => (
                    <tr key={userData.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-gray-600" />
                          </div>
                          <span className="font-medium">{userData.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{userData.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getRoleBadgeColor(userData.role)}>{getRoleLabel(userData.role)}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{userData.phone || "N/A"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{formatDate(userData.createdAt)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(userData)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(userData)}
                            disabled={userData.id === user.id}
                          >
                            <Trash2 className="h-4 w-4" />
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
          <UserIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Nenhum usuário encontrado</h2>
          <p className="text-gray-500 mb-6">
            {searchTerm || roleFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Adicione o primeiro usuário ao sistema"}
          </p>
          {!searchTerm && roleFilter === "all" && (
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Usuário
            </Button>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={editModal.open} onOpenChange={(open) => setEditModal({ ...editModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editModal.isNew ? "Novo Usuário" : "Editar Usuário"}</DialogTitle>
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
              <label className="block text-sm font-medium mb-2">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Perfil *</label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Cliente</SelectItem>
                  <SelectItem value="kitchen">Cozinha</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Telefone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Endereço</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Endereço completo"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button variant="outline" onClick={() => setEditModal({ ...editModal, open: false })} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="flex-1">
                {editModal.isNew ? "Criar Usuário" : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
