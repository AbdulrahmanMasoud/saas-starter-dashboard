"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export default function SecuritySettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    passwordMinLength: "8",
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumber: true,
    passwordRequireSpecial: false,
    sessionTimeout: "30",
    maxLoginAttempts: "5",
    lockoutDuration: "15",
    twoFactorEnabled: false,
  })

  // Load existing settings
  useEffect(() => {
    fetch("/api/settings?group=security")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const settingsMap: Record<string, string> = {}
          data.forEach((s: { key: string; value: string }) => {
            settingsMap[s.key] = s.value
          })
          setSettings((prev) => ({
            ...prev,
            ...settingsMap,
            // Convert string booleans back to actual booleans
            passwordRequireUppercase: settingsMap.passwordRequireUppercase === "true" || prev.passwordRequireUppercase,
            passwordRequireLowercase: settingsMap.passwordRequireLowercase === "true" || prev.passwordRequireLowercase,
            passwordRequireNumber: settingsMap.passwordRequireNumber === "true" || prev.passwordRequireNumber,
            passwordRequireSpecial: settingsMap.passwordRequireSpecial === "true",
            twoFactorEnabled: settingsMap.twoFactorEnabled === "true",
          }))
        }
      })
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: "security",
          settings: Object.entries(settings).map(([key, value]) => ({
            key,
            value: String(value),
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      toast.success("Security settings saved successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Password Policy</CardTitle>
          <CardDescription>Configure password requirements for users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
            <Select
              value={settings.passwordMinLength}
              onValueChange={(value) => setSettings({ ...settings, passwordMinLength: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 characters</SelectItem>
                <SelectItem value="8">8 characters</SelectItem>
                <SelectItem value="10">10 characters</SelectItem>
                <SelectItem value="12">12 characters</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Require uppercase letter</Label>
              <Switch
                checked={settings.passwordRequireUppercase}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, passwordRequireUppercase: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Require lowercase letter</Label>
              <Switch
                checked={settings.passwordRequireLowercase}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, passwordRequireLowercase: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Require number</Label>
              <Switch
                checked={settings.passwordRequireNumber}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, passwordRequireNumber: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Require special character</Label>
              <Switch
                checked={settings.passwordRequireSpecial}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, passwordRequireSpecial: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Settings</CardTitle>
          <CardDescription>Configure session timeout and security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session Timeout</Label>
            <Select
              value={settings.sessionTimeout}
              onValueChange={(value) => setSettings({ ...settings, sessionTimeout: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="1440">24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login Protection</CardTitle>
          <CardDescription>Protect against brute force attacks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings({ ...settings, maxLoginAttempts: e.target.value })}
                min="3"
                max="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
              <Input
                id="lockoutDuration"
                type="number"
                value={settings.lockoutDuration}
                onChange={(e) => setSettings({ ...settings, lockoutDuration: e.target.value })}
                min="5"
                max="60"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable 2FA for all users</Label>
              <p className="text-xs text-muted-foreground">
                Require two-factor authentication for all user accounts
              </p>
            </div>
            <Switch
              checked={settings.twoFactorEnabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, twoFactorEnabled: checked })
              }
            />
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
