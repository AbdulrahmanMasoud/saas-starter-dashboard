import { db } from "@/lib/db"
import { CategoriesManager } from "./categories-manager"

export const metadata = {
  title: "Categories - Dashboard",
  description: "Manage post categories",
}

async function getCategories() {
  return db.category.findMany({
    include: {
      parent: { select: { name: true } },
      _count: { select: { posts: true, children: true } },
    },
    orderBy: [{ parentId: "asc" }, { order: "asc" }, { name: "asc" }],
  })
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">
          Organize your posts with hierarchical categories
        </p>
      </div>

      {/* Categories Manager */}
      <CategoriesManager initialCategories={categories} />
    </div>
  )
}
