import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { z } from "zod"

const updateFolderSchema = z.object({
  name: z.string().min(1, "Name is required"),
})

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

    const folder = await db.mediaFolder.findUnique({
      where: { id },
      include: {
        _count: { select: { media: true, children: true } },
      },
    })

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    return NextResponse.json(folder)
  } catch (error) {
    console.error("Error fetching folder:", error)
    return NextResponse.json(
      { error: "Failed to fetch folder" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const validatedFields = updateFolderSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      )
    }

    const { name } = validatedFields.data

    // Check if folder exists
    const existingFolder = await db.mediaFolder.findUnique({
      where: { id },
    })

    if (!existingFolder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    // Check if another folder with the same name exists in the same parent
    const duplicateFolder = await db.mediaFolder.findFirst({
      where: {
        name,
        parentId: existingFolder.parentId,
        NOT: { id },
      },
    })

    if (duplicateFolder) {
      return NextResponse.json(
        { error: `A folder named "${name}" already exists in this location` },
        { status: 400 }
      )
    }

    const folder = await db.mediaFolder.update({
      where: { id },
      data: { name },
    })

    return NextResponse.json(folder)
  } catch (error) {
    console.error("Error updating folder:", error)
    return NextResponse.json(
      { error: "Failed to update folder" },
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

    // Check if folder exists
    const folder = await db.mediaFolder.findUnique({
      where: { id },
      include: {
        _count: { select: { media: true, children: true } },
      },
    })

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    // Delete all media in this folder first
    await db.media.deleteMany({
      where: { folderId: id },
    })

    // Delete the folder
    await db.mediaFolder.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting folder:", error)
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    )
  }
}
