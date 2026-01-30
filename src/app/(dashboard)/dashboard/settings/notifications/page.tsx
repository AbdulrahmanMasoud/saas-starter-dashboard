"use client"

import { useState, useEffect } from "react"
import { Loader2, Bell, Mail, Monitor, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface NotificationPreference {
  category: string
  email: boolean
  inApp: boolean
}

const categoryInfo: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
  SYSTEM: {
    label: "System",
    description: "Important system updates, maintenance notices, and announcements",
    icon: <Monitor className="h-5 w-5" />,
  },
  POST: {
    label: "Posts",
    description: "Notifications about your posts being published, updated, or commented on",
    icon: <Bell className="h-5 w-5" />,
  },
  USER: {
    label: "Users",
    description: "Updates about your account, role changes, and team activities",
    icon: <Bell className="h-5 w-5" />,
  },
  SUBSCRIPTION: {
    label: "Subscriptions",
    description: "Billing alerts, subscription changes, and renewal reminders",
    icon: <Bell className="h-5 w-5" />,
  },
  SECURITY: {
    label: "Security",
    description: "Login alerts, password changes, and security-related notifications",
    icon: <Bell className="h-5 w-5" />,
  },
  COMMENT: {
    label: "Comments",
    description: "New comments and replies on your content",
    icon: <Bell className="h-5 w-5" />,
  },
}

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function loadPreferences() {
      try {
        const response = await fetch("/api/notifications/preferences")
        if (!response.ok) throw new Error("Failed to load preferences")
        const data = await response.json()
        setPreferences(data.preferences)
      } catch (error) {
        toast.error("Failed to load notification preferences")
      } finally {
        setIsLoading(false)
      }
    }
    loadPreferences()
  }, [])

  const handleToggle = (category: string, type: "email" | "inApp", value: boolean) => {
    setPreferences((prev) =>
      prev.map((p) =>
        p.category === category ? { ...p, [type]: value } : p
      )
    )
  }

  const handleToggleAll = (type: "email" | "inApp", value: boolean) => {
    setPreferences((prev) =>
      prev.map((p) => ({ ...p, [type]: value }))
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      })

      if (!response.ok) throw new Error("Failed to save preferences")
      toast.success("Notification preferences saved")
    } catch (error) {
      toast.error("Failed to save notification preferences")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const allEmailEnabled = preferences.every((p) => p.email)
  const allInAppEnabled = preferences.every((p) => p.inApp)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notification Preferences</h1>
        <p className="text-muted-foreground">
          Manage how and when you receive notifications
        </p>
      </div>

      {/* Info Card */}
      <Card>
        <CardContent className="flex items-start gap-4 pt-6">
          <div className="rounded-lg bg-primary/10 p-2">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">About Notifications</p>
            <p className="text-sm text-muted-foreground">
              Choose which notifications you want to receive via email or in the dashboard.
              Security notifications for critical alerts like password changes cannot be fully disabled.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Master Toggles */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Settings</CardTitle>
          <CardDescription>Enable or disable all notifications at once</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-base">All Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch
              checked={allEmailEnabled}
              onCheckedChange={(checked) => handleToggleAll("email", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-base">All In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  See notifications in the dashboard
                </p>
              </div>
            </div>
            <Switch
              checked={allInAppEnabled}
              onCheckedChange={(checked) => handleToggleAll("inApp", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Categories</CardTitle>
          <CardDescription>
            Fine-tune notifications for each category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {preferences.map((pref, index) => {
              const info = categoryInfo[pref.category]
              return (
                <div key={pref.category}>
                  {index > 0 && <Separator className="mb-6" />}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-muted p-2">
                        {info?.icon || <Bell className="h-5 w-5" />}
                      </div>
                      <div>
                        <h4 className="font-medium">{info?.label || pref.category}</h4>
                        <p className="text-sm text-muted-foreground">
                          {info?.description || "Notifications for this category"}
                        </p>
                      </div>
                    </div>
                    <div className="ml-12 grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor={`${pref.category}-email`}>Email</Label>
                        </div>
                        <Switch
                          id={`${pref.category}-email`}
                          checked={pref.email}
                          onCheckedChange={(checked) =>
                            handleToggle(pref.category, "email", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor={`${pref.category}-inApp`}>In-App</Label>
                        </div>
                        <Switch
                          id={`${pref.category}-inApp`}
                          checked={pref.inApp}
                          onCheckedChange={(checked) =>
                            handleToggle(pref.category, "inApp", checked)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Preferences
        </Button>
      </div>
    </div>
  )
}
