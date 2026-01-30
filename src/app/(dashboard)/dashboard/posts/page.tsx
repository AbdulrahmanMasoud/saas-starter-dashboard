import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServerDataTable } from "@/components/dashboard/server-data-table"
import { columns } from "./columns"
import { db } from "@/lib/db"

export const metadata = {
  title: "Posts - Dashboard",
  description: "Manage blog posts",
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    pageSize?: string
    search?: string
  }>
}

async function getPosts(page: number, pageSize: number, search?: string) {
  const skip = (page - 1) * pageSize

  const where = search
    ? {
        OR: [
          { title: { contains: search } },
          { excerpt: { contains: search } },
        ],
      }
    : {}

  const [posts, totalCount] = await Promise.all([
    db.post.findMany({
      where,
      include: {
        author: { select: { name: true, image: true } },
        category: { select: { name: true } },
        _count: { select: { tags: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.post.count({ where }),
  ])

  return { posts, totalCount }
}

export default async function PostsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  const search = params.search || ""

  const { posts, totalCount } = await getPosts(page, pageSize, search)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
          <p className="text-muted-foreground">
            Create and manage blog posts
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {/* Data Table */}
      <ServerDataTable
        columns={columns}
        data={posts}
        totalCount={totalCount}
        pageSize={pageSize}
        currentPage={page}
        searchKey="title"
        searchPlaceholder="Search posts..."
        searchValue={search}
      />
    </div>
  )
}
