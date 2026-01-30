"use client"

import * as React from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  primaryColorKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  mounted: boolean
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  mounted: false,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

// Convert hex to HSL string
function hexToHsl(hex: string): string {
  hex = hex.replace(/^#/, "")
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
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`
}

// Apply primary color to CSS variables
function applyPrimaryColor(hex: string) {
  if (typeof window === "undefined") return
  const hsl = hexToHsl(hex)
  const root = document.documentElement
  root.style.setProperty("--primary", hsl)
  root.style.setProperty("--ring", hsl)
  root.style.setProperty("--sidebar-primary", hsl)
  root.style.setProperty("--sidebar-ring", hsl)
  root.style.setProperty("--chart-1", hsl)
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "dashboard-theme",
  primaryColorKey = "dashboard-primary-color",
  ...props
}: ThemeProviderProps) {
  // Always start with defaultTheme to avoid hydration mismatch
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [mounted, setMounted] = React.useState(false)

  // Read from localStorage only after mount
  React.useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme | null
    if (storedTheme) {
      setThemeState(storedTheme)
    }

    // Apply saved primary color
    const storedColor = localStorage.getItem(primaryColorKey)
    if (storedColor) {
      applyPrimaryColor(storedColor)
    }

    setMounted(true)
  }, [storageKey, primaryColorKey])

  // Apply theme to document
  React.useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const setTheme = React.useCallback((newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme)
    setThemeState(newTheme)
  }, [storageKey])

  const value = React.useMemo(() => ({
    theme,
    setTheme,
    mounted,
  }), [theme, setTheme, mounted])

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
