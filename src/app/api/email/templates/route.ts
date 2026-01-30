import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { emailTemplateSchema } from "@/lib/validations/email"

// GET /api/email/templates - List all templates
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const isActive = searchParams.get("isActive")

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (isActive !== null && isActive !== "all") {
      where.isActive = isActive === "true"
    }

    const templates = await db.emailTemplate.findMany({
      where,
      include: {
        _count: { select: { emailLogs: true } },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("Error fetching email templates:", error)
    return NextResponse.json(
      { error: "Failed to fetch email templates" },
      { status: 500 }
    )
  }
}

// POST /api/email/templates - Create new template
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = emailTemplateSchema.parse(body)

    // Check for existing slug
    const existing = await db.emailTemplate.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: "A template with this slug already exists" },
        { status: 400 }
      )
    }

    const template = await db.emailTemplate.create({
      data: validatedData as any,
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error("Error creating email template:", error)
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to create email template" },
      { status: 500 }
    )
  }
}
