import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { sendEmail, sendTemplateEmail, testSmtpConnection, getSmtpConfig } from "@/lib/email/service"
import { sendEmailSchema, sendTemplateEmailSchema } from "@/lib/validations/email"

// POST /api/email/send - Send email
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type } = body

    if (type === "template") {
      // Send using template
      const { to, templateSlug, variables, cc, bcc } = sendTemplateEmailSchema.parse(body)

      const emailId = await sendTemplateEmail({
        to,
        templateSlug,
        variables: variables as Record<string, string>,
        cc,
        bcc,
        metadata: { sentBy: session.user.id },
      })

      return NextResponse.json({
        success: true,
        emailId,
        message: "Email sent successfully"
      })
    } else {
      // Send direct email
      const { to, subject, html, text, cc, bcc } = sendEmailSchema.parse(body)

      const emailId = await sendEmail({
        to,
        subject,
        html,
        text,
        cc,
        bcc,
        metadata: { sentBy: session.user.id },
      })

      return NextResponse.json({
        success: true,
        emailId,
        message: "Email sent successfully"
      })
    }
  } catch (error) {
    console.error("Error sending email:", error)
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid email data" }, { status: 400 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    )
  }
}

// GET /api/email/send - Test SMTP connection
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const config = await getSmtpConfig()

    if (!config) {
      return NextResponse.json({
        configured: false,
        connected: false,
        message: "SMTP not configured"
      })
    }

    const connected = await testSmtpConnection()

    return NextResponse.json({
      configured: true,
      connected,
      message: connected ? "SMTP connection successful" : "SMTP connection failed",
      config: {
        host: config.host,
        port: config.port,
        secure: config.secure,
        from: config.from,
        fromName: config.fromName,
      }
    })
  } catch (error) {
    console.error("Error testing SMTP:", error)
    return NextResponse.json(
      {
        configured: false,
        connected: false,
        error: error instanceof Error ? error.message : "Failed to test SMTP"
      },
      { status: 500 }
    )
  }
}
