import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PostForm } from "../post-form"
import { db } from "@/lib/db"

export const metadata = {
  title: "New Post - Dashboard",
  description: "Create a new blog post",
}

async function getData() {
  const [categories, tags] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.tag.findMany({ orderBy: { name: "asc" } }),
  ])
  return { categories, tags }
}

export default async function NewPostPage() {
  const { categories, tags } = await getData()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/posts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Post</h1>
          <p className="text-muted-foreground">Create a new blog post</p>
        </div>
      </div>

      {/* Post Form */}
      <PostForm categories={categories} tags={tags} />
    </div>
  )
}
