"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuthStore, useNotificationStore } from "@/lib/store"
import { useState, useEffect } from "react"

export function Header() {
  const { user } = useAuthStore()
  const { getUnreadCount } = useNotificationStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const unreadNotifications = getUnreadCount()

  if (isLoading) {
    return (
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="animate-pulse bg-gray-200 rounded h-8 w-24"></div>
        </div>
      </header>
    )
  }

  if (!user) {
    return (
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            DeliveryApp
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold">
              {user.role === "client" && "Cardápio"}
              {user.role === "kitchen" && "Painel da Cozinha"}
              {user.role === "admin" && "Painel Administrativo"}
            </h1>
          </div>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
