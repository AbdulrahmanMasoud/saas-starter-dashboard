import { db } from "@/lib/db"
import type { NotificationType, NotificationCategory } from "@prisma/client"

interface CreateNotificationOptions {
  userId: string
  title: string
  message: string
  type?: NotificationType
  category?: NotificationCategory
  link?: string
  metadata?: Record<string, unknown>
}

/**
 * Create a notification for a user
 * Respects user's notification preferences
 */
export async function createNotification(options: CreateNotificationOptions) {
  const {
    userId,
    title,
    message,
    type = "INFO",
    category = "SYSTEM",
    link,
    metadata,
  } = options

  // Check user preferences
  const preference = await db.notificationPreference.findUnique({
    where: {
      userId_category: {
        userId,
        category,
      },
    },
  })

  // If user has disabled in-app notifications for this category, skip
  if (preference && !preference.inApp) {
    return null
  }

  const notification = await db.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      category,
      link,
      metadata: metadata as any,
    },
  })

  return notification
}

/**
 * Create notifications for multiple users
 */
export async function createNotifications(
  userIds: string[],
  notification: Omit<CreateNotificationOptions, "userId">
) {
  const results = await Promise.all(
    userIds.map((userId) =>
      createNotification({ ...notification, userId })
    )
  )
  return results.filter(Boolean)
}

/**
 * Send system notification to all admins
 */
export async function notifyAdmins(
  notification: Omit<CreateNotificationOptions, "userId" | "category">
) {
  const admins = await db.user.findMany({
    where: {
      role: {
        name: "Admin",
      },
    },
    select: { id: true },
  })

  return createNotifications(
    admins.map((a) => a.id),
    { ...notification, category: "SYSTEM" }
  )
}

/**
 * Notification templates for common events
 */
export const NotificationTemplates = {
  // Post notifications
  postPublished: (postTitle: string, postId: string) => ({
    title: "Post Published",
    message: `Your post "${postTitle}" has been published.`,
    type: "SUCCESS" as NotificationType,
    category: "POST" as NotificationCategory,
    link: `/dashboard/posts/${postId}`,
  }),

  postCommented: (postTitle: string, commenterName: string, postId: string) => ({
    title: "New Comment",
    message: `${commenterName} commented on your post "${postTitle}".`,
    type: "INFO" as NotificationType,
    category: "COMMENT" as NotificationCategory,
    link: `/dashboard/posts/${postId}`,
  }),

  // User notifications
  welcomeUser: (userName: string) => ({
    title: "Welcome!",
    message: `Welcome to the dashboard, ${userName}! Get started by exploring the features.`,
    type: "SUCCESS" as NotificationType,
    category: "SYSTEM" as NotificationCategory,
    link: "/dashboard",
  }),

  roleChanged: (newRole: string) => ({
    title: "Role Updated",
    message: `Your role has been changed to ${newRole}.`,
    type: "INFO" as NotificationType,
    category: "USER" as NotificationCategory,
  }),

  // Subscription notifications
  subscriptionStarted: (planName: string) => ({
    title: "Subscription Active",
    message: `Your ${planName} subscription is now active.`,
    type: "SUCCESS" as NotificationType,
    category: "SUBSCRIPTION" as NotificationCategory,
    link: "/dashboard/profile",
  }),

  subscriptionExpiring: (planName: string, daysLeft: number) => ({
    title: "Subscription Expiring Soon",
    message: `Your ${planName} subscription will expire in ${daysLeft} days.`,
    type: "WARNING" as NotificationType,
    category: "SUBSCRIPTION" as NotificationCategory,
    link: "/dashboard/profile",
  }),

  subscriptionCanceled: (planName: string) => ({
    title: "Subscription Canceled",
    message: `Your ${planName} subscription has been canceled.`,
    type: "INFO" as NotificationType,
    category: "SUBSCRIPTION" as NotificationCategory,
  }),

  // Security notifications
  passwordChanged: () => ({
    title: "Password Changed",
    message: "Your password has been successfully changed.",
    type: "SUCCESS" as NotificationType,
    category: "SECURITY" as NotificationCategory,
  }),

  newLoginDetected: (location: string) => ({
    title: "New Login Detected",
    message: `A new login was detected from ${location}. If this wasn't you, please secure your account.`,
    type: "WARNING" as NotificationType,
    category: "SECURITY" as NotificationCategory,
    link: "/dashboard/settings/security",
  }),

  // System notifications
  maintenanceScheduled: (date: string) => ({
    title: "Scheduled Maintenance",
    message: `System maintenance is scheduled for ${date}. Please save your work.`,
    type: "WARNING" as NotificationType,
    category: "SYSTEM" as NotificationCategory,
  }),

  systemUpdate: (version: string) => ({
    title: "System Updated",
    message: `The system has been updated to version ${version}.`,
    type: "INFO" as NotificationType,
    category: "SYSTEM" as NotificationCategory,
  }),
}
