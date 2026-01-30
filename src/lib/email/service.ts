import nodemailer from "nodemailer"
import { db } from "@/lib/db"
import type { EmailStatus } from "@prisma/client"

interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
  fromName: string
}

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  cc?: string | string[]
  bcc?: string | string[]
  templateId?: string
  metadata?: Record<string, unknown>
}

interface SendTemplateEmailOptions {
  to: string | string[]
  templateSlug: string
  variables: Record<string, string>
  cc?: string | string[]
  bcc?: string | string[]
  metadata?: Record<string, unknown>
}

// Get SMTP configuration from settings
export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  const settings = await db.setting.findMany({
    where: {
      key: {
        in: [
          "smtp_host",
          "smtp_port",
          "smtp_secure",
          "smtp_user",
          "smtp_pass",
          "smtp_from",
          "smtp_from_name",
        ],
      },
    },
  })

  const config: Record<string, string> = {}
  settings.forEach((s) => {
    config[s.key] = s.value
  })

  if (!config.smtp_host || !config.smtp_user || !config.smtp_pass) {
    return null
  }

  return {
    host: config.smtp_host,
    port: parseInt(config.smtp_port || "587"),
    secure: config.smtp_secure === "true",
    user: config.smtp_user,
    pass: config.smtp_pass,
    from: config.smtp_from || config.smtp_user,
    fromName: config.smtp_from_name || "Dashboard",
  }
}

// Create nodemailer transporter
export async function createTransporter() {
  const config = await getSmtpConfig()

  if (!config) {
    throw new Error("SMTP not configured. Please configure email settings.")
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  })
}

// Parse variables in template content
export function parseTemplate(
  content: string,
  variables: Record<string, string>
): string {
  let parsed = content
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g")
    parsed = parsed.replace(regex, value)
  }
  return parsed
}

// Send email directly
export async function sendEmail(options: SendEmailOptions): Promise<string> {
  const config = await getSmtpConfig()

  if (!config) {
    throw new Error("SMTP not configured")
  }

  // Create email log first
  const emailLog = await db.emailLog.create({
    data: {
      templateId: options.templateId || null,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      cc: options.cc
        ? Array.isArray(options.cc)
          ? options.cc.join(", ")
          : options.cc
        : null,
      bcc: options.bcc
        ? Array.isArray(options.bcc)
          ? options.bcc.join(", ")
          : options.bcc
        : null,
      subject: options.subject,
      htmlContent: options.html,
      textContent: options.text || null,
      status: "PENDING",
      metadata: (options.metadata ?? undefined) as any,
    },
  })

  try {
    const transporter = await createTransporter()

    await transporter.sendMail({
      from: `"${config.fromName}" <${config.from}>`,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    // Update log as sent
    await db.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: "SENT",
        sentAt: new Date(),
        attempts: { increment: 1 },
      },
    })

    return emailLog.id
  } catch (error) {
    // Update log as failed
    await db.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
        attempts: { increment: 1 },
      },
    })

    throw error
  }
}

// Send email using template
export async function sendTemplateEmail(
  options: SendTemplateEmailOptions
): Promise<string> {
  const template = await db.emailTemplate.findUnique({
    where: { slug: options.templateSlug },
  })

  if (!template) {
    throw new Error(`Email template "${options.templateSlug}" not found`)
  }

  if (!template.isActive) {
    throw new Error(`Email template "${options.templateSlug}" is disabled`)
  }

  const subject = parseTemplate(template.subject, options.variables)
  const html = parseTemplate(template.htmlContent, options.variables)
  const text = template.textContent
    ? parseTemplate(template.textContent, options.variables)
    : undefined

  return sendEmail({
    to: options.to,
    cc: options.cc,
    bcc: options.bcc,
    subject,
    html,
    text,
    templateId: template.id,
    metadata: options.metadata,
  })
}

// Retry failed emails
export async function retryFailedEmail(emailLogId: string): Promise<void> {
  const emailLog = await db.emailLog.findUnique({
    where: { id: emailLogId },
  })

  if (!emailLog) {
    throw new Error("Email log not found")
  }

  if (emailLog.status === "SENT") {
    throw new Error("Email already sent")
  }

  const config = await getSmtpConfig()
  if (!config) {
    throw new Error("SMTP not configured")
  }

  try {
    const transporter = await createTransporter()

    await transporter.sendMail({
      from: `"${config.fromName}" <${config.from}>`,
      to: emailLog.to,
      cc: emailLog.cc || undefined,
      bcc: emailLog.bcc || undefined,
      subject: emailLog.subject,
      html: emailLog.htmlContent,
      text: emailLog.textContent || undefined,
    })

    await db.emailLog.update({
      where: { id: emailLogId },
      data: {
        status: "SENT",
        sentAt: new Date(),
        error: null,
        attempts: { increment: 1 },
      },
    })
  } catch (error) {
    await db.emailLog.update({
      where: { id: emailLogId },
      data: {
        error: error instanceof Error ? error.message : "Unknown error",
        attempts: { increment: 1 },
      },
    })
    throw error
  }
}

// Test SMTP connection
export async function testSmtpConnection(): Promise<boolean> {
  try {
    const transporter = await createTransporter()
    await transporter.verify()
    return true
  } catch {
    return false
  }
}

// Get email statistics
export async function getEmailStats() {
  const [total, sent, failed, pending] = await Promise.all([
    db.emailLog.count(),
    db.emailLog.count({ where: { status: "SENT" } }),
    db.emailLog.count({ where: { status: "FAILED" } }),
    db.emailLog.count({ where: { status: "PENDING" } }),
  ])

  return { total, sent, failed, pending }
}
