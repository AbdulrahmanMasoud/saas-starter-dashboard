import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServerDataTable } from "@/components/dashboard/server-data-table"
import { columns } from "./columns"
import { db } from "@/lib/db"

export const metadata = {
  title: "Plans - Dashboard",
  description: "Manage subscription plans",
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    pageSize?: string
    search?: string
  }>
}

async function getPlans(page: number, pageSize: number, search?: string) {
  const skip = (page - 1) * pageSize

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      }
    : {}

  const [rawPlans, totalCount] = await Promise.all([
    db.plan.findMany({
      where,
      include: {
        _count: { select: { subscriptions: true } },
      },
      orderBy: { sortOrder: "asc" },
      skip,
      take: pageSize,
    }),
    db.plan.count({ where }),
  ])

  // Convert Decimal to number for client component serialization
  const plans = rawPlans.map((plan) => ({
    ...plan,
    monthlyPrice: Number(plan.monthlyPrice),
    yearlyPrice: Number(plan.yearlyPrice),
  }))

  return { plans, totalCount }
}

export default async function PlansPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  const search = params.search || ""

  const { plans, totalCount } = await getPlans(page, pageSize, search)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plans</h1>
          <p className="text-muted-foreground">
            Manage subscription plans and pricing
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/plans/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Plan
          </Link>
        </Button>
      </div>

      {/* Data Table */}
      <ServerDataTable
        columns={columns}
        data={plans}
        totalCount={totalCount}
        pageSize={pageSize}
        currentPage={page}
        searchKey="name"
        searchPlaceholder="Search plans..."
        searchValue={search}
      />
    </div>
  )
}
