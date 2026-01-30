"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "@/components/providers/theme-provider"
import { toast } from "sonner"

// Update favicon in the browser
function updateFavicon(url: string) {
  if (typeof document === "undefined") return

  // Simply update existing favicon or create new one
  let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null
  if (link) {
    link.href = url
  } else {
    link = document.createElement("link")
    link.rel = "icon"
    link.href = url
    document.head.appendChild(link)
  }
}

const colorPresets = [
  { name: "Violet", value: "#6366f1", hsl: "238.7 83.5% 66.7%" },
  { name: "Blue", value: "#3b82f6", hsl: "217.2 91.2% 59.8%" },
  { name: "Green", value: "#22c55e", hsl: "142.1 76.2% 36.3%" },
  { name: "Orange", value: "#f97316", hsl: "24.6 95% 53.1%" },
  { name: "Red", value: "#ef4444", hsl: "0 84.2% 60.2%" },
  { name: "Pink", value: "#ec4899", hsl: "330.4 81.2% 60.4%" },
]

// Convert hex to HSL string
function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, "")

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`
}

// Apply primary color to CSS variables
function applyPrimaryColor(hex: string) {
  const hsl = hexToHsl(hex)
  const root = document.documentElement
  root.style.setProperty("--primary", hsl)
  root.style.setProperty("--ring", hsl)
  root.style.setProperty("--sidebar-primary", hsl)
  root.style.setProperty("--sidebar-ring", hsl)
  root.style.setProperty("--chart-1", hsl)
}

const PRIMARY_COLOR_KEY = "dashboard-primary-color"

export default function AppearanceSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState<"logo" | "favicon" | null>(null)
  const { theme, setTheme, mounted } = useTheme()
  const [settings, setSettings] = useState({
    logo: "",
    favicon: "",
    primaryColor: "#6366f1",
  })

  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File, type: "logo" | "favicon") => {
    setIsUploading(type)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload file")
      }

      const media = await response.json()
      setSettings((prev) => ({ ...prev, [type]: media.url }))
      toast.success(`${type === "logo" ? "Logo" : "Favicon"} uploaded successfully`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload file")
    } finally {
      setIsUploading(null)
    }
  }

  // Load saved settings on mount
  useEffect(() => {
    // Load primary color from localStorage (for instant apply)
    const savedColor = localStorage.getItem(PRIMARY_COLOR_KEY)
    if (savedColor) {
      setSettings((prev) => ({ ...prev, primaryColor: savedColor }))
      applyPrimaryColor(savedColor)
    }

    // Load other settings from API
    fetch("/api/settings?group=appearance")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const settingsMap: Record<string, string> = {}
          data.forEach((s: { key: string; value: string }) => {
            settingsMap[s.key] = s.value
          })
          setSettings((prev) => ({ ...prev, ...settingsMap }))

          // Apply favicon if saved
          if (settingsMap.favicon) {
            updateFavicon(settingsMap.favicon)
          }
        }
      })
      .catch(() => {})
  }, [])

  const handleColorChange = useCallback((color: string) => {
    setSettings((prev) => ({ ...prev, primaryColor: color }))
    applyPrimaryColor(color)
    localStorage.setItem(PRIMARY_COLOR_KEY, color)
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: "appearance",
          settings: Object.entries(settings).map(([key, value]) => ({
            key,
            value: String(value),
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      // Apply favicon immediately
      if (settings.favicon) {
        updateFavicon(settings.favicon)
      }

      toast.success("Settings saved successfully")
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
          <CardTitle>Theme</CardTitle>
          <CardDescription>Choose how the dashboard looks</CardDescription>
        </CardHeader>
        <CardContent>
          {!mounted ? (
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <RadioGroup
              value={theme}
              onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="light" id="light" className="peer sr-only" />
                <Label
                  htmlFor="light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-full bg-white border shadow-sm" />
                  <span className="mt-2">Light</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                <Label
                  htmlFor="dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-full bg-zinc-900 border" />
                  <span className="mt-2">Dark</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="system" id="system" className="peer sr-only" />
                <Label
                  htmlFor="system"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-white to-zinc-900 border" />
                  <span className="mt-2">System</span>
                </Label>
              </div>
            </RadioGroup>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Logo and favicon settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL</Label>
            <div className="flex gap-2">
              <Input
                id="logo"
                value={settings.logo}
                onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                placeholder="/uploads/logo.png or https://example.com/logo.png"
              />
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, "logo")
                  e.target.value = ""
                }}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploading === "logo"}
              >
                {isUploading === "logo" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
            </div>
            {settings.logo && (
              <div className="mt-2 p-4 border rounded-md bg-muted/50">
                <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                <img
                  src={settings.logo}
                  alt="Logo preview"
                  className="max-h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="favicon">Favicon URL</Label>
            <div className="flex gap-2">
              <Input
                id="favicon"
                value={settings.favicon}
                onChange={(e) => setSettings({ ...settings, favicon: e.target.value })}
                placeholder="/uploads/favicon.ico or https://example.com/favicon.ico"
              />
              <input
                ref={faviconInputRef}
                type="file"
                accept="image/*,.ico"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, "favicon")
                  e.target.value = ""
                }}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => faviconInputRef.current?.click()}
                disabled={isUploading === "favicon"}
              >
                {isUploading === "favicon" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended: 32x32 or 64x64 pixels in .ico, .png, or .svg format
            </p>
            {settings.favicon && (
              <div className="mt-2 p-4 border rounded-md bg-muted/50 flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 border rounded bg-background">
                  <img
                    src={settings.favicon}
                    alt="Favicon preview"
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">Favicon preview</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Primary Color</CardTitle>
          <CardDescription>Choose your brand color (applies immediately)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3">
            {colorPresets.map((color) => (
              <button
                key={color.value}
                className={`h-10 w-full rounded-md border-2 transition-all ${
                  settings.primaryColor === color.value
                    ? "border-foreground scale-105"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleColorChange(color.value)}
                title={color.name}
              />
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Label htmlFor="customColor">Custom:</Label>
            <Input
              id="customColor"
              type="color"
              value={settings.primaryColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="h-10 w-20"
            />
            <Input
              value={settings.primaryColor}
              onChange={(e) => {
                const value = e.target.value
                if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                  handleColorChange(value)
                } else {
                  setSettings((prev) => ({ ...prev, primaryColor: value }))
                }
              }}
              placeholder="#6366f1"
              className="w-28"
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
