"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebarStore } from "@/stores/sidebar-store"
import { navigation } from "@/config/navigation"
import { ChevronLeft, Sparkles } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const { isCollapsed, toggle } = useSidebarStore()

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r bg-sidebar transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={cn(
            "flex h-16 items-center border-b px-4",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              {!isCollapsed && (
                <span className="font-semibold text-lg">Dashboard</span>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                isCollapsed && "absolute -right-3 top-6 z-50 rounded-full border bg-background shadow-md"
              )}
              onClick={toggle}
            >
              <ChevronLeft className={cn(
                "h-4 w-4 transition-transform",
                isCollapsed && "rotate-180"
              )} />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-2 py-4">
            <nav className="space-y-6">
              {navigation.map((group) => (
                <div key={group.title} className="space-y-1">
                  {!isCollapsed && (
                    <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.title}
                    </h4>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      // For /dashboard, only match exact path. For others, also match child routes
                      const isActive = item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname === item.href || pathname.startsWith(`${item.href}/`)
                      const Icon = item.icon

                      const navLink = (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            isCollapsed && "justify-center px-2"
                          )}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          {!isCollapsed && (
                            <>
                              <span className="flex-1">{item.title}</span>
                              {item.badge && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1.5 text-xs font-medium">
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </Link>
                      )

                      if (isCollapsed) {
                        return (
                          <Tooltip key={item.href}>
                            <TooltipTrigger asChild>
                              {navLink}
                            </TooltipTrigger>
                            <TooltipContent side="right" className="flex items-center gap-2">
                              {item.title}
                              {item.badge && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1.5 text-xs font-medium">
                                  {item.badge}
                                </span>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        )
                      }

                      return navLink
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </ScrollArea>
        </div>
      </aside>
    </TooltipProvider>
  )
}
