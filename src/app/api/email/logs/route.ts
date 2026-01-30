import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import type { EmailStatus } from "@prisma/client"

// GET /api/email/logs - List email logs with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") as EmailStatus | "all" | null
    const templateId = searchParams.get("templateId")

    const skip = (page - 1) * pageSize

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { to: { contains: search } },
        { subject: { contains: search } },
      ]
    }

    if (status && status !== "all") {
      where.status = status
    }

    if (templateId && templateId !== "all") {
      where.templateId = templateId
    }

    const [logs, totalCount] = await Promise.all([
      db.emailLog.findMany({
        where,
        include: {
          template: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.emailLog.count({ where }),
    ])

    return NextResponse.json({
      logs,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    })
  } catch (error) {
    console.error("Error fetching email logs:", error)
    return NextResponse.json(
      { error: "Failed to fetch email logs" },
      { status: 500 }
    )
  }
}
