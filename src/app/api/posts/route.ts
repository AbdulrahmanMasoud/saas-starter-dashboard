import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { logActivity, getVerifiedUser } from "@/lib/activity"
import { postSchema } from "@/lib/validations/post"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
      ]
    }

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          author: { select: { name: true, image: true } },
          category: { select: { name: true } },
          _count: { select: { tags: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.post.count({ where }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedFields = postSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      )
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

    // Verify the author exists
    const author = await getVerifiedUser(session.user.id)
    if (!author) {
      return NextResponse.json(
        { error: "Author not found. Please sign out and sign in again." },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingPost = await db.post.findUnique({
      where: { slug },
    })

    if (existingPost) {
      return NextResponse.json(
        { error: "A post with this slug already exists" },
        { status: 400 }
      )
    }

    const post = await db.post.create({
      data: {
        title,
        slug,
        content: content ?? null,
        excerpt: excerpt ?? null,
        featuredImage: featuredImage ?? null,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        categoryId: categoryId ?? null,
        authorId: session.user.id,
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
      action: "created",
      entity: "post",
      entityId: post.id,
      description: `Created post "${post.title}"`,
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    )
  }
}
