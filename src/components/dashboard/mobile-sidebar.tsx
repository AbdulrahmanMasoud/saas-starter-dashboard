"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSidebarStore } from "@/stores/sidebar-store"
import { navigation } from "@/config/navigation"
import { Sparkles } from "lucide-react"

export function MobileSidebar() {
  const pathname = usePathname()
  const { isMobileOpen, setMobileOpen } = useSidebarStore()

  return (
    <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle>
            <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">Dashboard</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)] px-2 py-4">
          <nav className="space-y-6">
            {navigation.map((group) => (
              <div key={group.title} className="space-y-1">
                <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </h4>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                    const Icon = item.icon

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1.5 text-xs font-medium">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
