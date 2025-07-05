"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, Check, Trash2, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuthStore, useNotificationStore } from "@/lib/store"
import { formatDate } from "@/lib/utils"

export default function NotificationsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { notifications, markAsRead, clearNotifications } = useNotificationStore()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
  }, [user, router])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-l-green-500 bg-green-50"
      case "error":
        return "border-l-red-500 bg-red-50"
      case "warning":
        return "border-l-yellow-500 bg-yellow-50"
      default:
        return "border-l-blue-500 bg-blue-50"
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Notificações</h1>
            <p className="text-gray-600">
              {notifications.length > 0
                ? `Você tem ${notifications.filter((n) => !n.read).length} notificações não lidas`
                : "Nenhuma notificação"}
            </p>
          </div>
          {notifications.length > 0 && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => notifications.forEach((n) => !n.read && markAsRead(n.id))}
                disabled={notifications.filter((n) => !n.read).length === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Marcar Todas como Lidas
              </Button>
              <Button variant="destructive" onClick={clearNotifications}>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Todas
              </Button>
            </div>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">Nenhuma notificação</h2>
              <p className="text-gray-500">Suas notificações aparecerão aqui</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border-l-4 ${getNotificationColor(notification.type)} ${
                  !notification.read ? "ring-2 ring-orange-200" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                          {!notification.read && (
                            <Badge variant="default" className="text-xs">
                              Nova
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">{formatDate(notification.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!notification.read && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
