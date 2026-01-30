import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { updateUserSchema } from "@/lib/validations/user"
import { auth } from "@/auth"
import { logActivity } from "@/lib/activity"

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

    const user = await db.user.findUnique({
      where: { id },
      include: {
        role: true,
        _count: {
          select: { posts: true, media: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
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
    const validatedFields = updateUserSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      )
    }

    const { name, email, password, roleId, image } = validatedFields.data

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailTaken = await db.user.findUnique({
        where: { email },
      })
      if (emailTaken) {
        return NextResponse.json(
          { error: "Email is already in use" },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (roleId !== undefined) updateData.roleId = roleId
    if (image !== undefined) updateData.image = image
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Update user
    const user = await db.user.update({
      where: { id },
      data: updateData,
      include: {
        role: { select: { name: true } },
      },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "updated",
      entity: "user",
      entityId: user.id,
      description: `Updated user ${user.email}`,
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
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

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent self-deletion
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      )
    }

    // Delete user
    await db.user.delete({
      where: { id },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "deleted",
      entity: "user",
      entityId: id,
      description: `Deleted user ${existingUser.email}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}
