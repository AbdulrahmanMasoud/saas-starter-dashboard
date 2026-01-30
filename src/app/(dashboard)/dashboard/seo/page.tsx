import { db } from "@/lib/db"
import { SeoManager } from "./seo-manager"

export const metadata = {
  title: "SEO Settings - Dashboard",
  description: "Manage SEO metadata for your posts",
}

async function getPosts() {
  return db.post.findMany({
    include: {
      seoMeta: true,
    },
    orderBy: { updatedAt: "desc" },
  })
}

export default async function SeoPage() {
  const posts = await getPosts()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SEO Settings</h1>
        <p className="text-muted-foreground">
          Optimize your content for search engines
        </p>
      </div>

      {/* SEO Manager */}
      <SeoManager posts={posts} />
    </div>
  )
}
