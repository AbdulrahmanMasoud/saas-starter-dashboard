import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { z } from "zod"

const folderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  parentId: z.string().optional().nullable(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const folders = await db.mediaFolder.findMany({
      include: {
        _count: { select: { media: true, children: true } },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(folders)
  } catch (error) {
    console.error("Error fetching folders:", error)
    return NextResponse.json(
      { error: "Failed to fetch folders" },
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

    const body = await req.json()
    const validatedFields = folderSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      )
    }

    const { name, parentId } = validatedFields.data

    // Check if folder with same name already exists in the same parent
    const existingFolder = await db.mediaFolder.findFirst({
      where: {
        name,
        parentId: parentId || null,
      },
    })

    if (existingFolder) {
      return NextResponse.json(
        { error: `A folder named "${name}" already exists in this location` },
        { status: 400 }
      )
    }

    const folder = await db.mediaFolder.create({
      data: {
        name,
        parentId,
      },
    })

    return NextResponse.json(folder, { status: 201 })
  } catch (error) {
    console.error("Error creating folder:", error)
    const message = error instanceof Error ? error.message : "Failed to create folder"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
