"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Eye,
  RotateCcw,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { toast } from "sonner"
import type { EmailStatus } from "@prisma/client"

interface EmailLog {
  id: string
  to: string
  subject: string
  htmlContent: string
  status: EmailStatus
  error: string | null
  sentAt: Date | null
  attempts: number
  createdAt: Date
  template: { id: string; name: string; slug: string } | null
}

interface EmailLogsTableProps {
  logs: EmailLog[]
  totalCount: number
  page: number
  pageSize: number
  searchValue: string
  statusFilter: string
}

const statusColors: Record<EmailStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  SENT: "default",
  FAILED: "destructive",
  BOUNCED: "destructive",
}

export function EmailLogsTable({
  logs,
  totalCount,
  page,
  pageSize,
  searchValue,
  statusFilter,
}: EmailLogsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [localSearch, setLocalSearch] = useState(searchValue)
  const [previewLog, setPreviewLog] = useState<EmailLog | null>(null)
  const [retryingId, setRetryingId] = useState<string | null>(null)

  const totalPages = Math.ceil(totalCount / pageSize)
  const canPreviousPage = page > 1
  const canNextPage = page < totalPages

  function createUrl(updates: Record<string, string | number | null>) {
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

  function navigate(url: string) {
    startTransition(() => {
      router.push(url)
    })
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate(createUrl({ search: localSearch, page: 1 }))
  }

  async function handleRetry(logId: string) {
    setRetryingId(logId)
    try {
      const response = await fetch(`/api/email/logs/${logId}`, {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to retry email")
      }

      toast.success("Email resent successfully")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to retry email")
    } finally {
      setRetryingId(null)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email or subject..."
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
            <Select
              value={statusFilter}
              onValueChange={(value) => navigate(createUrl({ status: value, page: 1 }))}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="BOUNCED">Bounced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Logs Table */}
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
                  <TableHead>Date</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No email logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.createdAt), "MMM d, yyyy")}
                        <br />
                        <span className="text-xs">
                          {format(new Date(log.createdAt), "h:mm a")}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {log.to}
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate">
                        {log.subject}
                      </TableCell>
                      <TableCell>
                        {log.template ? (
                          <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
                            {log.template.slug}
                          </code>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[log.status]}>
                          {log.status}
                        </Badge>
                        {log.error && (
                          <p className="text-xs text-destructive mt-1 line-clamp-1">
                            {log.error}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {log.attempts}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setPreviewLog(log)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Content
                            </DropdownMenuItem>
                            {log.status === "FAILED" && (
                              <DropdownMenuItem
                                onClick={() => handleRetry(log.id)}
                                disabled={retryingId === log.id}
                              >
                                {retryingId === log.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                )}
                                Retry
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of{" "}
            {totalCount} result(s).
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${pageSize}`}
                onValueChange={(value) => navigate(createUrl({ pageSize: Number(value), page: 1 }))}
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
              Page {page} of {totalPages || 1}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => navigate(createUrl({ page: 1 }))}
                disabled={!canPreviousPage || isPending}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => navigate(createUrl({ page: page - 1 }))}
                disabled={!canPreviousPage || isPending}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => navigate(createUrl({ page: page + 1 }))}
                disabled={!canNextPage || isPending}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => navigate(createUrl({ page: totalPages }))}
                disabled={!canNextPage || isPending}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewLog} onOpenChange={() => setPreviewLog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Content</DialogTitle>
            <DialogDescription>
              To: {previewLog?.to}
              <br />
              Subject: {previewLog?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div
              className="border rounded-lg p-4 bg-white"
              dangerouslySetInnerHTML={{ __html: previewLog?.htmlContent || "" }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
