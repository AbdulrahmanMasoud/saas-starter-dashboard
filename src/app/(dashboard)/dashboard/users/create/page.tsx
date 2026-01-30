import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateUserForm } from "./form"
import { db } from "@/lib/db"

export const metadata = {
  title: "Create User - Dashboard",
  description: "Create a new user",
}

async function getRoles() {
  return db.role.findMany({
    orderBy: { name: "asc" },
  })
}

export default async function CreateUserPage() {
  const roles = await getRoles()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
          <p className="text-muted-foreground">Add a new user to the system</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Enter the details for the new user account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateUserForm roles={roles} />
        </CardContent>
      </Card>
    </div>
  )
}
