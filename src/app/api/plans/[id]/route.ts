import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { logActivity } from "@/lib/activity"
import { updatePlanSchema } from "@/lib/validations/plan"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const plan = await db.plan.findUnique({
      where: { id },
      include: {
        _count: { select: { subscriptions: true } },
      },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    return NextResponse.json(plan)
  } catch (error) {
    console.error("Error fetching plan:", error)
    return NextResponse.json(
      { error: "Failed to fetch plan" },
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
    const validatedFields = updatePlanSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      )
    }

    // Check if plan exists
    const existingPlan = await db.plan.findUnique({
      where: { id },
    })

    if (!existingPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Check if name is being changed and already exists
    if (validatedFields.data.name && validatedFields.data.name !== existingPlan.name) {
      const nameExists = await db.plan.findUnique({
        where: { name: validatedFields.data.name },
      })

      if (nameExists) {
        return NextResponse.json(
          { error: "Plan with this name already exists" },
          { status: 400 }
        )
      }
    }

    const plan = await db.plan.update({
      where: { id },
      data: validatedFields.data as any,
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "updated",
      entity: "plan",
      entityId: plan.id,
      description: `Updated plan ${plan.name}`,
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error("Error updating plan:", error)
    return NextResponse.json(
      { error: "Failed to update plan" },
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

    // Check if plan exists
    const plan = await db.plan.findUnique({
      where: { id },
      include: {
        _count: { select: { subscriptions: true } },
      },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Check if plan has active subscriptions
    if (plan._count.subscriptions > 0) {
      return NextResponse.json(
        { error: "Cannot delete plan with active subscriptions" },
        { status: 400 }
      )
    }

    await db.plan.delete({
      where: { id },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "deleted",
      entity: "plan",
      entityId: id,
      description: `Deleted plan ${plan.name}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting plan:", error)
    return NextResponse.json(
      { error: "Failed to delete plan" },
      { status: 500 }
    )
  }
}
