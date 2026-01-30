import { db } from "@/lib/db"
import { MediaLibrary } from "./media-library"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Media Library - Dashboard",
  description: "Manage uploaded media files",
}

async function getMedia() {
  return db.media.findMany({
    include: {
      folder: { select: { name: true } },
      uploader: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

async function getFolders() {
  return db.mediaFolder.findMany({
    include: {
      _count: { select: { media: true } },
    },
    orderBy: { name: "asc" },
  })
}

export default async function MediaPage() {
  const [media, folders] = await Promise.all([getMedia(), getFolders()])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
        <p className="text-muted-foreground">
          Upload and manage your media files
        </p>
      </div>

      {/* Media Library */}
      <MediaLibrary initialMedia={media} initialFolders={folders} />
    </div>
  )
}
