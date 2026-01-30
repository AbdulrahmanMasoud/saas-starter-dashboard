"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/lib/hooks/use-debounce"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { navigation } from "@/config/navigation"
import {
  Search,
  FileText,
  User,
  Settings,
  ArrowRight,
  CreditCard,
  Loader2,
} from "lucide-react"

type SearchResults = {
  posts: Array<{
    id: string
    title: string
    slug: string
    status: string
    author: { name: string | null }
  }>
  users: Array<{
    id: string
    name: string | null
    email: string
    image: string | null
    role: { name: string } | null
  }>
  plans: Array<{
    id: string
    name: string
    monthlyPrice: number
    status: string
  }>
}

export function SearchCommand() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResults | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()
  const debouncedQuery = useDebounce(query, 300)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Search when debounced query changes
  React.useEffect(() => {
    async function search() {
      if (debouncedQuery.length < 2) {
        setResults(null)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data)
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    search()
  }, [debouncedQuery])

  // Reset when dialog closes
  React.useEffect(() => {
    if (!open) {
      setQuery("")
      setResults(null)
    }
  }, [open])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  const hasResults = results && (results.posts.length > 0 || results.users.length > 0 || results.plans.length > 0)

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start bg-muted/50 text-sm text-muted-foreground sm:w-64 sm:pr-12"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline-flex">Search...</span>
        <span className="inline-flex sm:hidden">Search</span>
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search posts, users, plans..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && query.length >= 2 && !hasResults && (
            <CommandEmpty>No results found for &quot;{query}&quot;</CommandEmpty>
          )}

          {!isLoading && hasResults && (
            <>
              {/* Posts Results */}
              {results.posts.length > 0 && (
                <CommandGroup heading="Posts">
                  {results.posts.map((post) => (
                    <CommandItem
                      key={post.id}
                      onSelect={() => runCommand(() => router.push(`/dashboard/posts/${post.id}`))}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <div className="flex-1">
                        <p>{post.title}</p>
                        <p className="text-xs text-muted-foreground">
                          by {post.author.name || "Unknown"}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {post.status}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Users Results */}
              {results.users.length > 0 && (
                <CommandGroup heading="Users">
                  {results.users.map((user) => {
                    const initials = user.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"

                    return (
                      <CommandItem
                        key={user.id}
                        onSelect={() => runCommand(() => router.push(`/dashboard/users/${user.id}`))}
                      >
                        <Avatar className="mr-2 h-6 w-6">
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p>{user.name || "Unnamed"}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        {user.role && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {user.role.name}
                          </Badge>
                        )}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}

              {/* Plans Results */}
              {results.plans.length > 0 && (
                <CommandGroup heading="Plans">
                  {results.plans.map((plan) => (
                    <CommandItem
                      key={plan.id}
                      onSelect={() => runCommand(() => router.push(`/dashboard/plans/${plan.id}`))}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      <div className="flex-1">
                        <p>{plan.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ${Number(plan.monthlyPrice).toFixed(2)}/mo
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {plan.status}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              <CommandSeparator />
            </>
          )}

          {/* Navigation - always show */}
          {(!query || query.length < 2) && (
            <>
              {navigation.map((group) => (
                <CommandGroup key={group.title} heading={group.title}>
                  {group.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <CommandItem
                        key={item.href}
                        onSelect={() => runCommand(() => router.push(item.href))}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.title}
                        <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              ))}
              <CommandSeparator />
            </>
          )}

          {/* Quick Actions - always show */}
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/posts/new"))}>
              <FileText className="mr-2 h-4 w-4" />
              Create new post
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/users/create"))}>
              <User className="mr-2 h-4 w-4" />
              Create new user
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/profile"))}>
              <User className="mr-2 h-4 w-4" />
              View profile
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              Open settings
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
