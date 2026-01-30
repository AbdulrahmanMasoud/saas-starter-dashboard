import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const NOTIFICATION_CATEGORIES = [
  "SYSTEM",
  "POST",
  "USER",
  "SUBSCRIPTION",
  "SECURITY",
  "COMMENT",
] as const

const updatePreferencesSchema = z.object({
  preferences: z.array(
    z.object({
      category: z.enum(NOTIFICATION_CATEGORIES),
      email: z.boolean(),
      inApp: z.boolean(),
    })
  ),
})

// GET /api/notifications/preferences - Get user's notification preferences
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existingPreferences = await db.notificationPreference.findMany({
      where: { userId: session.user.id },
    })

    // Build a complete list of preferences, with defaults for missing categories
    const preferences = NOTIFICATION_CATEGORIES.map((category) => {
      const existing = existingPreferences.find((p) => p.category === category)
      return {
        category,
        email: existing?.email ?? true,
        inApp: existing?.inApp ?? true,
      }
    })

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error("Error fetching notification preferences:", error)
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    )
  }
}

// PUT /api/notifications/preferences - Update user's notification preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { preferences } = updatePreferencesSchema.parse(body)

    // Upsert all preferences in a transaction
    await db.$transaction(
      preferences.map((pref) =>
        db.notificationPreference.upsert({
          where: {
            userId_category: {
              userId: session.user.id,
              category: pref.category,
            },
          },
          create: {
            userId: session.user.id,
            category: pref.category,
            email: pref.email,
            inApp: pref.inApp,
          },
          update: {
            email: pref.email,
            inApp: pref.inApp,
          },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    )
  }
}
