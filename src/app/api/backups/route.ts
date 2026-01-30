import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { logActivity } from "@/lib/activity"
import fs from "fs/promises"
import path from "path"

// Get backup directory
const BACKUP_DIR = path.join(process.cwd(), "backups")

// Ensure backup directory exists
async function ensureBackupDir() {
  try {
    await fs.access(BACKUP_DIR)
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "20")

    const backups = await db.backup.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return NextResponse.json(backups)
  } catch (error) {
    console.error("Error fetching backups:", error)
    return NextResponse.json(
      { error: "Failed to fetch backups" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user?.id) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 401 })
    }

    await ensureBackupDir()

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const fileName = `backup-${timestamp}.json`
    const filePath = path.join(BACKUP_DIR, fileName)

    // Create backup record first
    const backup = await db.backup.create({
      data: {
        name: `Backup ${new Date().toLocaleDateString()}`,
        fileName,
        fileSize: 0,
        status: "PENDING",
        tables: [],
        createdBy: session.user.id,
      },
    })

    try {
      // Export all data from database
      const [
        users,
        roles,
        posts,
        categories,
        tags,
        postTags,
        media,
        mediaFolders,
        seoMeta,
        redirects,
        settings,
        notifications,
        notificationPreferences,
        plansRaw,
        subscriptions,
        activityLogs,
        emailTemplates,
        emailLogs,
      ] = await Promise.all([
        db.user.findMany({ select: { id: true, name: true, email: true, roleId: true, createdAt: true } }),
        db.role.findMany(),
        db.post.findMany(),
        db.category.findMany(),
        db.tag.findMany(),
        db.postTag.findMany(),
        db.media.findMany(),
        db.mediaFolder.findMany(),
        db.seoMeta.findMany(),
        db.redirect.findMany(),
        db.setting.findMany(),
        db.notification.findMany(),
        db.notificationPreference.findMany(),
        db.plan.findMany(),
        db.subscription.findMany(),
        db.activityLog.findMany({ take: 1000, orderBy: { createdAt: "desc" } }),
        db.emailTemplate.findMany(),
        db.emailLog.findMany({ take: 500, orderBy: { createdAt: "desc" } }),
      ])

      // Convert Decimal to string for JSON serialization
      const plans = plansRaw.map((plan) => ({
        ...plan,
        monthlyPrice: plan.monthlyPrice.toString(),
        yearlyPrice: plan.yearlyPrice.toString(),
      }))

      const backupData = {
        version: "1.0",
        createdAt: new Date().toISOString(),
        createdBy: session.user.email,
        data: {
          users,
          roles,
          posts,
          categories,
          tags,
          postTags,
          media,
          mediaFolders,
          seoMeta,
          redirects,
          settings,
          notifications,
          notificationPreferences,
          plans,
          subscriptions,
          activityLogs,
          emailTemplates,
          emailLogs,
        },
      }

      const jsonContent = JSON.stringify(backupData, null, 2)
      const fileSize = Buffer.byteLength(jsonContent, "utf8")

      // Write backup file
      await fs.writeFile(filePath, jsonContent, "utf8")

      // Calculate total records
      const recordCount =
        users.length +
        roles.length +
        posts.length +
        categories.length +
        tags.length +
        postTags.length +
        media.length +
        mediaFolders.length +
        seoMeta.length +
        redirects.length +
        settings.length +
        notifications.length +
        notificationPreferences.length +
        plansRaw.length +
        subscriptions.length +
        activityLogs.length +
        emailTemplates.length +
        emailLogs.length

      // Update backup record
      const updatedBackup = await db.backup.update({
        where: { id: backup.id },
        data: {
          fileSize,
          status: "COMPLETED",
          recordCount,
          tables: [
            "users",
            "roles",
            "posts",
            "categories",
            "tags",
            "postTags",
            "media",
            "mediaFolders",
            "seoMeta",
            "redirects",
            "settings",
            "notifications",
            "notificationPreferences",
            "plans",
            "subscriptions",
            "activityLogs",
            "emailTemplates",
            "emailLogs",
          ],
        },
      })

      await logActivity({
        userId: session.user.id,
        action: "created",
        entity: "backup",
        entityId: backup.id,
        description: `Created backup with ${recordCount} records`,
      })

      return NextResponse.json(updatedBackup)
    } catch (error) {
      // Update backup as failed
      await db.backup.update({
        where: { id: backup.id },
        data: {
          status: "FAILED",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      })
      throw error
    }
  } catch (error) {
    console.error("Error creating backup:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create backup" },
      { status: 500 }
    )
  }
}
