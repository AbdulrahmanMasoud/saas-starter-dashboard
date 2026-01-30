import { db } from "@/lib/db"

/**
 * Verify that a user exists in the database
 * Useful for validating session user IDs before using them as foreign keys
 */
export async function verifyUserExists(userId: string | undefined): Promise<boolean> {
  if (!userId) return false

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })
    return !!user
  } catch {
    return false
  }
}

/**
 * Get a verified user from the database, returning null if not found
 */
export async function getVerifiedUser(userId: string | undefined) {
  if (!userId) return null

  try {
    return await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    })
  } catch {
    return null
  }
}

interface LogActivityOptions {
  userId: string | undefined
  action: string
  entity: string
  entityId?: string
  description?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Safely log an activity, verifying the user exists first
 * to prevent foreign key constraint violations
 */
export async function logActivity(options: LogActivityOptions) {
  const { userId, action, entity, entityId, description, metadata, ipAddress, userAgent } = options

  if (!userId) return null

  try {
    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!user) return null

    const activityLog = await db.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        description,
        metadata: metadata as any,
        ipAddress,
        userAgent,
      },
    })

    return activityLog
  } catch (error) {
    console.error("Failed to log activity:", error)
    return null
  }
}
