import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()
    const { path, referrer, sessionId } = body

    const headersList = await headers()
    const userAgent = headersList.get("user-agent") || undefined
    const forwardedFor = headersList.get("x-forwarded-for")
    const ipAddress = forwardedFor?.split(",")[0].trim() ||
                      headersList.get("x-real-ip") ||
                      undefined

    // Verify user exists if session has user ID
    let validUserId: string | null = null
    if (session?.user?.id) {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { id: true },
      })
      if (user) {
        validUserId = user.id
      }
    }

    // Create page view record
    await db.pageView.create({
      data: {
        path,
        userId: validUserId,
        sessionId: sessionId || null,
        userAgent,
        ipAddress,
        referrer: referrer || null,
      },
    })

    // Update user's last active timestamp if logged in
    if (validUserId) {
      await db.user.update({
        where: { id: validUserId },
        data: { lastActiveAt: new Date() },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking page view:", error)
    return NextResponse.json(
      { error: "Failed to track page view" },
      { status: 500 }
    )
  }
}
