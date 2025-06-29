"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authAPI } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import toast from "react-hot-toast"

export default function LoginPage() {
  const router = useRouter()
  const { login, user } = useAuthStore()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      // Se já está logado, redirecionar baseado no role
      switch (user.role) {
        case "admin":
          router.replace("/admin")
          break
        case "kitchen":
          router.replace("/kitchen")
          break
        default:
          router.replace("/")
      }
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast.error("Preencha todos os campos")
      return
    }

    try {
      setLoading(true)
      const { user, token } = await authAPI.login(formData.email, formData.password)

      login(user, token)
      toast.success(`Bem-vindo, ${user.name}!`)

      // Redirecionar baseado no tipo de usuário
      switch (user.role) {
        case "admin":
          router.replace("/admin")
          break
        case "kitchen":
          router.replace("/kitchen")
          break
        default:
          router.replace("/")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (role: "client" | "admin" | "kitchen") => {
    const demoCredentials = {
      client: { email: "joao@cliente.com", password: "123456" },
      admin: { email: "maria@admin.com", password: "123456" },
      kitchen: { email: "carlos@kitchen.com", password: "123456" },
    }

    const credentials = demoCredentials[role]
    setFormData(credentials)

    try {
      setLoading(true)
      const { user, token } = await authAPI.login(credentials.email, credentials.password)

      login(user, token)
      toast.success(`Login demo como ${role}!`)

      switch (user.role) {
        case "admin":
          router.replace("/admin")
          break
        case "kitchen":
          router.replace("/kitchen")
          break
        default:
          router.replace("/")
      }
    } catch (error) {
      toast.error("Erro no login demo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Entrar na sua conta</h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{" "}
            <Link href="/register" className="font-medium text-orange-600 hover:text-orange-500">
              cadastre-se gratuitamente
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Digite suas credenciais para acessar o sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Sua senha"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ou teste com</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin("client")}
                  disabled={loading}
                  className="text-xs"
                >
                  Cliente
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin("kitchen")}
                  disabled={loading}
                  className="text-xs"
                >
                  Cozinha
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin("admin")}
                  disabled={loading}
                  className="text-xs"
                >
                  Admin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
