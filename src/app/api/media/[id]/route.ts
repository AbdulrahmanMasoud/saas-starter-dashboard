import { NextRequest, NextResponse } from "next/server"
import { unlink } from "fs/promises"
import path from "path"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { logActivity } from "@/lib/activity"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const media = await db.media.findUnique({
      where: { id },
      include: {
        folder: true,
        uploader: { select: { name: true, image: true } },
      },
    })

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    return NextResponse.json(media)
  } catch (error) {
    console.error("Error fetching media:", error)
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const existingMedia = await db.media.findUnique({
      where: { id },
    })

    if (!existingMedia) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    const { name, alt, folderId } = body

    const media = await db.media.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(alt !== undefined && { alt }),
        ...(folderId !== undefined && { folderId }),
      },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "updated",
      entity: "media",
      entityId: media.id,
      description: `Updated media "${media.name}"`,
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error("Error updating media:", error)
    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existingMedia = await db.media.findUnique({
      where: { id },
    })

    if (!existingMedia) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    // Delete file from disk
    try {
      const filePath = path.join(process.cwd(), "public", existingMedia.url)
      await unlink(filePath)
    } catch {
      console.warn("Could not delete file from disk:", existingMedia.url)
    }

    // Delete record from database
    await db.media.delete({
      where: { id },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "deleted",
      entity: "media",
      entityId: id,
      description: `Deleted media "${existingMedia.name}"`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting media:", error)
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    )
  }
}
