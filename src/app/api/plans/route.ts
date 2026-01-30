import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { logActivity } from "@/lib/activity"
import { createPlanSchema } from "@/lib/validations/plan"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const plans = await db.plan.findMany({
      where: {
        ...(status && { status: status as "ACTIVE" | "INACTIVE" | "ARCHIVED" }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }),
      },
      include: {
        _count: { select: { subscriptions: true } },
      },
      orderBy: { sortOrder: "asc" },
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.error("Error fetching plans:", error)
    return NextResponse.json(
      { error: "Failed to fetch plans" },
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
    const validatedFields = createPlanSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      )
    }

    const { name, description, monthlyPrice, yearlyPrice, features, trialDays, status, sortOrder, isPopular } = validatedFields.data

    // Check if plan already exists
    const existingPlan = await db.plan.findUnique({
      where: { name },
    })

    if (existingPlan) {
      return NextResponse.json(
        { error: "Plan with this name already exists" },
        { status: 400 }
      )
    }

    const plan = await db.plan.create({
      data: {
        name,
        description,
        monthlyPrice,
        yearlyPrice,
        features: features as any,
        trialDays,
        status,
        sortOrder,
        isPopular,
      },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "created",
      entity: "plan",
      entityId: plan.id,
      description: `Created plan ${plan.name}`,
    })

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error("Error creating plan:", error)
    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    )
  }
}
