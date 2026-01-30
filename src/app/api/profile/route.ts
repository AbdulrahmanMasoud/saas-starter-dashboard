import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  image: z.string().optional().nullable(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        role: true,
        subscription: {
          include: {
            plan: true,
          },
        },
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
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedFields = updateProfileSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      )
    }

    const { name, email, image } = validatedFields.data

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await db.user.findUnique({
        where: { email },
      })
      if (existingUser && existingUser.id !== session.user.id) {
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
    if (image !== undefined) updateData.image = image

    // Update user
    const user = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      include: {
        role: { select: { name: true } },
      },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: "updated",
        entity: "profile",
        entityId: user.id,
        description: "Updated profile settings",
      },
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedFields = changePasswordSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = validatedFields.data

    // Get user with password
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "User not found or no password set" },
        { status: 404 }
      )
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password)
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      )
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await db.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: "updated",
        entity: "profile",
        entityId: user.id,
        description: "Changed password",
      },
    })

    return NextResponse.json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    )
  }
}
