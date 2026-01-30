"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Eye, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { emailTemplateSchema, type EmailTemplateInput } from "@/lib/validations/email"
import { toast } from "sonner"

interface TemplateFormProps {
  template?: {
    id: string
    name: string
    slug: string
    subject: string
    htmlContent: string
    textContent: string | null
    description: string | null
    isActive: boolean
  }
}

export function TemplateForm({ template }: TemplateFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  const router = useRouter()
  const isEditing = !!template

  const form = useForm<EmailTemplateInput>({
    resolver: zodResolver(emailTemplateSchema) as any,
    defaultValues: {
      name: template?.name || "",
      slug: template?.slug || "",
      subject: template?.subject || "",
      htmlContent: template?.htmlContent || "",
      textContent: template?.textContent || "",
      description: template?.description || "",
      isActive: template?.isActive ?? true,
    },
  })

  const htmlContent = form.watch("htmlContent")

  async function onSubmit(values: EmailTemplateInput) {
    setIsLoading(true)

    try {
      const url = isEditing
        ? `/api/email/templates/${template.id}`
        : "/api/email/templates"

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save template")
      }

      toast.success(isEditing ? "Template updated" : "Template created")
      router.push("/dashboard/email/templates")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control as any}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Welcome Email"
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      if (!isEditing && !form.getValues("slug")) {
                        form.setValue("slug", generateSlug(e.target.value))
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>Display name for the template</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input
                    placeholder="welcome-email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>Used to reference this template in code</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control as any}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input
                  placeholder="Welcome to {{siteName}}!"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Email subject line. Use {"{{variableName}}"} for dynamic content.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  placeholder="Sent to new users when they register"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>Internal description of this template</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* HTML Content with Preview */}
        <div className="space-y-2">
          <FormLabel>HTML Content</FormLabel>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")}>
            <TabsList>
              <TabsTrigger value="edit">
                <Code className="mr-2 h-4 w-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="mt-2">
              <FormField
                control={form.control as any}
                name="htmlContent"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="<html>...</html>"
                        className="min-h-[400px] font-mono text-sm"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-2">
              <div
                className="min-h-[400px] border rounded-lg p-4 bg-white overflow-auto"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </TabsContent>
          </Tabs>
          <FormDescription>
            Use {"{{variableName}}"} syntax for template variables.
          </FormDescription>
        </div>

        {/* Plain Text Content */}
        <FormField
          control={form.control as any}
          name="textContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plain Text Content (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Plain text version for email clients that don't support HTML"
                  className="min-h-[150px] font-mono text-sm"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Fallback for email clients without HTML support
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>
                  Enable this template for sending emails
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Template" : "Create Template"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
