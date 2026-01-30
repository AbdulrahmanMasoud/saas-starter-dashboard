import { db } from "@/lib/db"
import { RolesManager } from "./roles-manager"

export const metadata = {
  title: "Roles - Dashboard",
  description: "Manage user roles and permissions",
}

async function getRoles() {
  return db.role.findMany({
    include: {
      _count: { select: { users: true } },
    },
    orderBy: { name: "asc" },
  })
}

export default async function RolesPage() {
  const roles = await getRoles()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
        <p className="text-muted-foreground">
          Manage user roles and their associated permissions
        </p>
      </div>

      {/* Roles Manager */}
      <RolesManager initialRoles={roles as any} />
    </div>
  )
}
