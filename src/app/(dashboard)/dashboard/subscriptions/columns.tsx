"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { format, differenceInDays, isPast } from "date-fns"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
export type Subscription = {
  id: string
  userId: string
  planId: string
  status: "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED"
  billingPeriod: "MONTHLY" | "YEARLY"
  currentPeriodStart: Date
  currentPeriodEnd: Date
  trialStart: Date | null
  trialEnd: Date | null
  canceledAt: Date | null
  cancelReason: string | null
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  plan: {
    id: string
    name: string
    monthlyPrice: number
    yearlyPrice: number
  }
}

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  TRIALING: "secondary",
  ACTIVE: "default",
  PAST_DUE: "destructive",
  CANCELED: "outline",
  EXPIRED: "outline",
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

export const columns: ColumnDef<Subscription>[] = [
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
    accessorKey: "user",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const user = row.original.user
      const initials = user.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U"

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name || "Unnamed"}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const user = row.original.user
      const searchValue = value.toLowerCase()
      return (
        (user.name?.toLowerCase().includes(searchValue) || false) ||
        user.email.toLowerCase().includes(searchValue)
      )
    },
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => {
      const subscription = row.original
      const price =
        subscription.billingPeriod === "YEARLY"
          ? subscription.plan.yearlyPrice
          : subscription.plan.monthlyPrice

      return (
        <div>
          <p className="font-medium">{subscription.plan.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatPrice(price)}/{subscription.billingPeriod === "YEARLY" ? "yr" : "mo"}
          </p>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const subscription = row.original
      const status = subscription.status

      return (
        <div className="flex items-center gap-2">
          <Badge variant={statusVariants[status] || "outline"}>
            {status === "TRIALING" && <Clock className="mr-1 h-3 w-3" />}
            {status === "PAST_DUE" && <AlertCircle className="mr-1 h-3 w-3" />}
            {status.charAt(0) + status.slice(1).toLowerCase().replace("_", " ")}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "billingPeriod",
    header: "Billing",
    cell: ({ row }) => {
      const period = row.original.billingPeriod
      return (
        <span className="text-muted-foreground">
          {period === "YEARLY" ? "Yearly" : "Monthly"}
        </span>
      )
    },
  },
  {
    accessorKey: "currentPeriodEnd",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Period End
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const subscription = row.original
      const endDate = new Date(subscription.currentPeriodEnd)
      const isOverdue = isPast(endDate)
      const daysRemaining = differenceInDays(endDate, new Date())

      // For trialing, show trial end instead
      if (subscription.status === "TRIALING" && subscription.trialEnd) {
        const trialEnd = new Date(subscription.trialEnd)
        const trialDays = differenceInDays(trialEnd, new Date())
        return (
          <div>
            <p>{format(trialEnd, "MMM d, yyyy")}</p>
            <p className="text-sm text-muted-foreground">
              {trialDays > 0 ? `${trialDays} days trial left` : "Trial ending"}
            </p>
          </div>
        )
      }

      return (
        <div>
          <p className={isOverdue ? "text-destructive" : ""}>
            {format(endDate, "MMM d, yyyy")}
          </p>
          {!isOverdue && daysRemaining <= 7 && (
            <p className="text-sm text-amber-600">
              {daysRemaining} days remaining
            </p>
          )}
          {isOverdue && (
            <p className="text-sm text-destructive">
              {Math.abs(daysRemaining)} days overdue
            </p>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const subscription = row.original

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(subscription.id)}>
              Copy subscription ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/subscriptions/${subscription.id}`}>
                View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/users/${subscription.user.id}`}>
                View user
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {subscription.status !== "CANCELED" && (
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                Cancel subscription
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
