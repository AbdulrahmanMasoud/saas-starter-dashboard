import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { logActivity } from "@/lib/activity"
import { z } from "zod"

const tagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  color: z.string().optional().nullable(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tags = await db.tag.findMany({
      include: {
        _count: { select: { posts: true } },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error("Error fetching tags:", error)
    return NextResponse.json(
      { error: "Failed to fetch tags" },
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
    const validatedFields = tagSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      )
    }

    const { name, slug, color } = validatedFields.data

    // Check if tag name or slug already exists
    const existingTag = await db.tag.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    })

    if (existingTag) {
      return NextResponse.json(
        { error: "A tag with this name or slug already exists" },
        { status: 400 }
      )
    }

    const tag = await db.tag.create({
      data: { name, slug, color: color ?? null },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "created",
      entity: "tag",
      entityId: tag.id,
      description: `Created tag "${tag.name}"`,
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error("Error creating tag:", error)
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    )
  }
}
