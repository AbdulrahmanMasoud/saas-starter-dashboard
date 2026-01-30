import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { logActivity } from "@/lib/activity"
import { z } from "zod"

const redirectSchema = z.object({
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
  statusCode: z.number().refine((val) => [301, 302].includes(val), "Invalid status code"),
  isActive: z.boolean().default(true),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const redirects = await db.redirect.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(redirects)
  } catch (error) {
    console.error("Error fetching redirects:", error)
    return NextResponse.json(
      { error: "Failed to fetch redirects" },
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
    const validatedFields = redirectSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      )
    }

    const { source, destination, statusCode, isActive } = validatedFields.data

    // Check if source already exists
    const existingRedirect = await db.redirect.findUnique({
      where: { source },
    })

    if (existingRedirect) {
      return NextResponse.json(
        { error: "A redirect with this source already exists" },
        { status: 400 }
      )
    }

    const redirect = await db.redirect.create({
      data: {
        source,
        destination,
        statusCode,
        isActive,
      },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "created",
      entity: "redirect",
      entityId: redirect.id,
      description: `Created redirect ${source} -> ${destination}`,
    })

    return NextResponse.json(redirect, { status: 201 })
  } catch (error) {
    console.error("Error creating redirect:", error)
    return NextResponse.json(
      { error: "Failed to create redirect" },
      { status: 500 }
    )
  }
}
