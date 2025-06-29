import type { User, Category, Dish, Order, DeliveryPerson, Rating, DashboardStats, OrderStatus } from "./types"
import { mockUsers, mockCategories, mockDishes, mockOrders, mockDeliveryPersons, mockRatings } from "./mock-data"

// Simular delay de rede
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock API para autenticação
export const authAPI = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await delay(1000)

    const user = mockUsers.find((u) => u.email === email)
    if (!user) {
      throw new Error("Usuário não encontrado")
    }

    // Simular validação de senha (em produção seria hash)
    if (password !== "123456") {
      throw new Error("Senha incorreta")
    }

    return {
      user,
      token: `mock-token-${user.id}`,
    }
  },

  async register(userData: Omit<User, "id" | "createdAt">): Promise<{ user: User; token: string }> {
    await delay(1000)

    const existingUser = mockUsers.find((u) => u.email === userData.email)
    if (existingUser) {
      throw new Error("Email já cadastrado")
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    mockUsers.push(newUser)

    return {
      user: newUser,
      token: `mock-token-${newUser.id}`,
    }
  },

  async getCurrentUser(token: string): Promise<User> {
    await delay(500)

    const userId = token.replace("mock-token-", "")
    const user = mockUsers.find((u) => u.id === userId)

    if (!user) {
      throw new Error("Token inválido")
    }

    return user
  },
}

// Mock API para categorias
export const categoriesAPI = {
  async getAll(): Promise<Category[]> {
    await delay(500)
    return mockCategories.filter((cat) => cat.active)
  },

  async getById(id: string): Promise<Category> {
    await delay(300)
    const category = mockCategories.find((cat) => cat.id === id)
    if (!category) {
      throw new Error("Categoria não encontrada")
    }
    return category
  },

  async create(categoryData: Omit<Category, "id">): Promise<Category> {
    await delay(800)
    const newCategory: Category = {
      ...categoryData,
      id: Date.now().toString(),
    }
    mockCategories.push(newCategory)
    return newCategory
  },

  async update(id: string, categoryData: Partial<Category>): Promise<Category> {
    await delay(800)
    const index = mockCategories.findIndex((cat) => cat.id === id)
    if (index === -1) {
      throw new Error("Categoria não encontrada")
    }
    mockCategories[index] = { ...mockCategories[index], ...categoryData }
    return mockCategories[index]
  },

  async delete(id: string): Promise<void> {
    await delay(500)
    const index = mockCategories.findIndex((cat) => cat.id === id)
    if (index === -1) {
      throw new Error("Categoria não encontrada")
    }
    mockCategories[index].active = false
  },
}

// Mock API para pratos
export const dishesAPI = {
  async getAll(categoryId?: string): Promise<Dish[]> {
    await delay(700)
    let dishes = mockDishes.filter((dish) => dish.active)

    if (categoryId) {
      dishes = dishes.filter((dish) => dish.categoryId === categoryId)
    }

    return dishes
  },

  async getById(id: string): Promise<Dish> {
    await delay(300)
    const dish = mockDishes.find((d) => d.id === id)
    if (!dish) {
      throw new Error("Prato não encontrado")
    }
    return dish
  },

  async create(dishData: Omit<Dish, "id" | "ratings" | "averageRating" | "totalRatings">): Promise<Dish> {
    await delay(1000)
    const newDish: Dish = {
      ...dishData,
      id: Date.now().toString(),
      ratings: [],
      averageRating: 0,
      totalRatings: 0,
    }
    mockDishes.push(newDish)
    return newDish
  },

  async update(id: string, dishData: Partial<Dish>): Promise<Dish> {
    await delay(800)
    const index = mockDishes.findIndex((dish) => dish.id === id)
    if (index === -1) {
      throw new Error("Prato não encontrado")
    }
    mockDishes[index] = { ...mockDishes[index], ...dishData }
    return mockDishes[index]
  },

  async delete(id: string): Promise<void> {
    await delay(500)
    const index = mockDishes.findIndex((dish) => dish.id === id)
    if (index === -1) {
      throw new Error("Prato não encontrado")
    }
    mockDishes[index].active = false
  },
}

// Mock API para pedidos
export const ordersAPI = {
  async getAll(status?: OrderStatus): Promise<Order[]> {
    await delay(600)
    let orders = [...mockOrders]

    if (status) {
      orders = orders.filter((order) => order.status === status)
    }

    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async getById(id: string): Promise<Order> {
    await delay(300)
    const order = mockOrders.find((o) => o.id === id)
    if (!order) {
      throw new Error("Pedido não encontrado")
    }
    return order
  },

  async getByClientId(clientId: string): Promise<Order[]> {
    await delay(500)
    return mockOrders
      .filter((order) => order.clientId === clientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async create(orderData: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<Order> {
    await delay(1200)
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockOrders.push(newOrder)
    return newOrder
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    await delay(800)
    const index = mockOrders.findIndex((order) => order.id === id)
    if (index === -1) {
      throw new Error("Pedido não encontrado")
    }
    mockOrders[index].status = status
    mockOrders[index].updatedAt = new Date().toISOString()
    return mockOrders[index]
  },

  async assignDeliveryPerson(orderId: string, deliveryPersonId: string): Promise<Order> {
    await delay(600)
    const index = mockOrders.findIndex((order) => order.id === orderId)
    if (index === -1) {
      throw new Error("Pedido não encontrado")
    }
    mockOrders[index].deliveryPersonId = deliveryPersonId
    mockOrders[index].updatedAt = new Date().toISOString()
    return mockOrders[index]
  },
}

// Mock API para entregadores
export const deliveryAPI = {
  async getAll(): Promise<DeliveryPerson[]> {
    await delay(400)
    return mockDeliveryPersons.filter((dp) => dp.active)
  },

  async getById(id: string): Promise<DeliveryPerson> {
    await delay(300)
    const deliveryPerson = mockDeliveryPersons.find((dp) => dp.id === id)
    if (!deliveryPerson) {
      throw new Error("Entregador não encontrado")
    }
    return deliveryPerson
  },

  async create(deliveryData: Omit<DeliveryPerson, "id" | "currentOrders">): Promise<DeliveryPerson> {
    await delay(800)
    const newDeliveryPerson: DeliveryPerson = {
      ...deliveryData,
      id: Date.now().toString(),
      currentOrders: [],
    }
    mockDeliveryPersons.push(newDeliveryPerson)
    return newDeliveryPerson
  },

  async update(id: string, deliveryData: Partial<DeliveryPerson>): Promise<DeliveryPerson> {
    await delay(600)
    const index = mockDeliveryPersons.findIndex((dp) => dp.id === id)
    if (index === -1) {
      throw new Error("Entregador não encontrado")
    }
    mockDeliveryPersons[index] = { ...mockDeliveryPersons[index], ...deliveryData }
    return mockDeliveryPersons[index]
  },

  async calculateDeliveryFee(): Promise<number> {
    await delay(1000)
    // Simular cálculo de frete baseado no endereço
    const baseDistance = Math.random() * 10 + 1 // 1-11 km
    const feePerKm = 1.5
    return Math.round(baseDistance * feePerKm * 100) / 100
  },
}

// Mock API para avaliações
export const ratingsAPI = {
  async getByDishId(dishId: string): Promise<Rating[]> {
    await delay(400)
    return mockRatings.filter((rating) => rating.dishId === dishId)
  },

  async create(ratingData: Omit<Rating, "id" | "createdAt">): Promise<Rating> {
    await delay(800)
    const newRating: Rating = {
      ...ratingData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    mockRatings.push(newRating)

    // Atualizar estatísticas do prato
    const dishIndex = mockDishes.findIndex((dish) => dish.id === ratingData.dishId)
    if (dishIndex !== -1) {
      const dishRatings = mockRatings.filter((r) => r.dishId === ratingData.dishId)
      const totalRating = dishRatings.reduce((sum, r) => sum + r.rating, 0)
      mockDishes[dishIndex].averageRating = totalRating / dishRatings.length
      mockDishes[dishIndex].totalRatings = dishRatings.length
      mockDishes[dishIndex].ratings = dishRatings
    }

    return newRating
  },

  async update(id: string, ratingData: Partial<Rating>): Promise<Rating> {
    await delay(600)
    const index = mockRatings.findIndex((rating) => rating.id === id)
    if (index === -1) {
      throw new Error("Avaliação não encontrada")
    }
    mockRatings[index] = { ...mockRatings[index], ...ratingData }
    return mockRatings[index]
  },

  async delete(id: string): Promise<void> {
    await delay(500)
    const index = mockRatings.findIndex((rating) => rating.id === id)
    if (index === -1) {
      throw new Error("Avaliação não encontrada")
    }
    mockRatings.splice(index, 1)
  },
}

// Mock API para dashboard/relatórios
export const dashboardAPI = {
  async getStats(startDate?: string, endDate?: string): Promise<DashboardStats> {
    await delay(1000)

    // Simular filtro por período
    let filteredOrders = mockOrders
    if (startDate && endDate) {
      filteredOrders = mockOrders.filter((order) => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= new Date(startDate) && orderDate <= new Date(endDate)
      })
    }

    const totalOrders = filteredOrders.length
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0)
    const averageOrderValue = totalRevenue / totalOrders || 0

    // Contar clientes únicos
    const uniqueClients = new Set(filteredOrders.map((order) => order.clientId))
    const totalClients = uniqueClients.size

    // Pratos mais populares
    const dishCounts: Record<string, number> = {}
    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        dishCounts[item.dishId] = (dishCounts[item.dishId] || 0) + item.quantity
      })
    })

    const popularDishes = Object.entries(dishCounts)
      .map(([dishId, count]) => ({
        dish: mockDishes.find((d) => d.id === dishId)!,
        orders: count,
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5)

    // Receita por período (últimos 7 dias)
    const revenueByPeriod = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayOrders = filteredOrders.filter((order) => order.createdAt.startsWith(dateStr))

      return {
        date: dateStr,
        revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
        orders: dayOrders.length,
      }
    }).reverse()

    // Pedidos por status
    const statusCounts: Record<OrderStatus, number> = {
      pending: 0,
      confirmed: 0,
      preparing: 0,
      ready: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
    }

    filteredOrders.forEach((order) => {
      statusCounts[order.status]++
    })

    const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status: status as OrderStatus,
      count,
    }))

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      totalClients,
      popularDishes,
      revenueByPeriod,
      ordersByStatus,
    }
  },
}
