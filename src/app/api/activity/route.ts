import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const action = searchParams.get("action")
    const entity = searchParams.get("entity")
    const userId = searchParams.get("userId")

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (action) where.action = action
    if (entity) where.entity = entity
    if (userId) where.userId = userId

    const [logs, total] = await Promise.all([
      db.activityLog.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.activityLog.count({ where }),
    ])

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching activity logs:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    )
  }
}
