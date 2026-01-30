import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { updateEmailTemplateSchema } from "@/lib/validations/email"

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/email/templates/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const template = await db.emailTemplate.findUnique({
      where: { id },
      include: {
        _count: { select: { emailLogs: true } },
      },
    })

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error fetching email template:", error)
    return NextResponse.json(
      { error: "Failed to fetch email template" },
      { status: 500 }
    )
  }
}

// PATCH /api/email/templates/[id]
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const validatedData = updateEmailTemplateSchema.parse(body)

    // Check if template exists
    const existing = await db.emailTemplate.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      )
    }

    // Check slug uniqueness if changing
    if (validatedData.slug && validatedData.slug !== existing.slug) {
      const slugExists = await db.emailTemplate.findUnique({
        where: { slug: validatedData.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: "A template with this slug already exists" },
          { status: 400 }
        )
      }
    }

    const template = await db.emailTemplate.update({
      where: { id },
      data: validatedData as any,
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error updating email template:", error)
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to update email template" },
      { status: 500 }
    )
  }
}

// DELETE /api/email/templates/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const template = await db.emailTemplate.findUnique({
      where: { id },
      include: { _count: { select: { emailLogs: true } } },
    })

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      )
    }

    await db.emailTemplate.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting email template:", error)
    return NextResponse.json(
      { error: "Failed to delete email template" },
      { status: 500 }
    )
  }
}
