import type { User, Category, Dish, Order, DeliveryPerson, Rating } from "./types"

export const mockUsers: User[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@cliente.com",
    role: "client",
    phone: "(11) 99999-9999",
    address: "Rua das Flores, 123 - São Paulo, SP",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@admin.com",
    role: "admin",
    phone: "(11) 88888-8888",
    createdAt: "2024-01-10T08:00:00Z",
  },
  {
    id: "3",
    name: "Carlos Cozinha",
    email: "carlos@kitchen.com",
    role: "kitchen",
    phone: "(11) 77777-7777",
    createdAt: "2024-01-12T09:00:00Z",
  },
]

export const mockCategories: Category[] = [
  {
    id: "1",
    name: "Pizzas",
    description: "Deliciosas pizzas artesanais",
    image: "/placeholder.svg?height=200&width=300",
    active: true,
  },
  {
    id: "2",
    name: "Hambúrgueres",
    description: "Hambúrgueres suculentos",
    image: "/placeholder.svg?height=200&width=300",
    active: true,
  },
  {
    id: "3",
    name: "Bebidas",
    description: "Bebidas geladas e refrescantes",
    image: "/placeholder.svg?height=200&width=300",
    active: true,
  },
  {
    id: "4",
    name: "Sobremesas",
    description: "Doces irresistíveis",
    image: "/placeholder.svg?height=200&width=300",
    active: true,
  },
]

export const mockRatings: Rating[] = [
  {
    id: "1",
    userId: "1",
    dishId: "1",
    orderId: "1",
    rating: 5,
    comment: "Pizza excelente! Massa perfeita e ingredientes frescos.",
    createdAt: "2024-01-20T19:30:00Z",
  },
  {
    id: "2",
    userId: "1",
    dishId: "2",
    orderId: "2",
    rating: 4,
    comment: "Hambúrguer muito bom, só achei que poderia ter mais molho.",
    createdAt: "2024-01-22T20:15:00Z",
  },
]

export const mockDishes: Dish[] = [
  {
    id: "1",
    name: "Pizza Margherita",
    description: "Pizza clássica com molho de tomate, mussarela e manjericão fresco",
    price: 35.9,
    image: "/placeholder.svg?height=300&width=400",
    categoryId: "1",
    active: true,
    preparationTime: 25,
    ingredients: ["Massa artesanal", "Molho de tomate", "Mussarela", "Manjericão", "Azeite"],
    ratings: [mockRatings[0]],
    averageRating: 5,
    totalRatings: 1,
  },
  {
    id: "2",
    name: "Hambúrguer Clássico",
    description: "Hambúrguer de carne bovina, alface, tomate, cebola e molho especial",
    price: 28.5,
    image: "/placeholder.svg?height=300&width=400",
    categoryId: "2",
    active: true,
    preparationTime: 15,
    ingredients: ["Pão brioche", "Carne 180g", "Alface", "Tomate", "Cebola", "Molho especial"],
    ratings: [mockRatings[1]],
    averageRating: 4,
    totalRatings: 1,
  },
  {
    id: "3",
    name: "Coca-Cola 350ml",
    description: "Refrigerante gelado",
    price: 5.5,
    image: "/placeholder.svg?height=300&width=400",
    categoryId: "3",
    active: true,
    preparationTime: 2,
    ingredients: ["Coca-Cola 350ml"],
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
  },
  {
    id: "4",
    name: "Brownie com Sorvete",
    description: "Brownie de chocolate quente com sorvete de baunilha",
    price: 18.9,
    image: "/placeholder.svg?height=300&width=400",
    categoryId: "4",
    active: true,
    preparationTime: 10,
    ingredients: ["Brownie de chocolate", "Sorvete de baunilha", "Calda de chocolate"],
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
  },
]

export const mockDeliveryPersons: DeliveryPerson[] = [
  {
    id: "1",
    name: "Pedro Entregador",
    phone: "(11) 66666-6666",
    vehicle: "Moto Honda CG 160",
    active: true,
    currentOrders: [],
  },
  {
    id: "2",
    name: "Ana Delivery",
    phone: "(11) 55555-5555",
    vehicle: "Bicicleta Elétrica",
    active: true,
    currentOrders: [],
  },
]

export const mockOrders: Order[] = [
  {
    id: "1",
    clientId: "1",
    items: [
      {
        id: "1",
        dishId: "1",
        dish: mockDishes[0],
        quantity: 1,
        price: 35.9,
        observations: "Sem cebola",
      },
      {
        id: "2",
        dishId: "3",
        dish: mockDishes[2],
        quantity: 2,
        price: 5.5,
      },
    ],
    status: "preparing",
    type: "delivery",
    total: 46.9,
    deliveryFee: 5.0,
    address: "Rua das Flores, 123 - São Paulo, SP",
    phone: "(11) 99999-9999",
    observations: "Interfone 123",
    createdAt: "2024-01-25T18:30:00Z",
    updatedAt: "2024-01-25T18:45:00Z",
    estimatedTime: 45,
    deliveryPersonId: "1",
  },
  {
    id: "2",
    clientId: "1",
    items: [
      {
        id: "3",
        dishId: "2",
        dish: mockDishes[1],
        quantity: 2,
        price: 28.5,
      },
    ],
    status: "delivered",
    type: "takeaway",
    total: 57.0,
    deliveryFee: 0,
    phone: "(11) 99999-9999",
    createdAt: "2024-01-22T19:00:00Z",
    updatedAt: "2024-01-22T19:30:00Z",
    estimatedTime: 20,
  },
]

// Adicionar referências cruzadas
mockDishes.forEach((dish) => {
  dish.category = mockCategories.find((cat) => cat.id === dish.categoryId)
})

mockOrders.forEach((order) => {
  order.client = mockUsers.find((user) => user.id === order.clientId)
  order.deliveryPerson = mockDeliveryPersons.find((dp) => dp.id === order.deliveryPersonId)
})

mockRatings.forEach((rating) => {
  rating.user = mockUsers.find((user) => user.id === rating.userId)
})
