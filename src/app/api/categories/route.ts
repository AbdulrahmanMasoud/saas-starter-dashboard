import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { logActivity } from "@/lib/activity"
import { z } from "zod"

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const categories = await db.category.findMany({
      include: {
        parent: { select: { name: true } },
        _count: { select: { posts: true, children: true } },
      },
      orderBy: [{ parentId: "asc" }, { order: "asc" }, { name: "asc" }],
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
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
    const validatedFields = categorySchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      )
    }

    const { name, slug, description, parentId } = validatedFields.data

    // Check if slug already exists
    const existingCategory = await db.category.findUnique({
      where: { slug },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 400 }
      )
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        description,
        parentId,
      },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "created",
      entity: "category",
      entityId: category.id,
      description: `Created category "${category.name}"`,
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    )
  }
}
