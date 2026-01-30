import { db } from "@/lib/db"
import { TagsManager } from "./tags-manager"

export const metadata = {
  title: "Tags - Dashboard",
  description: "Manage post tags",
}

async function getTags() {
  return db.tag.findMany({
    include: {
      _count: { select: { posts: true } },
    },
    orderBy: { name: "asc" },
  })
}

export default async function TagsPage() {
  const tags = await getTags()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
        <p className="text-muted-foreground">
          Add tags to organize and categorize your content
        </p>
      </div>

      {/* Tags Manager */}
      <TagsManager initialTags={tags} />
    </div>
  )
}
