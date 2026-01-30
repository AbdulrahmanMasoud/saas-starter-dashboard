import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/notifications/[id] - Get single notification
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const notification = await db.notification.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Error fetching notification:", error)
    return NextResponse.json(
      { error: "Failed to fetch notification" },
      { status: 500 }
    )
  }
}

// PATCH /api/notifications/[id] - Mark as read/unread
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { isRead } = body

    // Verify ownership
    const existing = await db.notification.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    const notification = await db.notification.update({
      where: { id },
      data: { isRead: isRead ?? true },
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    // Verify ownership
    const existing = await db.notification.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    await db.notification.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    )
  }
}
