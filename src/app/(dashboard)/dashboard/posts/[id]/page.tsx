import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PostForm } from "../post-form"
import { db } from "@/lib/db"

export const metadata = {
  title: "Edit Post - Dashboard",
  description: "Edit blog post",
}

interface PageProps {
  params: Promise<{ id: string }>
}

async function getPost(id: string) {
  return db.post.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
    },
  })
}

async function getData() {
  const [categories, tags] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.tag.findMany({ orderBy: { name: "asc" } }),
  ])
  return { categories, tags }
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params
  const [post, { categories, tags }] = await Promise.all([
    getPost(id),
    getData(),
  ])

  if (!post) {
    notFound()
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
          <p className="text-muted-foreground">Update post content and settings</p>
        </div>
      </div>

      {/* Post Form */}
      <PostForm post={post} categories={categories} tags={tags} />
    </div>
  )
}
