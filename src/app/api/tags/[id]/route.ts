import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { logActivity } from "@/lib/activity"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateTagSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
  color: z.string().optional().nullable(),
})

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const tag = await db.tag.findUnique({
      where: { id },
      include: {
        _count: { select: { posts: true } },
      },
    })

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 })
    }

    return NextResponse.json(tag)
  } catch (error) {
    console.error("Error fetching tag:", error)
    return NextResponse.json(
      { error: "Failed to fetch tag" },
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
    const validatedFields = updateTagSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      )
    }

    const existingTag = await db.tag.findUnique({
      where: { id },
    })

    if (!existingTag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 })
    }

    const { name, slug, color } = validatedFields.data

    // Check if name or slug is taken by another tag
    if (name || slug) {
      const conflictingTag = await db.tag.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(name ? [{ name }] : []),
                ...(slug ? [{ slug }] : []),
              ],
            },
          ],
        },
      })
      if (conflictingTag) {
        return NextResponse.json(
          { error: "A tag with this name or slug already exists" },
          { status: 400 }
        )
      }
    }

    const tag = await db.tag.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(color !== undefined && { color }),
      },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "updated",
      entity: "tag",
      entityId: tag.id,
      description: `Updated tag "${tag.name}"`,
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error("Error updating tag:", error)
    return NextResponse.json(
      { error: "Failed to update tag" },
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

    const existingTag = await db.tag.findUnique({
      where: { id },
    })

    if (!existingTag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 })
    }

    await db.tag.delete({
      where: { id },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "deleted",
      entity: "tag",
      entityId: id,
      description: `Deleted tag "${existingTag.name}"`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting tag:", error)
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    )
  }
}
