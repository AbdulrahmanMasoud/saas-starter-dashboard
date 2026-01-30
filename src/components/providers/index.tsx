"use client"

import { ThemeProvider } from "./theme-provider"
import { SessionProvider } from "./session-provider"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="dark" storageKey="dashboard-theme">
        {children}
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </SessionProvider>
  )
}
