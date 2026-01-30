import { z } from "zod"

export const emailTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  subject: z.string().min(1, "Subject is required").max(200),
  htmlContent: z.string().min(1, "HTML content is required"),
  textContent: z.string().optional(),
  variables: z.record(z.string(), z.string()).optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
})

export const updateEmailTemplateSchema = emailTemplateSchema.partial()

export const sendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1, "Subject is required"),
  html: z.string().min(1, "HTML content is required"),
  text: z.string().optional(),
  cc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  bcc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
})

export const sendTemplateEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  templateSlug: z.string().min(1, "Template slug is required"),
  variables: z.record(z.string(), z.string()),
  cc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  bcc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
})

export const smtpSettingsSchema = z.object({
  smtp_host: z.string().min(1, "SMTP host is required"),
  smtp_port: z.string().regex(/^\d+$/, "Port must be a number"),
  smtp_secure: z.enum(["true", "false"]),
  smtp_user: z.string().min(1, "SMTP user is required"),
  smtp_pass: z.string().min(1, "SMTP password is required"),
  smtp_from: z.string().email("Invalid email address"),
  smtp_from_name: z.string().min(1, "From name is required"),
})

export type EmailTemplateInput = z.infer<typeof emailTemplateSchema>
export type UpdateEmailTemplateInput = z.infer<typeof updateEmailTemplateSchema>
export type SendEmailInput = z.infer<typeof sendEmailSchema>
export type SendTemplateEmailInput = z.infer<typeof sendTemplateEmailSchema>
export type SmtpSettingsInput = z.infer<typeof smtpSettingsSchema>
