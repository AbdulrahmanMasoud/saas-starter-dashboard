import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EditUserForm } from "./form"
import { db } from "@/lib/db"

export const metadata = {
  title: "Edit User - Dashboard",
  description: "Edit user details",
}

interface PageProps {
  params: Promise<{ id: string }>
}

async function getUser(id: string) {
  return db.user.findUnique({
    where: { id },
    include: { role: true },
  })
}

async function getRoles() {
  return db.role.findMany({
    orderBy: { name: "asc" },
  })
}

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params
  const [user, roles] = await Promise.all([getUser(id), getRoles()])

  if (!user) {
    notFound()
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
          <p className="text-muted-foreground">
            Update user information and settings
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Make changes to the user account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditUserForm user={user} roles={roles} />
        </CardContent>
      </Card>
    </div>
  )
}
