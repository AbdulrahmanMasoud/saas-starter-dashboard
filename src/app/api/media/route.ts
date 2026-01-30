import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { logActivity, getVerifiedUser } from "@/lib/activity"

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const media = await db.media.findMany({
      include: {
        folder: { select: { name: true } },
        uploader: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error("Error fetching media:", error)
    return NextResponse.json(
      { error: "Failed to fetch media" },
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

    const formData = await req.formData()
    const file = formData.get("file") as File
    const folderId = formData.get("folderId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Verify the uploader exists
    const uploader = await getVerifiedUser(session.user.id)
    if (!uploader) {
      return NextResponse.json(
        { error: "User not found. Please sign out and sign in again." },
        { status: 400 }
      )
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const extension = path.extname(file.name)
    const fileName = `${timestamp}-${randomStr}${extension}`
    const filePath = path.join(uploadDir, fileName)

    // Write file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Get image dimensions if applicable
    let width: number | undefined
    let height: number | undefined

    // Create media record
    const media = await db.media.create({
      data: {
        name: file.name.replace(extension, ""),
        fileName,
        fileType: file.type,
        fileSize: file.size,
        url: `/uploads/${fileName}`,
        width,
        height,
        folderId: folderId || null,
        uploadedBy: session.user.id,
      },
    })

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "uploaded",
      entity: "media",
      entityId: media.id,
      description: `Uploaded file "${file.name}"`,
    })

    return NextResponse.json(media, { status: 201 })
  } catch (error) {
    console.error("Error uploading media:", error)
    return NextResponse.json(
      { error: "Failed to upload media" },
      { status: 500 }
    )
  }
}
