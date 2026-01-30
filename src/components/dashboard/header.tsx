"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebarStore } from "@/stores/sidebar-store"
import { SearchCommand } from "./search-command"
import { ThemeToggle } from "./theme-toggle"
import { NotificationsDropdown } from "./notifications-dropdown"
import { UserMenu } from "./user-menu"
import { cn } from "@/lib/utils"

export function Header() {
  const { isCollapsed, setMobileOpen } = useSidebarStore()

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
        isCollapsed ? "lg:pl-20" : "lg:pl-68"
      )}
    >
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Search */}
      <div className="flex-1">
        <SearchCommand />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationsDropdown />
        <UserMenu />
      </div>
    </header>
  )
}
