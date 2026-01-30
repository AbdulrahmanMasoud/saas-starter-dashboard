import { db } from "@/lib/db"
import { ActivityLogTable } from "./activity-table"

export const metadata = {
  title: "Activity Log - Dashboard",
  description: "View system activity and audit trail",
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    pageSize?: string
    search?: string
    action?: string
    entity?: string
  }>
}

async function getActivityLogs(
  page: number,
  pageSize: number,
  search?: string,
  action?: string,
  entity?: string
) {
  const skip = (page - 1) * pageSize

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { description: { contains: search } },
      { user: { name: { contains: search } } },
      { user: { email: { contains: search } } },
    ]
  }

  if (action && action !== "all") {
    where.action = action
  }

  if (entity && entity !== "all") {
    where.entity = entity
  }

  const [logs, totalCount, actions, entities] = await Promise.all([
    db.activityLog.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.activityLog.count({ where }),
    db.activityLog.findMany({
      select: { action: true },
      distinct: ["action"],
    }),
    db.activityLog.findMany({
      select: { entity: true },
      distinct: ["entity"],
    }),
  ])

  return {
    logs,
    totalCount,
    uniqueActions: actions.map((a) => a.action),
    uniqueEntities: entities.map((e) => e.entity),
  }
}

export default async function ActivityPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 20
  const search = params.search || ""
  const action = params.action || "all"
  const entity = params.entity || "all"

  const { logs, totalCount, uniqueActions, uniqueEntities } = await getActivityLogs(
    page,
    pageSize,
    search,
    action,
    entity
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground">
          Track all actions and changes made in the system
        </p>
      </div>

      {/* Activity Table */}
      <ActivityLogTable
        logs={logs}
        totalCount={totalCount}
        pageSize={pageSize}
        currentPage={page}
        searchValue={search}
        actionFilter={action}
        entityFilter={entity}
        uniqueActions={uniqueActions}
        uniqueEntities={uniqueEntities}
      />
    </div>
  )
}
