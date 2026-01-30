"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Star, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
export type Plan = {
  id: string
  name: string
  description: string | null
  monthlyPrice: number
  yearlyPrice: number
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED"
  trialDays: number
  isPopular: boolean
  sortOrder: number
  _count?: { subscriptions: number }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

const statusVariants: Record<string, "default" | "secondary" | "outline"> = {
  ACTIVE: "default",
  INACTIVE: "secondary",
  ARCHIVED: "outline",
}

export const columns: ColumnDef<Plan>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Plan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const plan = row.original
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{plan.name}</span>
          {plan.isPopular && (
            <Badge variant="default" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Popular
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "monthlyPrice",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Monthly
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return formatPrice(row.original.monthlyPrice)
    },
  },
  {
    accessorKey: "yearlyPrice",
    header: "Yearly",
    cell: ({ row }) => {
      return formatPrice(row.original.yearlyPrice)
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge variant={statusVariants[status] || "outline"}>
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </Badge>
      )
    },
  },
  {
    accessorKey: "_count.subscriptions",
    header: "Subscribers",
    cell: ({ row }) => {
      const count = row.original._count?.subscriptions || 0
      return (
        <span className="flex items-center gap-1 text-muted-foreground">
          <Users className="h-3 w-3" />
          {count}
        </span>
      )
    },
  },
  {
    accessorKey: "trialDays",
    header: "Trial",
    cell: ({ row }) => {
      const days = row.original.trialDays
      return days > 0 ? (
        <span>{days} days</span>
      ) : (
        <span className="text-muted-foreground">None</span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const plan = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(plan.id)}>
              Copy plan ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/plans/${plan.id}`}>View details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/plans/${plan.id}`}>Edit plan</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              Delete plan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
