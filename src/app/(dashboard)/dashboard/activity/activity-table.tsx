"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Download, Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { toast } from "sonner"

interface ActivityLog {
  id: string
  userId: string | null
  action: string
  entity: string
  entityId: string | null
  description: string | null
  ipAddress: string | null
  createdAt: Date
  user: { name: string | null; email: string; image: string | null } | null
}

interface ActivityLogTableProps {
  logs: ActivityLog[]
  totalCount: number
  pageSize: number
  currentPage: number
  searchValue: string
  actionFilter: string
  entityFilter: string
  uniqueActions: string[]
  uniqueEntities: string[]
}

const actionColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  created: "default",
  updated: "secondary",
  deleted: "destructive",
  uploaded: "default",
  published: "default",
  archived: "outline",
}

export function ActivityLogTable({
  logs,
  totalCount,
  pageSize,
  currentPage,
  searchValue,
  actionFilter,
  entityFilter,
  uniqueActions,
  uniqueEntities,
}: ActivityLogTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [localSearch, setLocalSearch] = useState(searchValue)

  const totalPages = Math.ceil(totalCount / pageSize)
  const canPreviousPage = currentPage > 1
  const canNextPage = currentPage < totalPages

  // Create URL with updated params
  const createUrl = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    })

    return `${pathname}?${params.toString()}`
  }

  // Navigate with transition
  const navigate = (url: string) => {
    startTransition(() => {
      router.push(url)
    })
  }

  // Handle page change
  const goToPage = (page: number) => {
    navigate(createUrl({ page }))
  }

  // Handle page size change
  const changePageSize = (size: number) => {
    navigate(createUrl({ pageSize: size, page: 1 }))
  }

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(createUrl({ search: localSearch, page: 1 }))
  }

  // Handle filter changes
  const handleActionFilter = (value: string) => {
    navigate(createUrl({ action: value, page: 1 }))
  }

  const handleEntityFilter = (value: string) => {
    navigate(createUrl({ entity: value, page: 1 }))
  }

  const exportToCSV = () => {
    const headers = ["Date", "User", "Action", "Entity", "Description"]
    const rows = logs.map((log) => [
      format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss"),
      log.user?.name || log.user?.email || "System",
      log.action,
      log.entity,
      log.description || "",
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `activity-log-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success("Activity log exported successfully")
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search activity..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {isPending && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </form>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={actionFilter} onValueChange={handleActionFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={entityFilter} onValueChange={handleEntityFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {uniqueEntities.map((entity) => (
                <SelectItem key={entity} value={entity}>
                  {entity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Activity Table */}
      <Card>
        <CardContent className="p-0 relative">
          {isPending && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No activity found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const initials = log.user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "S"

                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.createdAt), "MMM d, yyyy")}
                        <br />
                        <span className="text-xs">
                          {format(new Date(log.createdAt), "h:mm a")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={log.user?.image || undefined} />
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {log.user?.name || "System"}
                            </p>
                            {log.user?.email && (
                              <p className="text-xs text-muted-foreground">
                                {log.user.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={actionColors[log.action] || "secondary"}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm capitalize">{log.entity}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {log.description || "-"}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of{" "}
          {totalCount} result(s).
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => changePageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50, 100].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {currentPage} of {totalPages || 1}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => goToPage(1)}
              disabled={!canPreviousPage || isPending}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => goToPage(currentPage - 1)}
              disabled={!canPreviousPage || isPending}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => goToPage(currentPage + 1)}
              disabled={!canNextPage || isPending}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => goToPage(totalPages)}
              disabled={!canNextPage || isPending}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
