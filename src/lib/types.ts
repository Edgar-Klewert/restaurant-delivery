export interface User {
  id: string
  name: string
  email: string
  role: "client" | "admin" | "kitchen"
  phone?: string
  address?: string
  avatar?: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  description: string
  image: string
  active: boolean
}

export interface Dish {
  id: string
  name: string
  description: string
  price: number
  image: string
  categoryId: string
  category?: Category
  active: boolean
  preparationTime: number
  ingredients: string[]
  ratings: Rating[]
  averageRating: number
  totalRatings: number
}

export interface CartItem {
  dish: Dish
  quantity: number
  observations?: string
}

export interface Order {
  id: string
  clientId: string
  client?: User
  items: OrderItem[]
  status: OrderStatus
  type: "delivery" | "takeaway"
  total: number
  deliveryFee: number
  address?: string
  phone: string
  observations?: string
  createdAt: string
  updatedAt: string
  estimatedTime: number
  deliveryPersonId?: string
  deliveryPerson?: DeliveryPerson
}

export interface OrderItem {
  id: string
  dishId: string
  dish: Dish
  quantity: number
  price: number
  observations?: string
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"

export interface DeliveryPerson {
  id: string
  name: string
  phone: string
  vehicle: string
  active: boolean
  currentOrders: string[]
}

export interface Rating {
  id: string
  userId: string
  user?: User
  dishId: string
  orderId: string
  rating: number
  comment?: string
  createdAt: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "success" | "error" | "info" | "warning"
  read: boolean
  createdAt: string
}

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  totalClients: number
  popularDishes: Array<{
    dish: Dish
    orders: number
  }>
  revenueByPeriod: Array<{
    date: string
    revenue: number
    orders: number
  }>
  ordersByStatus: Array<{
    status: OrderStatus
    count: number
  }>
}
