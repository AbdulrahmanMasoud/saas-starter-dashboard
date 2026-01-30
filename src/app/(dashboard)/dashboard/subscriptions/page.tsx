import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServerDataTable } from "@/components/dashboard/server-data-table"
import { columns } from "./columns"
import { db } from "@/lib/db"

export const metadata = {
  title: "Subscriptions - Dashboard",
  description: "Manage user subscriptions",
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    pageSize?: string
    search?: string
  }>
}

async function getSubscriptions(page: number, pageSize: number, search?: string) {
  const skip = (page - 1) * pageSize

  const where = search
    ? {
        user: {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        },
      }
    : {}

  const [rawSubscriptions, totalCount] = await Promise.all([
    db.subscription.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            monthlyPrice: true,
            yearlyPrice: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.subscription.count({ where }),
  ])

  // Convert Decimal to number for client component serialization
  const subscriptions = rawSubscriptions.map((sub) => ({
    ...sub,
    plan: {
      ...sub.plan,
      monthlyPrice: Number(sub.plan.monthlyPrice),
      yearlyPrice: Number(sub.plan.yearlyPrice),
    },
  }))

  return { subscriptions, totalCount }
}

export default async function SubscriptionsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  const search = params.search || ""

  const { subscriptions, totalCount } = await getSubscriptions(page, pageSize, search)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage user subscriptions and billing
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/subscriptions/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Subscription
          </Link>
        </Button>
      </div>

      {/* Data Table */}
      <ServerDataTable
        columns={columns}
        data={subscriptions}
        totalCount={totalCount}
        pageSize={pageSize}
        currentPage={page}
        searchKey="user"
        searchPlaceholder="Search by user..."
        searchValue={search}
      />
    </div>
  )
}
