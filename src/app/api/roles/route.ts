import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { logActivity } from "@/lib/activity"
import { z } from "zod"

const createRoleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  permissions: z.array(z.string()),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const roles = await db.role.findMany({
      include: {
        _count: { select: { users: true } },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(roles)
  } catch (error) {
    console.error("Error fetching roles:", error)
    return NextResponse.json(
      { error: "Failed to fetch roles" },
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
    const validatedFields = createRoleSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      )
    }

    const { name, description, permissions } = validatedFields.data

    // Check if role already exists
    const existingRole = await db.role.findUnique({
      where: { name },
    })

    if (existingRole) {
      return NextResponse.json(
        { error: "Role with this name already exists" },
        { status: 400 }
      )
    }

    const role = await db.role.create({
      data: {
        name,
        description,
        permissions: permissions,
      },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "created",
      entity: "role",
      entityId: role.id,
      description: `Created role ${role.name}`,
    })

    return NextResponse.json(role, { status: 201 })
  } catch (error) {
    console.error("Error creating role:", error)
    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 }
    )
  }
}
