import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { EmailTemplatesTable } from "./templates-table"

export const metadata = {
  title: "Email Templates - Dashboard",
  description: "Manage email templates",
}

async function getTemplates() {
  return db.emailTemplate.findMany({
    include: {
      _count: { select: { emailLogs: true } },
    },
    orderBy: { name: "asc" },
  })
}

export default async function EmailTemplatesPage() {
  const templates = await getTemplates()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground">
            Manage and customize email templates
          </p>
        </div>
        <Link href="/dashboard/email/templates/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </Link>
      </div>

      {/* Templates Table */}
      <EmailTemplatesTable templates={templates} />
    </div>
  )
}
