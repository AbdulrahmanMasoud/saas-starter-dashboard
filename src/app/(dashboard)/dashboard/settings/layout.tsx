"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Settings, Palette, Mail, Puzzle, Shield, Database, Bell } from "lucide-react"

const settingsNav = [
  {
    title: "General",
    href: "/dashboard/settings/general",
    icon: Settings,
    description: "Basic site settings",
  },
  {
    title: "Appearance",
    href: "/dashboard/settings/appearance",
    icon: Palette,
    description: "Logo, colors, theme",
  },
  {
    title: "Notifications",
    href: "/dashboard/settings/notifications",
    icon: Bell,
    description: "Notification preferences",
  },
  {
    title: "Email",
    href: "/dashboard/settings/email",
    icon: Mail,
    description: "SMTP configuration",
  },
  {
    title: "Integrations",
    href: "/dashboard/settings/integrations",
    icon: Puzzle,
    description: "Analytics, scripts",
  },
  {
    title: "Security",
    href: "/dashboard/settings/security",
    icon: Shield,
    description: "Password policy, sessions",
  },
  {
    title: "Backup",
    href: "/dashboard/settings/backup",
    icon: Database,
    description: "Database backup",
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and preferences
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Settings Navigation */}
        <nav className="lg:w-64 shrink-0">
          <ul className="space-y-1">
            {settingsNav.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div
                        className={cn(
                          "text-xs",
                          isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}
                      >
                        {item.description}
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Settings Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
