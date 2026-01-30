"use client"

import { useEffect, useCallback } from "react"
import { Bell, Check, Trash2, ExternalLink, RefreshCw, CheckCheck, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotificationStore, type Notification } from "@/stores/notification-store"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

const typeColors = {
  INFO: "bg-blue-500",
  SUCCESS: "bg-green-500",
  WARNING: "bg-yellow-500",
  ERROR: "bg-red-500",
}

const categoryLabels = {
  SYSTEM: "System",
  POST: "Posts",
  USER: "Users",
  SUBSCRIPTION: "Subscriptions",
  SECURITY: "Security",
  COMMENT: "Comments",
}

export function NotificationsDropdown() {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllRead,
  } = useNotificationStore()

  // Fetch notifications on mount and set up polling
  useEffect(() => {
    fetchNotifications()

    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const handleRefresh = useCallback(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              <span className="sr-only">Refresh</span>
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={markAllAsRead}
              >
                <CheckCheck className="mr-1 h-3 w-3" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications list */}
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm font-medium">No notifications</p>
              <p className="mt-1 text-xs text-muted-foreground">
                You&apos;re all caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => markAsRead(notification.id)}
                  onRemove={() => removeNotification(notification.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between p-2">
              <Link href="/dashboard/settings/notifications">
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  Notification settings
                </Button>
              </Link>
              {notifications.some((n) => n.isRead) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground hover:text-destructive"
                  onClick={clearAllRead}
                >
                  Clear read
                </Button>
              )}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onRemove,
}: {
  notification: Notification
  onMarkAsRead: () => void
  onRemove: () => void
}) {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead()
    }
  }

  return (
    <div
      className={cn(
        "group relative flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
        !notification.isRead && "bg-primary/5"
      )}
    >
      {/* Type indicator */}
      <div className="flex flex-col items-center gap-1 pt-0.5">
        <div
          className={cn(
            "h-2 w-2 shrink-0 rounded-full",
            typeColors[notification.type]
          )}
        />
        {!notification.isRead && (
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm leading-tight",
              !notification.isRead ? "font-semibold" : "font-medium"
            )}
          >
            {notification.title}
          </p>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">
          {notification.message}
        </p>

        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-[10px] text-muted-foreground/70">
            {categoryLabels[notification.category]}
          </span>
          {notification.link && (
            <Link
              href={notification.link}
              className="inline-flex items-center text-xs text-primary hover:underline"
              onClick={handleClick}
            >
              View
              <ExternalLink className="ml-0.5 h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              onMarkAsRead()
            }}
          >
            <Check className="h-3 w-3" />
            <span className="sr-only">Mark as read</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
        >
          <Trash2 className="h-3 w-3" />
          <span className="sr-only">Remove</span>
        </Button>
      </div>
    </div>
  )
}
