import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServerDataTable } from "@/components/dashboard/server-data-table"
import { columns } from "./columns"
import { db } from "@/lib/db"

export const metadata = {
  title: "Users - Dashboard",
  description: "Manage users",
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    pageSize?: string
    search?: string
  }>
}

async function getUsers(page: number, pageSize: number, search?: string) {
  const skip = (page - 1) * pageSize

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      }
    : {}

  const [users, totalCount] = await Promise.all([
    db.user.findMany({
      where,
      include: {
        role: { select: { name: true } },
        _count: { select: { posts: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.user.count({ where }),
  ])

  return { users, totalCount }
}

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  const search = params.search || ""

  const { users, totalCount } = await getUsers(page, pageSize, search)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/users/create">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </div>

      {/* Data Table */}
      <ServerDataTable
        columns={columns}
        data={users}
        totalCount={totalCount}
        pageSize={pageSize}
        currentPage={page}
        searchKey="name"
        searchPlaceholder="Search users..."
        searchValue={search}
      />
    </div>
  )
}
