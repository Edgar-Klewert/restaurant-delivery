import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, CartItem, Order, Notification } from "./types"

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (dishId: string) => void
  updateQuantity: (dishId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

interface NotificationState {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void
  markAsRead: (id: string) => void
  clearNotifications: () => void
  getUnreadCount: () => number
}

interface OrderState {
  currentOrder: Order | null
  orderHistory: Order[]
  setCurrentOrder: (order: Order | null) => void
  addToHistory: (order: Order) => void
  updateOrderStatus: (orderId: string, status: Order["status"]) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } })
        }
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const items = get().items
        const existingItemIndex = items.findIndex((item) => item.dish.id === newItem.dish.id)

        if (existingItemIndex >= 0) {
          const updatedItems = [...items]
          updatedItems[existingItemIndex].quantity += newItem.quantity
          set({ items: updatedItems })
        } else {
          set({ items: [...items, newItem] })
        }
      },
      removeItem: (dishId) => {
        set({ items: get().items.filter((item) => item.dish.id !== dishId) })
      },
      updateQuantity: (dishId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(dishId)
          return
        }

        const items = get().items.map((item) => (item.dish.id === dishId ? { ...item, quantity } : item))
        set({ items })
      },
      clearCart: () => {
        set({ items: [] })
      },
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.dish.price * item.quantity, 0)
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date().toISOString(),
    }
    set({ notifications: [newNotification, ...get().notifications] })
  },
  markAsRead: (id) => {
    const notifications = get().notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification,
    )
    set({ notifications })
  },
  clearNotifications: () => {
    set({ notifications: [] })
  },
  getUnreadCount: () => {
    return get().notifications.filter((notification) => !notification.read).length
  },
}))

export const useOrderStore = create<OrderState>()((set, get) => ({
  currentOrder: null,
  orderHistory: [],
  setCurrentOrder: (order) => {
    set({ currentOrder: order })
  },
  addToHistory: (order) => {
    set({ orderHistory: [order, ...get().orderHistory] })
  },
  updateOrderStatus: (orderId, status) => {
    const currentOrder = get().currentOrder
    if (currentOrder && currentOrder.id === orderId) {
      set({ currentOrder: { ...currentOrder, status } as Order })
    }

    const orderHistory = get().orderHistory.map((order) => (order.id === orderId ? { ...order, status } : order))
    set({ orderHistory })
  },
}))
