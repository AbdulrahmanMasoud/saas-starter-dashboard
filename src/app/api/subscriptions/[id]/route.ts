import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { logActivity } from "@/lib/activity"
import { updateSubscriptionSchema } from "@/lib/validations/subscription"

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

    const subscription = await db.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        plan: true,
      },
    })

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
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
    const validatedFields = updateSubscriptionSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      )
    }

    // Check if subscription exists
    const existingSubscription = await db.subscription.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        plan: { select: { name: true } },
      },
    })

    if (!existingSubscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    const { planId, status, billingPeriod, cancelReason } = validatedFields.data

    // If changing plan, verify it exists and is active
    if (planId && planId !== existingSubscription.planId) {
      const newPlan = await db.plan.findUnique({
        where: { id: planId },
      })

      if (!newPlan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 })
      }

      if (newPlan.status !== "ACTIVE") {
        return NextResponse.json(
          { error: "Cannot change to inactive plan" },
          { status: 400 }
        )
      }
    }

    // Build update data
    const updateData: {
      planId?: string
      status?: "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED"
      billingPeriod?: "MONTHLY" | "YEARLY"
      cancelReason?: string | null
      canceledAt?: Date | null
      currentPeriodEnd?: Date
    } = {}

    if (planId) updateData.planId = planId
    if (billingPeriod) {
      updateData.billingPeriod = billingPeriod
      // Recalculate period end if billing period changes
      const periodMonths = billingPeriod === "YEARLY" ? 12 : 1
      const periodEnd = new Date(existingSubscription.currentPeriodStart)
      periodEnd.setMonth(periodEnd.getMonth() + periodMonths)
      updateData.currentPeriodEnd = periodEnd
    }

    if (status) {
      updateData.status = status

      // If canceling, set canceledAt
      if (status === "CANCELED") {
        updateData.canceledAt = new Date()
        updateData.cancelReason = cancelReason || null
      } else if (existingSubscription.status === "CANCELED") {
        // If reactivating, clear cancel data
        updateData.canceledAt = null
        updateData.cancelReason = null
      }
    }

    const subscription = await db.subscription.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Log activity
    const userName = existingSubscription.user.name || existingSubscription.user.email
    let description = `Updated subscription for ${userName}`
    if (status === "CANCELED") {
      description = `Canceled subscription for ${userName}`
    } else if (planId && planId !== existingSubscription.planId) {
      description = `Changed plan for ${userName}`
    }

    await logActivity({
      userId: session.user.id,
      action: "updated",
      entity: "subscription",
      entityId: subscription.id,
      description,
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error("Error updating subscription:", error)
    return NextResponse.json(
      { error: "Failed to update subscription" },
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

    // Check if subscription exists
    const subscription = await db.subscription.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        plan: { select: { name: true } },
      },
    })

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    await db.subscription.delete({
      where: { id },
    })

    // Log activity
    const userName = subscription.user.name || subscription.user.email
    await logActivity({
      userId: session.user.id,
      action: "deleted",
      entity: "subscription",
      entityId: id,
      description: `Deleted subscription for ${userName} from plan ${subscription.plan.name}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting subscription:", error)
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    )
  }
}
