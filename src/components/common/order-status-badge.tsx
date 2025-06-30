import { Badge } from "@/components/ui/badge"
import { getOrderStatusText, getOrderStatusColor } from "@/lib/utils"
import type { OrderStatus } from "@/lib/types"

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <Badge className={getOrderStatusColor(status)}>{getOrderStatusText(status)}</Badge>
}
