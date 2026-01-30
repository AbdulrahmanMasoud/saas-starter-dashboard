import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreatePlanForm } from "./form"

export const metadata = {
  title: "Create Plan - Dashboard",
  description: "Create a new subscription plan",
}

export default function CreatePlanPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/plans">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Plan</h1>
          <p className="text-muted-foreground">Add a new subscription plan</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Plan Information</CardTitle>
          <CardDescription>
            Enter the details for the new subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreatePlanForm />
        </CardContent>
      </Card>
    </div>
  )
}
