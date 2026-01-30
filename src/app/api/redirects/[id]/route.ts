import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { logActivity } from "@/lib/activity"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateRedirectSchema = z.object({
  source: z.string().min(1).optional(),
  destination: z.string().min(1).optional(),
  statusCode: z.number().refine((val) => [301, 302].includes(val)).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const redirect = await db.redirect.findUnique({
      where: { id },
    })

    if (!redirect) {
      return NextResponse.json({ error: "Redirect not found" }, { status: 404 })
    }

    return NextResponse.json(redirect)
  } catch (error) {
    console.error("Error fetching redirect:", error)
    return NextResponse.json(
      { error: "Failed to fetch redirect" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const validatedFields = updateRedirectSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      )
    }

    const existingRedirect = await db.redirect.findUnique({
      where: { id },
    })

    if (!existingRedirect) {
      return NextResponse.json({ error: "Redirect not found" }, { status: 404 })
    }

    const { source, destination, statusCode, isActive } = validatedFields.data

    // Check if source is taken by another redirect
    if (source && source !== existingRedirect.source) {
      const sourceTaken = await db.redirect.findUnique({
        where: { source },
      })
      if (sourceTaken) {
        return NextResponse.json(
          { error: "A redirect with this source already exists" },
          { status: 400 }
        )
      }
    }

    const redirect = await db.redirect.update({
      where: { id },
      data: {
        ...(source && { source }),
        ...(destination && { destination }),
        ...(statusCode && { statusCode }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "updated",
      entity: "redirect",
      entityId: redirect.id,
      description: `Updated redirect ${redirect.source}`,
    })

    return NextResponse.json(redirect)
  } catch (error) {
    console.error("Error updating redirect:", error)
    return NextResponse.json(
      { error: "Failed to update redirect" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existingRedirect = await db.redirect.findUnique({
      where: { id },
    })

    if (!existingRedirect) {
      return NextResponse.json({ error: "Redirect not found" }, { status: 404 })
    }

    await db.redirect.delete({
      where: { id },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "deleted",
      entity: "redirect",
      entityId: id,
      description: `Deleted redirect ${existingRedirect.source}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting redirect:", error)
    return NextResponse.json(
      { error: "Failed to delete redirect" },
      { status: 500 }
    )
  }
}
