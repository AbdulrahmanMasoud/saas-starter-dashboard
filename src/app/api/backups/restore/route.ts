import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { logActivity } from "@/lib/activity"

interface BackupData {
  version: string
  createdAt: string
  createdBy: string
  data: {
    roles?: Array<{
      id: string
      name: string
      description?: string | null
      permissions: unknown
      isDefault: boolean
      createdAt: string
      updatedAt: string
    }>
    categories?: Array<{
      id: string
      name: string
      slug: string
      description?: string | null
      parentId?: string | null
      order: number
      createdAt: string
      updatedAt: string
    }>
    tags?: Array<{
      id: string
      name: string
      slug: string
      color?: string | null
      createdAt: string
      updatedAt: string
    }>
    settings?: Array<{
      id: string
      key: string
      value: string
      group: string
      createdAt: string
      updatedAt: string
    }>
    redirects?: Array<{
      id: string
      source: string
      destination: string
      statusCode: number
      hitCount: number
      isActive: boolean
      createdAt: string
      updatedAt: string
    }>
    emailTemplates?: Array<{
      id: string
      name: string
      slug: string
      subject: string
      htmlContent: string
      textContent?: string | null
      variables?: unknown
      description?: string | null
      isActive: boolean
      createdAt: string
      updatedAt: string
    }>
    plans?: Array<{
      id: string
      name: string
      description?: string | null
      monthlyPrice: string | number
      yearlyPrice: string | number
      features: unknown
      trialDays: number
      status: "ACTIVE" | "INACTIVE" | "ARCHIVED"
      sortOrder: number
      isPopular: boolean
      createdAt: string
      updatedAt: string
    }>
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const restoreOptions = formData.get("options") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Parse options
    const options = restoreOptions ? JSON.parse(restoreOptions) : {
      roles: true,
      categories: true,
      tags: true,
      settings: true,
      redirects: true,
      emailTemplates: true,
      plans: true,
    }

    // Read and parse backup file
    const content = await file.text()
    let backupData: BackupData

    try {
      backupData = JSON.parse(content)
    } catch {
      return NextResponse.json(
        { error: "Invalid backup file format" },
        { status: 400 }
      )
    }

    // Validate backup structure
    if (!backupData.version || !backupData.data) {
      return NextResponse.json(
        { error: "Invalid backup file structure" },
        { status: 400 }
      )
    }

    const results: Record<string, number> = {}

    // Restore roles (but not users to avoid auth issues)
    if (options.roles && backupData.data.roles) {
      let count = 0
      for (const role of backupData.data.roles) {
        try {
          await db.role.upsert({
            where: { id: role.id },
            update: {
              name: role.name,
              description: role.description,
              permissions: role.permissions as object,
              isDefault: role.isDefault,
            },
            create: {
              id: role.id,
              name: role.name,
              description: role.description,
              permissions: role.permissions as object,
              isDefault: role.isDefault,
            },
          })
          count++
        } catch {
          // Skip duplicate names
        }
      }
      results.roles = count
    }

    // Restore categories
    if (options.categories && backupData.data.categories) {
      // First pass: create all categories without parent references
      for (const cat of backupData.data.categories) {
        try {
          await db.category.upsert({
            where: { id: cat.id },
            update: {
              name: cat.name,
              slug: cat.slug,
              description: cat.description,
              order: cat.order,
            },
            create: {
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              description: cat.description,
              order: cat.order,
            },
          })
        } catch {
          // Skip duplicates
        }
      }
      // Second pass: set parent relationships
      for (const cat of backupData.data.categories) {
        if (cat.parentId) {
          try {
            await db.category.update({
              where: { id: cat.id },
              data: { parentId: cat.parentId },
            })
          } catch {
            // Skip if parent doesn't exist
          }
        }
      }
      results.categories = backupData.data.categories.length
    }

    // Restore tags
    if (options.tags && backupData.data.tags) {
      let count = 0
      for (const tag of backupData.data.tags) {
        try {
          await db.tag.upsert({
            where: { id: tag.id },
            update: {
              name: tag.name,
              slug: tag.slug,
              color: tag.color,
            },
            create: {
              id: tag.id,
              name: tag.name,
              slug: tag.slug,
              color: tag.color,
            },
          })
          count++
        } catch {
          // Skip duplicates
        }
      }
      results.tags = count
    }

    // Restore settings
    if (options.settings && backupData.data.settings) {
      let count = 0
      for (const setting of backupData.data.settings) {
        try {
          await db.setting.upsert({
            where: { key: setting.key },
            update: {
              value: setting.value,
              group: setting.group,
            },
            create: {
              key: setting.key,
              value: setting.value,
              group: setting.group,
            },
          })
          count++
        } catch {
          // Skip errors
        }
      }
      results.settings = count
    }

    // Restore redirects
    if (options.redirects && backupData.data.redirects) {
      let count = 0
      for (const redirect of backupData.data.redirects) {
        try {
          await db.redirect.upsert({
            where: { id: redirect.id },
            update: {
              source: redirect.source,
              destination: redirect.destination,
              statusCode: redirect.statusCode,
              isActive: redirect.isActive,
            },
            create: {
              id: redirect.id,
              source: redirect.source,
              destination: redirect.destination,
              statusCode: redirect.statusCode,
              isActive: redirect.isActive,
            },
          })
          count++
        } catch {
          // Skip duplicates
        }
      }
      results.redirects = count
    }

    // Restore email templates
    if (options.emailTemplates && backupData.data.emailTemplates) {
      let count = 0
      for (const template of backupData.data.emailTemplates) {
        try {
          await db.emailTemplate.upsert({
            where: { id: template.id },
            update: {
              name: template.name,
              slug: template.slug,
              subject: template.subject,
              htmlContent: template.htmlContent,
              textContent: template.textContent,
              variables: template.variables as object,
              description: template.description,
              isActive: template.isActive,
            },
            create: {
              id: template.id,
              name: template.name,
              slug: template.slug,
              subject: template.subject,
              htmlContent: template.htmlContent,
              textContent: template.textContent,
              variables: template.variables as object,
              description: template.description,
              isActive: template.isActive,
            },
          })
          count++
        } catch {
          // Skip duplicates
        }
      }
      results.emailTemplates = count
    }

    // Restore plans
    if (options.plans && backupData.data.plans) {
      let count = 0
      for (const plan of backupData.data.plans) {
        try {
          await db.plan.upsert({
            where: { id: plan.id },
            update: {
              name: plan.name,
              description: plan.description,
              monthlyPrice: plan.monthlyPrice,
              yearlyPrice: plan.yearlyPrice,
              features: plan.features as object,
              trialDays: plan.trialDays,
              status: plan.status,
              sortOrder: plan.sortOrder,
              isPopular: plan.isPopular,
            },
            create: {
              id: plan.id,
              name: plan.name,
              description: plan.description,
              monthlyPrice: plan.monthlyPrice,
              yearlyPrice: plan.yearlyPrice,
              features: plan.features as object,
              trialDays: plan.trialDays,
              status: plan.status,
              sortOrder: plan.sortOrder,
              isPopular: plan.isPopular,
            },
          })
          count++
        } catch {
          // Skip duplicates
        }
      }
      results.plans = count
    }

    await logActivity({
      userId: session.user.id,
      action: "restored",
      entity: "backup",
      description: `Restored backup from ${backupData.createdAt}`,
    })

    return NextResponse.json({
      success: true,
      message: "Backup restored successfully",
      results,
    })
  } catch (error) {
    console.error("Error restoring backup:", error)
    return NextResponse.json(
      { error: "Failed to restore backup" },
      { status: 500 }
    )
  }
}
