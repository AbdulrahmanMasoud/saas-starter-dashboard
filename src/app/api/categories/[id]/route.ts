import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { logActivity } from "@/lib/activity"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateCategorySchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
  description: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  order: z.number().optional(),
})

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const category = await db.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: { select: { posts: true } },
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json(
      { error: "Failed to fetch category" },
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
    const validatedFields = updateCategorySchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      )
    }

    const existingCategory = await db.category.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    const { name, slug, description, parentId, order } = validatedFields.data

    // Check if slug is taken by another category
    if (slug && slug !== existingCategory.slug) {
      const slugTaken = await db.category.findUnique({
        where: { slug },
      })
      if (slugTaken) {
        return NextResponse.json(
          { error: "A category with this slug already exists" },
          { status: 400 }
        )
      }
    }

    // Prevent circular references
    if (parentId === id) {
      return NextResponse.json(
        { error: "A category cannot be its own parent" },
        { status: 400 }
      )
    }

    const category = await db.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(parentId !== undefined && { parentId }),
        ...(order !== undefined && { order }),
      },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "updated",
      entity: "category",
      entityId: category.id,
      description: `Updated category "${category.name}"`,
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json(
      { error: "Failed to update category" },
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

    const existingCategory = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { posts: true, children: true } } },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    if (existingCategory._count.posts > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with posts" },
        { status: 400 }
      )
    }

    if (existingCategory._count.children > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with subcategories" },
        { status: 400 }
      )
    }

    await db.category.delete({
      where: { id },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "deleted",
      entity: "category",
      entityId: id,
      description: `Deleted category "${existingCategory.name}"`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    )
  }
}
