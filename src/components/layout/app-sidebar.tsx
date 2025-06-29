"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  ChefHat,
  BarChart3,
  Truck,
  ClipboardList,
  User,
  LogOut,
  Bell,
  Settings,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthStore, useCartStore, useNotificationStore } from "@/lib/store"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { getTotalItems } = useCartStore()
  const { getUnreadCount } = useNotificationStore()

  const cartItemsCount = getTotalItems()
  const unreadNotifications = getUnreadCount()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!user) return null

  const getMenuItems = () => {
    switch (user.role) {
      case "client":
        return [
          {
            title: "Principal",
            items: [
              {
                title: "Cardápio",
                url: "/",
                icon: Home,
                isActive: pathname === "/",
              },
              {
                title: "Carrinho",
                url: "/cart",
                icon: ShoppingCart,
                isActive: pathname === "/cart",
                badge: cartItemsCount > 0 ? cartItemsCount : undefined,
              },
              {
                title: "Meus Pedidos",
                url: "/orders",
                icon: ClipboardList,
                isActive: pathname.startsWith("/orders"),
              },
            ],
          },
          {
            title: "Conta",
            items: [
              {
                title: "Perfil",
                url: "/profile",
                icon: User,
                isActive: pathname === "/profile",
              },
              {
                title: "Notificações",
                url: "/notifications",
                icon: Bell,
                isActive: pathname === "/notifications",
                badge: unreadNotifications > 0 ? unreadNotifications : undefined,
              },
            ],
          },
        ]

      case "kitchen":
        return [
          {
            title: "Cozinha",
            items: [
              {
                title: "Pedidos Ativos",
                url: "/kitchen",
                icon: ChefHat,
                isActive: pathname === "/kitchen",
              },
              {
                title: "Cardápio",
                url: "/kitchen/menu",
                icon: Package,
                isActive: pathname === "/kitchen/menu",
              },
            ],
          },
        ]

      case "admin":
        return [
          {
            title: "Administração",
            items: [
              {
                title: "Dashboard",
                url: "/admin",
                icon: BarChart3,
                isActive: pathname === "/admin",
              },
              {
                title: "Pedidos",
                url: "/admin/orders",
                icon: ClipboardList,
                isActive: pathname === "/admin/orders",
              },
              {
                title: "Cardápio",
                url: "/admin/menu",
                icon: Package,
                isActive: pathname === "/admin/menu",
              },
              {
                title: "Entregadores",
                url: "/admin/delivery",
                icon: Truck,
                isActive: pathname === "/admin/delivery",
              },
              {
                title: "Relatórios",
                url: "/admin/reports",
                icon: BarChart3,
                isActive: pathname === "/admin/reports",
              },
            ],
          },
          {
            title: "Sistema",
            items: [
              {
                title: "Usuários",
                url: "/admin/users",
                icon: Users,
                isActive: pathname === "/admin/users",
              },
              {
                title: "Configurações",
                url: "/admin/settings",
                icon: Settings,
                isActive: pathname === "/admin/settings",
              },
            ],
          },
        ]

      default:
        return []
    }
  }

  const menuGroups = getMenuItems()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center space-x-2 px-4 py-3">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <div>
            <h2 className="font-semibold text-sidebar-foreground">DeliveryApp</h2>
            <p className="text-xs text-sidebar-foreground/70 capitalize">{user.role}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <Link href={item.url} className="flex items-center">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center space-x-3 px-4 py-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">{user.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 w-8 p-0">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
