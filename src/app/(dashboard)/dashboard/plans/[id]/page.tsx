import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EditPlanForm } from "./form"
import { db } from "@/lib/db"

export const metadata = {
  title: "Edit Plan - Dashboard",
  description: "Edit subscription plan details",
}

interface PageProps {
  params: Promise<{ id: string }>
}

async function getPlan(id: string) {
  return db.plan.findUnique({
    where: { id },
    include: {
      _count: { select: { subscriptions: true } },
    },
  })
}

export default async function EditPlanPage({ params }: PageProps) {
  const { id } = await params
  const plan = await getPlan(id)

  if (!plan) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/plans">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Edit Plan</h1>
          <p className="text-muted-foreground">
            Update plan information and settings
          </p>
        </div>
        {plan._count.subscriptions > 0 && (
          <Badge variant="secondary">
            {plan._count.subscriptions} subscriber{plan._count.subscriptions !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Warning for plans with subscribers */}
      {plan._count.subscriptions > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            This plan has active subscribers. Changes will affect all current subscribers.
          </p>
        </div>
      )}

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Plan Information</CardTitle>
          <CardDescription>
            Make changes to the subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditPlanForm
            plan={{
              ...plan,
              monthlyPrice: Number(plan.monthlyPrice),
              yearlyPrice: Number(plan.yearlyPrice),
              features: plan.features as {
                maxUsers?: number | null
                maxStorage?: number | null
                maxApiCalls?: number | null
                featureFlags?: string[]
              },
            }}
            hasSubscribers={plan._count.subscriptions > 0}
          />
        </CardContent>
      </Card>
    </div>
  )
}
