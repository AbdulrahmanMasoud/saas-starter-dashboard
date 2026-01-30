import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { logActivity } from "@/lib/activity"
import { postSchema } from "@/lib/validations/post"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const post = await db.post.findUnique({
      where: { id },
      include: {
        author: { select: { name: true, image: true } },
        category: true,
        tags: { include: { tag: true } },
        seoMeta: true,
      },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const validatedFields = postSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      )
    }

    const existingPost = await db.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      status,
      categoryId,
      tagIds,
    } = validatedFields.data

    // Check if slug is taken by another post
    if (slug !== existingPost.slug) {
      const slugTaken = await db.post.findUnique({
        where: { slug },
      })
      if (slugTaken) {
        return NextResponse.json(
          { error: "A post with this slug already exists" },
          { status: 400 }
        )
      }
    }

    // Determine published date
    let publishedAt = existingPost.publishedAt
    if (status === "PUBLISHED" && !existingPost.publishedAt) {
      publishedAt = new Date()
    }

    // Delete existing tags and add new ones
    await db.postTag.deleteMany({
      where: { postId: id },
    })

    const post = await db.post.update({
      where: { id },
      data: {
        title,
        slug,
        content: content ?? null,
        excerpt: excerpt ?? null,
        featuredImage: featuredImage ?? null,
        status,
        publishedAt,
        categoryId: categoryId ?? null,
        tags: tagIds?.length
          ? {
              create: tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
        tags: { include: { tag: true } },
      },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "updated",
      entity: "post",
      entityId: post.id,
      description: `Updated post "${post.title}"`,
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existingPost = await db.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    await db.post.delete({
      where: { id },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "deleted",
      entity: "post",
      entityId: id,
      description: `Deleted post "${existingPost.title}"`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    )
  }
}
