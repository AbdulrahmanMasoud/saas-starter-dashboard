"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Loader2, TestTube2, CheckCircle, XCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export default function EmailSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "connected" | "failed">("unknown")
  const [settings, setSettings] = useState({
    smtp_host: "",
    smtp_port: "587",
    smtp_user: "",
    smtp_pass: "",
    smtp_secure: "false",
    smtp_from: "",
    smtp_from_name: "",
  })
  const [testEmail, setTestEmail] = useState("")

  // Load existing settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/settings?group=email")
        if (response.ok) {
          const data = await response.json()
          const loaded: Record<string, string> = {}
          data.forEach((s: { key: string; value: string }) => {
            loaded[s.key] = s.value
          })
          setSettings((prev) => ({ ...prev, ...loaded }))
        }
      } catch (error) {
        console.error("Failed to load settings:", error)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: "email",
          settings: Object.entries(settings).map(([key, value]) => ({
            key,
            value: String(value),
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      toast.success("Email settings saved successfully")
      setConnectionStatus("unknown")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    setConnectionStatus("unknown")
    try {
      const response = await fetch("/api/email/send")
      const data = await response.json()

      if (data.connected) {
        setConnectionStatus("connected")
        toast.success("SMTP connection successful!")
      } else {
        setConnectionStatus("failed")
        toast.error(data.message || "SMTP connection failed")
      }
    } catch (error) {
      setConnectionStatus("failed")
      toast.error("Failed to test connection")
    } finally {
      setIsTesting(false)
    }
  }

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error("Please enter a test email address")
      return
    }

    setIsSending(true)
    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmail,
          subject: "Test Email from Dashboard",
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>Test Email</h2>
              <p>This is a test email from your dashboard to verify SMTP configuration.</p>
              <p>If you received this email, your SMTP settings are working correctly!</p>
              <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toLocaleString()}</p>
            </div>
          `,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to send test email")
      }

      toast.success("Test email sent! Check your inbox.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send test email")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Email Management</CardTitle>
          <CardDescription>Quick access to email features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard/email/templates">
              <Button variant="outline">
                <ExternalLink className="mr-2 h-4 w-4" />
                Email Templates
              </Button>
            </Link>
            <Link href="/dashboard/email/logs">
              <Button variant="outline">
                <ExternalLink className="mr-2 h-4 w-4" />
                Email Logs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* SMTP Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>SMTP Configuration</CardTitle>
              <CardDescription>Configure your email server settings</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {connectionStatus === "connected" && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
              )}
              {connectionStatus === "failed" && (
                <Badge variant="destructive">
                  <XCircle className="mr-1 h-3 w-3" />
                  Failed
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtp_host">SMTP Host</Label>
              <Input
                id="smtp_host"
                value={settings.smtp_host}
                onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                placeholder="smtp.example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp_port">SMTP Port</Label>
              <Select
                value={settings.smtp_port}
                onValueChange={(value) => setSettings({ ...settings, smtp_port: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 (Default)</SelectItem>
                  <SelectItem value="465">465 (SSL)</SelectItem>
                  <SelectItem value="587">587 (TLS)</SelectItem>
                  <SelectItem value="2525">2525 (Alternative)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtp_user">SMTP Username</Label>
              <Input
                id="smtp_user"
                value={settings.smtp_user}
                onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp_pass">SMTP Password</Label>
              <Input
                id="smtp_pass"
                type="password"
                value={settings.smtp_pass}
                onChange={(e) => setSettings({ ...settings, smtp_pass: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Use SSL/TLS</Label>
              <p className="text-xs text-muted-foreground">
                Enable secure connection (required for port 465)
              </p>
            </div>
            <Switch
              checked={settings.smtp_secure === "true"}
              onCheckedChange={(checked) => setSettings({ ...settings, smtp_secure: checked ? "true" : "false" })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sender Information */}
      <Card>
        <CardHeader>
          <CardTitle>Sender Information</CardTitle>
          <CardDescription>Default sender for outgoing emails</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtp_from_name">From Name</Label>
              <Input
                id="smtp_from_name"
                value={settings.smtp_from_name}
                onChange={(e) => setSettings({ ...settings, smtp_from_name: e.target.value })}
                placeholder="My Company"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp_from">From Email</Label>
              <Input
                id="smtp_from"
                type="email"
                value={settings.smtp_from}
                onChange={(e) => setSettings({ ...settings, smtp_from: e.target.value })}
                placeholder="noreply@example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Email */}
      <Card>
        <CardHeader>
          <CardTitle>Test Connection</CardTitle>
          <CardDescription>Verify your SMTP configuration is working</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleTestConnection} disabled={isTesting}>
              {isTesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <TestTube2 className="mr-2 h-4 w-4" />
              )}
              Test Connection
            </Button>
          </div>
          <div className="border-t pt-4">
            <Label className="mb-2 block">Send Test Email</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
              <Button variant="outline" onClick={handleSendTestEmail} disabled={isSending}>
                {isSending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Send"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
}
