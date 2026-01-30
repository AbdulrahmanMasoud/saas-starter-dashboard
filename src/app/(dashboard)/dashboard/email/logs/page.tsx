import { db } from "@/lib/db"
import { getEmailStats } from "@/lib/email/service"
import { EmailLogsTable } from "./logs-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle, XCircle, Clock } from "lucide-react"

export const metadata = {
  title: "Email Logs - Dashboard",
  description: "View email sending history",
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    pageSize?: string
    search?: string
    status?: string
  }>
}

async function getEmailLogs(searchParams: {
  page?: string
  pageSize?: string
  search?: string
  status?: string
}) {
  const page = parseInt(searchParams.page || "1")
  const pageSize = parseInt(searchParams.pageSize || "20")
  const search = searchParams.search || ""
  const status = searchParams.status

  const skip = (page - 1) * pageSize

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { to: { contains: search } },
      { subject: { contains: search } },
    ]
  }

  if (status && status !== "all") {
    where.status = status
  }

  const [logs, totalCount] = await Promise.all([
    db.emailLog.findMany({
      where,
      include: {
        template: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.emailLog.count({ where }),
  ])

  return {
    logs,
    totalCount,
    page,
    pageSize,
  }
}

export default async function EmailLogsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const [{ logs, totalCount, page, pageSize }, stats] = await Promise.all([
    getEmailLogs(params),
    getEmailStats(),
  ])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Logs</h1>
        <p className="text-muted-foreground">
          View email sending history and status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <EmailLogsTable
        logs={logs}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        searchValue={params.search || ""}
        statusFilter={params.status || "all"}
      />
    </div>
  )
}
