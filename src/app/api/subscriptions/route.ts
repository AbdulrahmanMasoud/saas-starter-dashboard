import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { logActivity } from "@/lib/activity"
import { createSubscriptionSchema } from "@/lib/validations/subscription"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const planId = searchParams.get("planId")
    const search = searchParams.get("search")

    const subscriptions = await db.subscription.findMany({
      where: {
        ...(status && { status: status as "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED" }),
        ...(planId && { planId }),
        ...(search && {
          user: {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
            ],
          },
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            monthlyPrice: true,
            yearlyPrice: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
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
    const validatedFields = createSubscriptionSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      )
    }

    const { userId, planId, billingPeriod, startTrial } = validatedFields.data

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user already has a subscription
    if (user.subscription) {
      return NextResponse.json(
        { error: "User already has an active subscription" },
        { status: 400 }
      )
    }

    // Check if plan exists and is active
    const plan = await db.plan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    if (plan.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Cannot subscribe to inactive plan" },
        { status: 400 }
      )
    }

    // Calculate period dates
    const now = new Date()
    const periodMonths = billingPeriod === "YEARLY" ? 12 : 1
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + periodMonths)

    // Calculate trial dates if applicable
    let trialStart: Date | null = null
    let trialEnd: Date | null = null
    let subscriptionStatus: "TRIALING" | "ACTIVE" = "ACTIVE"

    if (startTrial && plan.trialDays > 0) {
      trialStart = now
      trialEnd = new Date(now)
      trialEnd.setDate(trialEnd.getDate() + plan.trialDays)
      subscriptionStatus = "TRIALING"
    }

    const subscription = await db.subscription.create({
      data: {
        userId,
        planId,
        billingPeriod,
        status: subscriptionStatus,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        trialStart,
        trialEnd,
      },
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
    await logActivity({
      userId: session.user.id,
      action: "created",
      entity: "subscription",
      entityId: subscription.id,
      description: `Created subscription for ${user.name || user.email} on plan ${plan.name}`,
    })

    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error("Error creating subscription:", error)
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    )
  }
}
