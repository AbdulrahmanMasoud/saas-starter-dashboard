import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { logActivity } from "@/lib/activity"
import fs from "fs/promises"
import path from "path"

const BACKUP_DIR = path.join(process.cwd(), "backups")

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const backup = await db.backup.findUnique({
      where: { id },
    })

    if (!backup) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 })
    }

    // Read backup file
    const filePath = path.join(BACKUP_DIR, backup.fileName)

    try {
      const fileContent = await fs.readFile(filePath, "utf8")

      // Return as downloadable JSON file
      return new NextResponse(fileContent, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${backup.fileName}"`,
        },
      })
    } catch {
      return NextResponse.json(
        { error: "Backup file not found on disk" },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error("Error downloading backup:", error)
    return NextResponse.json(
      { error: "Failed to download backup" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const backup = await db.backup.findUnique({
      where: { id },
    })

    if (!backup) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 })
    }

    // Delete backup file from disk
    const filePath = path.join(BACKUP_DIR, backup.fileName)
    try {
      await fs.unlink(filePath)
    } catch {
      // File might already be deleted, continue
    }

    // Delete backup record
    await db.backup.delete({
      where: { id },
    })

    await logActivity({
      userId: session.user.id,
      action: "deleted",
      entity: "backup",
      entityId: id,
      description: `Deleted backup: ${backup.name}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting backup:", error)
    return NextResponse.json(
      { error: "Failed to delete backup" },
      { status: 500 }
    )
  }
}
