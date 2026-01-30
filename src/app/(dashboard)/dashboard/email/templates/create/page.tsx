import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TemplateForm } from "../template-form"

export const metadata = {
  title: "Create Email Template - Dashboard",
  description: "Create a new email template",
}

export default function CreateEmailTemplatePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Email Template</h1>
        <p className="text-muted-foreground">
          Create a new reusable email template
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
          <CardDescription>
            Design your email template with HTML and dynamic variables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateForm />
        </CardContent>
      </Card>
    </div>
  )
}
