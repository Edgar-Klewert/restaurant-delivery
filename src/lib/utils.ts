import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function getOrderStatusText(status: string): string {
  const statusMap = {
    pending: "Pendente",
    confirmed: "Confirmado",
    preparing: "Preparando",
    ready: "Pronto",
    out_for_delivery: "Saiu para entrega",
    delivered: "Entregue",
    cancelled: "Cancelado",
  }
  return statusMap[status as keyof typeof statusMap] || status
}

export function getOrderStatusColor(status: string): string {
  const colorMap = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-orange-100 text-orange-800",
    ready: "bg-green-100 text-green-800",
    out_for_delivery: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }
  return colorMap[status as keyof typeof colorMap] || "bg-gray-100 text-gray-800"
}
