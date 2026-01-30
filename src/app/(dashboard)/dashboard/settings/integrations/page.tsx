"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function IntegrationsSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    googleAnalyticsId: "",
    googleTagManagerId: "",
    facebookPixelId: "",
    customHeadScripts: "",
    customBodyScripts: "",
  })

  // Load existing settings
  useEffect(() => {
    fetch("/api/settings?group=integrations")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const settingsMap: Record<string, string> = {}
          data.forEach((s: { key: string; value: string }) => {
            settingsMap[s.key] = s.value
          })
          setSettings((prev) => ({ ...prev, ...settingsMap }))
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
          group: "integrations",
          settings: Object.entries(settings).map(([key, value]) => ({
            key,
            value: String(value),
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      toast.success("Integration settings saved successfully")
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
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Connect your analytics services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
            <Input
              id="googleAnalyticsId"
              value={settings.googleAnalyticsId}
              onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
              placeholder="G-XXXXXXXXXX"
            />
            <p className="text-xs text-muted-foreground">
              Your Google Analytics 4 measurement ID
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
            <Input
              id="googleTagManagerId"
              value={settings.googleTagManagerId}
              onChange={(e) => setSettings({ ...settings, googleTagManagerId: e.target.value })}
              placeholder="GTM-XXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
            <Input
              id="facebookPixelId"
              value={settings.facebookPixelId}
              onChange={(e) => setSettings({ ...settings, facebookPixelId: e.target.value })}
              placeholder="XXXXXXXXXXXXXXX"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Scripts</CardTitle>
          <CardDescription>Add custom JavaScript or tracking codes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customHeadScripts">Head Scripts</Label>
            <Textarea
              id="customHeadScripts"
              value={settings.customHeadScripts}
              onChange={(e) => setSettings({ ...settings, customHeadScripts: e.target.value })}
              placeholder="<!-- Scripts to add before </head> -->"
              rows={5}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Scripts that should be loaded in the &lt;head&gt; section
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customBodyScripts">Body Scripts</Label>
            <Textarea
              id="customBodyScripts"
              value={settings.customBodyScripts}
              onChange={(e) => setSettings({ ...settings, customBodyScripts: e.target.value })}
              placeholder="<!-- Scripts to add before </body> -->"
              rows={5}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Scripts that should be loaded at the end of &lt;body&gt;
            </p>
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
