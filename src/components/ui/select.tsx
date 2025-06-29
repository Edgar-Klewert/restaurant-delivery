"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
}

const Select = ({ value, onValueChange, children }: SelectProps) => {
  const [open, setOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || "")

  const handleSelect = (itemValue: string) => {
    setSelectedValue(itemValue)
    onValueChange?.(itemValue)
    setOpen(false)
  }

  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            open,
            setOpen,
            selectedValue,
            onSelect: handleSelect,
          } as any)
        }
        return child
      })}
    </div>
  )
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { open?: boolean; setOpen?: (open: boolean) => void }
>(({ className, children, open, setOpen, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    onClick={() => setOpen?.(!open)}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, selectedValue }: { placeholder?: string; selectedValue?: string }) => (
  <span>{selectedValue || placeholder}</span>
)

const SelectContent = ({
  children,
  open,
  onSelect,
}: {
  children: React.ReactNode
  open?: boolean
  onSelect?: (value: string) => void
}) => {
  if (!open) return null

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
      <div className="p-1">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { onSelect } as any)
          }
          return child
        })}
      </div>
    </div>
  )
}

const SelectItem = ({ value, children, onSelect }: SelectItemProps & { onSelect?: (value: string) => void }) => (
  <div
    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
    onClick={() => onSelect?.(value)}
  >
    {children}
  </div>
)

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
