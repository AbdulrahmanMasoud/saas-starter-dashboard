import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"
import { TemplateForm } from "../template-form"

export const metadata = {
  title: "Edit Email Template - Dashboard",
  description: "Edit an email template",
}

interface PageProps {
  params: Promise<{ id: string }>
}

async function getTemplate(id: string) {
  return db.emailTemplate.findUnique({
    where: { id },
  })
}

export default async function EditEmailTemplatePage({ params }: PageProps) {
  const { id } = await params
  const template = await getTemplate(id)

  if (!template) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Email Template</h1>
        <p className="text-muted-foreground">
          Modify the {template.name} template
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
          <CardDescription>
            Update your email template content and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateForm template={template} />
        </CardContent>
      </Card>
    </div>
  )
}
