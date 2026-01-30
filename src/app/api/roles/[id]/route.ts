import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { logActivity } from "@/lib/activity"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateRoleSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional().nullable(),
  permissions: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const role = await db.role.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true } },
      },
    })

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    return NextResponse.json(role)
  } catch (error) {
    console.error("Error fetching role:", error)
    return NextResponse.json(
      { error: "Failed to fetch role" },
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
    const validatedFields = updateRoleSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      )
    }

    const { name, description, permissions } = validatedFields.data

    // Check if role exists
    const existingRole = await db.role.findUnique({
      where: { id },
    })

    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    // Check if name is already taken by another role
    if (name && name !== existingRole.name) {
      const nameTaken = await db.role.findUnique({
        where: { name },
      })
      if (nameTaken) {
        return NextResponse.json(
          { error: "Role name is already in use" },
          { status: 400 }
        )
      }
    }

    const role = await db.role.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(permissions && { permissions }),
      },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "updated",
      entity: "role",
      entityId: role.id,
      description: `Updated role ${role.name}`,
    })

    return NextResponse.json(role)
  } catch (error) {
    console.error("Error updating role:", error)
    return NextResponse.json(
      { error: "Failed to update role" },
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

    // Check if role exists
    const existingRole = await db.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    })

    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    // Prevent deletion if users are assigned to this role
    if (existingRole._count.users > 0) {
      return NextResponse.json(
        { error: "Cannot delete role with assigned users" },
        { status: 400 }
      )
    }

    await db.role.delete({
      where: { id },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "deleted",
      entity: "role",
      entityId: id,
      description: `Deleted role ${existingRole.name}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting role:", error)
    return NextResponse.json(
      { error: "Failed to delete role" },
      { status: 500 }
    )
  }
}
