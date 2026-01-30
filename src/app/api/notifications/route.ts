import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const createNotificationSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1).max(200),
  message: z.string().min(1),
  type: z.enum(["INFO", "SUCCESS", "WARNING", "ERROR"]).default("INFO"),
  category: z.enum(["SYSTEM", "POST", "USER", "SUBSCRIPTION", "SECURITY", "COMMENT"]).default("SYSTEM"),
  link: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get("limit")) || 20
    const unreadOnly = searchParams.get("unread") === "true"
    const category = searchParams.get("category")

    const where: Record<string, unknown> = {
      userId: session.user.id,
    }

    if (unreadOnly) {
      where.isRead = false
    }

    if (category) {
      where.category = category
    }

    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      db.notification.count({
        where: { userId: session.user.id, isRead: false },
      }),
    ])

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Create a notification (admin/system only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = createNotificationSchema.parse(body)

    // Check user preferences before creating
    const preference = await db.notificationPreference.findUnique({
      where: {
        userId_category: {
          userId: data.userId,
          category: data.category,
        },
      },
    })

    // If user has disabled in-app notifications for this category, don't create
    if (preference && !preference.inApp) {
      return NextResponse.json({
        skipped: true,
        message: "User has disabled in-app notifications for this category",
      })
    }

    const notification = await db.notification.create({
      data: data as any,
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    )
  }
}

// PATCH /api/notifications - Mark all as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await db.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking notifications as read:", error)
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications - Clear all notifications
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const readOnly = searchParams.get("readOnly") === "true"

    const where: Record<string, unknown> = {
      userId: session.user.id,
    }

    if (readOnly) {
      where.isRead = true
    }

    await db.notification.deleteMany({ where })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting notifications:", error)
    return NextResponse.json(
      { error: "Failed to delete notifications" },
      { status: 500 }
    )
  }
}
