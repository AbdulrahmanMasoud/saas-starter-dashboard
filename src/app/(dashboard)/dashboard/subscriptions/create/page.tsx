import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateSubscriptionForm } from "./form"
import { db } from "@/lib/db"

export const metadata = {
  title: "Create Subscription - Dashboard",
  description: "Assign a subscription to a user",
}

async function getUsers() {
  return db.user.findMany({
    where: {
      subscription: null, // Only users without a subscription
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: "asc" },
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
      trialDays: true,
    },
    orderBy: { sortOrder: "asc" },
  })
}

export default async function CreateSubscriptionPage() {
  const [users, plans] = await Promise.all([getUsers(), getPlans()])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/subscriptions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Subscription</h1>
          <p className="text-muted-foreground">Assign a subscription plan to a user</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
          <CardDescription>
            Select a user and plan to create a new subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateSubscriptionForm
            users={users}
            plans={plans.map((p) => ({
              ...p,
              monthlyPrice: Number(p.monthlyPrice),
              yearlyPrice: Number(p.yearlyPrice),
            }))}
          />
        </CardContent>
      </Card>
    </div>
  )
}
