import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { retryFailedEmail } from "@/lib/email/service"

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/email/logs/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const log = await db.emailLog.findUnique({
      where: { id },
      include: {
        template: { select: { id: true, name: true, slug: true } },
      },
    })

    if (!log) {
      return NextResponse.json({ error: "Email log not found" }, { status: 404 })
    }

    return NextResponse.json(log)
  } catch (error) {
    console.error("Error fetching email log:", error)
    return NextResponse.json(
      { error: "Failed to fetch email log" },
      { status: 500 }
    )
  }
}

// POST /api/email/logs/[id] - Retry sending failed email
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    await retryFailedEmail(id)

    return NextResponse.json({ success: true, message: "Email resent successfully" })
  } catch (error) {
    console.error("Error retrying email:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to retry email" },
      { status: 500 }
    )
  }
}

// DELETE /api/email/logs/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    await db.emailLog.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting email log:", error)
    return NextResponse.json(
      { error: "Failed to delete email log" },
      { status: 500 }
    )
  }
}
