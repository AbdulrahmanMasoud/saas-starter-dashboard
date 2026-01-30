import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { logActivity } from "@/lib/activity"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const group = searchParams.get("group")

    const where = group ? { group } : {}

    const settings = await db.setting.findMany({
      where,
      orderBy: { key: "asc" },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
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
    const { group, settings } = body

    if (!group || !Array.isArray(settings)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    // Upsert each setting
    const results = await Promise.all(
      settings.map(({ key, value }: { key: string; value: string }) =>
        db.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value, group },
        })
      )
    )

    // Log activity (safe - won't fail if user doesn't exist)
    await logActivity({
      userId: session.user.id,
      action: "updated",
      entity: "settings",
      description: `Updated ${group} settings`,
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    )
  }
}
