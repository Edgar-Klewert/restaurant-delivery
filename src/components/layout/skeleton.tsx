export function DishCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
      <div className="space-y-3 p-4">
        <div className="flex justify-between">
          <div className="bg-gray-200 rounded h-6 w-3/4"></div>
          <div className="bg-gray-200 rounded h-6 w-16"></div>
        </div>
        <div className="bg-gray-200 rounded h-4 w-full"></div>
        <div className="bg-gray-200 rounded h-4 w-2/3"></div>
        <div className="flex justify-between items-center">
          <div className="bg-gray-200 rounded h-4 w-20"></div>
          <div className="bg-gray-200 rounded h-4 w-12"></div>
        </div>
        <div className="flex space-x-2">
          <div className="bg-gray-200 rounded h-8 flex-1"></div>
          <div className="bg-gray-200 rounded h-8 flex-1"></div>
        </div>
      </div>
    </div>
  )
}

export function OrderCardSkeleton() {
  return (
    <div className="animate-pulse border rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="bg-gray-200 rounded h-6 w-32"></div>
        <div className="bg-gray-200 rounded-full h-6 w-20"></div>
      </div>
      <div className="space-y-3">
        <div className="bg-gray-200 rounded h-4 w-full"></div>
        <div className="bg-gray-200 rounded h-4 w-3/4"></div>
        <div className="bg-gray-200 rounded h-4 w-1/2"></div>
      </div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <div className="bg-gray-200 rounded h-4 w-24"></div>
        <div className="bg-gray-200 rounded h-8 w-24"></div>
      </div>
    </div>
  )
}

export function DashboardCardSkeleton() {
  return (
    <div className="animate-pulse border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-gray-200 rounded h-4 w-24"></div>
        <div className="bg-gray-200 rounded h-6 w-6"></div>
      </div>
      <div className="bg-gray-200 rounded h-8 w-20 mb-2"></div>
      <div className="bg-gray-200 rounded h-3 w-32"></div>
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse">
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded h-4"></div>
            ))}
          </div>
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 border-b last:border-b-0">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div key={colIndex} className="bg-gray-200 rounded h-4"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
