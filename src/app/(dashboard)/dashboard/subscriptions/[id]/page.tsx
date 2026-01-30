import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, CreditCard, User } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { EditSubscriptionForm } from "./form"
import { db } from "@/lib/db"

export const metadata = {
  title: "Subscription Details - Dashboard",
  description: "View and manage subscription details",
}

interface PageProps {
  params: Promise<{ id: string }>
}

async function getSubscription(id: string) {
  return db.subscription.findUnique({
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
}

async function getPlans() {
  return db.plan.findMany({
    where: {
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      monthlyPrice: true,
      yearlyPrice: true,
    },
    orderBy: { sortOrder: "asc" },
  })
}

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  TRIALING: "secondary",
  ACTIVE: "default",
  PAST_DUE: "destructive",
  CANCELED: "outline",
  EXPIRED: "outline",
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

export default async function SubscriptionDetailPage({ params }: PageProps) {
  const { id } = await params
  const [subscription, plans] = await Promise.all([
    getSubscription(id),
    getPlans(),
  ])

  if (!subscription) {
    notFound()
  }

  const user = subscription.user
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U"

  const currentPrice =
    subscription.billingPeriod === "YEARLY"
      ? Number(subscription.plan.yearlyPrice)
      : Number(subscription.plan.monthlyPrice)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/subscriptions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Subscription Details</h1>
          <p className="text-muted-foreground">
            View and manage subscription information
          </p>
        </div>
        <Badge variant={statusVariants[subscription.status] || "outline"}>
          {subscription.status.charAt(0) + subscription.status.slice(1).toLowerCase().replace("_", " ")}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Subscription Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Subscription Information</CardTitle>
            <CardDescription>Current subscription details and billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.name || "Unnamed"}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto" asChild>
                <Link href={`/dashboard/users/${user.id}`}>
                  <User className="mr-2 h-4 w-4" />
                  View User
                </Link>
              </Button>
            </div>

            <Separator />

            {/* Plan & Billing */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="font-medium">{subscription.plan.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Billing Period</p>
                <p className="font-medium">
                  {subscription.billingPeriod === "YEARLY" ? "Yearly" : "Monthly"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-medium">
                  {formatPrice(currentPrice)}/{subscription.billingPeriod === "YEARLY" ? "year" : "month"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={statusVariants[subscription.status] || "outline"}>
                  {subscription.status.charAt(0) + subscription.status.slice(1).toLowerCase().replace("_", " ")}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Dates */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Period Start</p>
                  <p className="font-medium">
                    {format(new Date(subscription.currentPeriodStart), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Period End</p>
                  <p className="font-medium">
                    {format(new Date(subscription.currentPeriodEnd), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
              {subscription.trialEnd && (
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Trial Ends</p>
                    <p className="font-medium">
                      {format(new Date(subscription.trialEnd), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}
              {subscription.canceledAt && (
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Canceled At</p>
                    <p className="font-medium">
                      {format(new Date(subscription.canceledAt), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {subscription.cancelReason && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Cancellation Reason</p>
                  <p className="mt-1">{subscription.cancelReason}</p>
                </div>
              </>
            )}

            <Separator />

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <p>Created {format(new Date(subscription.createdAt), "MMMM d, yyyy")}</p>
              <span>·</span>
              <p>Last updated {format(new Date(subscription.updatedAt), "MMMM d, yyyy")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Subscription</CardTitle>
            <CardDescription>
              Change plan, billing, or cancel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditSubscriptionForm
              subscription={{
                id: subscription.id,
                planId: subscription.planId,
                status: subscription.status,
                billingPeriod: subscription.billingPeriod,
                cancelReason: subscription.cancelReason,
              }}
              plans={plans.map((p) => ({
                ...p,
                monthlyPrice: Number(p.monthlyPrice),
                yearlyPrice: Number(p.yearlyPrice),
              }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
