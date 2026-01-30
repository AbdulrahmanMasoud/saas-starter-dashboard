import { create } from "zustand"

export interface Notification {
  id: string
  title: string
  message: string
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR"
  category: "SYSTEM" | "POST" | "USER" | "SUBSCRIPTION" | "SECURITY" | "COMMENT"
  isRead: boolean
  link?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: Date | string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  lastFetched: Date | null

  // Actions
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAsUnread: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  removeNotification: (id: string) => Promise<void>
  clearAllRead: () => Promise<void>

  // Local-only actions (for optimistic updates)
  addNotification: (notification: Notification) => void
  setNotifications: (notifications: Notification[]) => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/notifications?limit=50")
      if (!response.ok) throw new Error("Failed to fetch notifications")

      const data = await response.json()
      set({
        notifications: data.notifications,
        unreadCount: data.unreadCount,
        isLoading: false,
        lastFetched: new Date(),
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch",
      })
    }
  },

  markAsRead: async (id) => {
    // Optimistic update
    const { notifications, unreadCount } = get()
    const notification = notifications.find((n) => n.id === id)
    if (!notification || notification.isRead) return

    set({
      notifications: notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, unreadCount - 1),
    })

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      })
      if (!response.ok) throw new Error("Failed to mark as read")
    } catch {
      // Revert on failure
      set({
        notifications: notifications.map((n) =>
          n.id === id ? { ...n, isRead: false } : n
        ),
        unreadCount: unreadCount,
      })
    }
  },

  markAsUnread: async (id) => {
    // Optimistic update
    const { notifications, unreadCount } = get()
    const notification = notifications.find((n) => n.id === id)
    if (!notification || !notification.isRead) return

    set({
      notifications: notifications.map((n) =>
        n.id === id ? { ...n, isRead: false } : n
      ),
      unreadCount: unreadCount + 1,
    })

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: false }),
      })
      if (!response.ok) throw new Error("Failed to mark as unread")
    } catch {
      // Revert on failure
      set({
        notifications: notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: unreadCount,
      })
    }
  },

  markAllAsRead: async () => {
    // Optimistic update
    const { notifications } = get()
    set({
      notifications: notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
      })
      if (!response.ok) throw new Error("Failed to mark all as read")
    } catch {
      // Revert on failure
      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      })
    }
  },

  removeNotification: async (id) => {
    // Optimistic update
    const { notifications, unreadCount } = get()
    const notification = notifications.find((n) => n.id === id)
    if (!notification) return

    set({
      notifications: notifications.filter((n) => n.id !== id),
      unreadCount: notification.isRead ? unreadCount : Math.max(0, unreadCount - 1),
    })

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete notification")
    } catch {
      // Revert on failure
      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      })
    }
  },

  clearAllRead: async () => {
    // Optimistic update - remove only read notifications
    const { notifications } = get()
    const unreadNotifications = notifications.filter((n) => !n.isRead)

    set({ notifications: unreadNotifications })

    try {
      const response = await fetch("/api/notifications?readOnly=true", {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to clear notifications")
    } catch {
      // Revert on failure
      set({ notifications })
    }
  },

  // Local-only actions
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
    }))
  },

  setNotifications: (notifications) => {
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    })
  },
}))
