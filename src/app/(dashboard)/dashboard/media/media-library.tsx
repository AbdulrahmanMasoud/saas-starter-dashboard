"use client"

import { useState } from "react"
import {
  Upload,
  Grid3X3,
  List,
  FolderPlus,
  Folder,
  FolderOpen,
  Image as ImageIcon,
  FileText,
  Film,
  Music,
  File,
  Trash2,
  Download,
  Copy,
  MoreHorizontal,
  Loader2,
  ArrowLeft,
  Pencil,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface Media {
  id: string
  name: string
  fileName: string
  fileType: string
  fileSize: number
  url: string
  width: number | null
  height: number | null
  alt: string | null
  folderId: string | null
  folder: { name: string } | null
  uploader: { name: string | null } | null
  createdAt: Date
}

interface Folder {
  id: string
  name: string
  _count: { media: number }
}

interface MediaLibraryProps {
  initialMedia: Media[]
  initialFolders: Folder[]
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) return ImageIcon
  if (fileType.startsWith("video/")) return Film
  if (fileType.startsWith("audio/")) return Music
  if (fileType.includes("pdf") || fileType.includes("document")) return FileText
  return File
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function MediaLibrary({ initialMedia, initialFolders }: MediaLibraryProps) {
  const [media, setMedia] = useState(initialMedia)
  const [folders, setFolders] = useState(initialFolders)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [isDeletingFolder, setIsDeletingFolder] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [editFolderName, setEditFolderName] = useState("")

  // Get current folder name for breadcrumb
  const currentFolder = currentFolderId
    ? folders.find(f => f.id === currentFolderId)
    : null

  // Filter media based on current folder
  const filteredMedia = currentFolderId
    ? media.filter((m) => m.folderId === currentFolderId)
    : media.filter((m) => m.folderId === null)

  const handleUpload = async (files: FileList) => {
    setIsUploading(true)
    const uploadedMedia: Media[] = []

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append("file", file)
        if (currentFolderId) {
          formData.append("folderId", currentFolderId)
        }

        const response = await fetch("/api/media", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || `Failed to upload ${file.name}`)
        }

        const newMedia = await response.json()
        uploadedMedia.push({
          ...newMedia,
          folder: currentFolderId ? folders.find(f => f.id === currentFolderId) ? { name: folders.find(f => f.id === currentFolderId)!.name } : null : null,
          uploader: null,
        })
      }

      // Update local state with uploaded media
      setMedia((prev) => [...uploadedMedia, ...prev])

      // Update folder count if uploading to a folder
      if (currentFolderId) {
        setFolders((prev) =>
          prev.map((f) =>
            f.id === currentFolderId
              ? { ...f, _count: { media: f._count.media + uploadedMedia.length } }
              : f
          )
        )
      }

      toast.success("Files uploaded successfully")
      setIsUploadOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleCreateFolder = async () => {
    const trimmedName = newFolderName.trim()
    if (!trimmedName) {
      toast.error("Folder name is required")
      return
    }

    setIsCreatingFolder(true)
    try {
      const response = await fetch("/api/media/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create folder")
      }

      // Update local state with new folder
      setFolders((prev) => [...prev, { ...data, _count: { media: 0 } }])

      toast.success("Folder created successfully")
      setIsCreateFolderOpen(false)
      setNewFolderName("")
    } catch (error) {
      console.error("Create folder error:", error)
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsCreatingFolder(false)
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    setIsDeletingFolder(true)
    try {
      const response = await fetch(`/api/media/folders/${folderId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete folder")
      }

      // Update local state
      setFolders((prev) => prev.filter((f) => f.id !== folderId))

      // If we're inside the deleted folder, go back to root
      if (currentFolderId === folderId) {
        setCurrentFolderId(null)
      }

      toast.success("Folder deleted successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsDeletingFolder(false)
    }
  }

  const handleRenameFolder = async () => {
    if (!editingFolder || !editFolderName.trim()) {
      toast.error("Folder name is required")
      return
    }

    try {
      const response = await fetch(`/api/media/folders/${editingFolder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editFolderName.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to rename folder")
      }

      const updatedFolder = await response.json()
      setFolders((prev) =>
        prev.map((f) => (f.id === editingFolder.id ? { ...f, name: updatedFolder.name } : f))
      )

      toast.success("Folder renamed successfully")
      setEditingFolder(null)
      setEditFolderName("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    }
  }

  const handleDelete = async (mediaId: string) => {
    setIsDeleting(true)
    try {
      const mediaToDelete = media.find((m) => m.id === mediaId)

      const response = await fetch(`/api/media/${mediaId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete media")
      }

      // Update local state by removing deleted media
      setMedia((prev) => prev.filter((m) => m.id !== mediaId))

      // Update folder count if media was in a folder
      if (mediaToDelete?.folderId) {
        setFolders((prev) =>
          prev.map((f) =>
            f.id === mediaToDelete.folderId
              ? { ...f, _count: { media: Math.max(0, f._count.media - 1) } }
              : f
          )
        )
      }

      toast.success("Media deleted successfully")
      setSelectedMedia(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsDeleting(false)
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success("URL copied to clipboard")
  }

  const openFolder = (folderId: string) => {
    setCurrentFolderId(folderId)
  }

  const goBack = () => {
    setCurrentFolderId(null)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {currentFolderId && (
            <Button variant="ghost" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
                <DialogDescription>
                  {currentFolder
                    ? `Upload to "${currentFolder.name}" folder`
                    : "Drag and drop files or click to browse"
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Label
                  htmlFor="file-upload"
                  className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                      <span className="mt-2 text-sm text-muted-foreground">
                        Uploading...
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground" />
                      <span className="mt-2 text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </span>
                    </>
                  )}
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleUpload(e.target.files)}
                    disabled={isUploading}
                  />
                </Label>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadOpen(false)} disabled={isUploading}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {!currentFolderId && (
            <Dialog open={isCreateFolderOpen} onOpenChange={(open) => { setIsCreateFolderOpen(open); if (!open) setNewFolderName(""); }}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FolderPlus className="mr-2 h-4 w-4" />
                  New Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Folder</DialogTitle>
                  <DialogDescription>Create a new folder to organize your media</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="folder-name">Folder Name</Label>
                  <Input
                    id="folder-name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="My Folder"
                    className="mt-2"
                    onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)} disabled={isCreatingFolder}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFolder} disabled={isCreatingFolder}>
                    {isCreatingFolder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentFolder && (
            <div className="text-sm text-muted-foreground">
              <FolderOpen className="inline-block h-4 w-4 mr-1" />
              {currentFolder.name}
            </div>
          )}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
            <TabsList>
              <TabsTrigger value="grid">
                <Grid3X3 className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Rename Folder Dialog */}
      <Dialog open={!!editingFolder} onOpenChange={(open) => { if (!open) { setEditingFolder(null); setEditFolderName(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>Enter a new name for the folder</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="edit-folder-name">Folder Name</Label>
            <Input
              id="edit-folder-name"
              value={editFolderName}
              onChange={(e) => setEditFolderName(e.target.value)}
              placeholder="Folder name"
              className="mt-2"
              onKeyDown={(e) => e.key === "Enter" && handleRenameFolder()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFolder(null)}>
              Cancel
            </Button>
            <Button onClick={handleRenameFolder}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {/* Folders (only show at root level) */}
          {!currentFolderId && folders.map((folder) => (
            <Card
              key={folder.id}
              className="cursor-pointer overflow-hidden hover:ring-2 hover:ring-primary transition-all group"
              onClick={() => openFolder(folder.id)}
            >
              <div className="aspect-square relative bg-muted flex items-center justify-center">
                <Folder className="h-20 w-20 text-primary/70" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        setEditingFolder(folder);
                        setEditFolderName(folder.name);
                      }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={(e) => e.preventDefault()}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Folder?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete the folder &quot;{folder.name}&quot; and all media files inside it.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteFolder(folder.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeletingFolder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="truncate text-sm font-medium">{folder.name}</p>
                <p className="text-xs text-muted-foreground">
                  {folder._count.media} {folder._count.media === 1 ? "file" : "files"}
                </p>
              </CardContent>
            </Card>
          ))}

          {/* Media files */}
          {filteredMedia.map((item) => {
            const Icon = getFileIcon(item.fileType)
            const isImage = item.fileType.startsWith("image/")

            return (
              <Card
                key={item.id}
                className="cursor-pointer overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                onClick={() => setSelectedMedia(item)}
              >
                <div className="aspect-square relative bg-muted">
                  {isImage ? (
                    <img
                      src={item.url}
                      alt={item.alt || item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Icon className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(item.fileSize)}
                  </p>
                </CardContent>
              </Card>
            )
          })}

          {/* Empty state */}
          {!currentFolderId && folders.length === 0 && filteredMedia.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center text-muted-foreground">
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4">No media files yet</p>
                <p className="text-sm">Upload your first file or create a folder to get started</p>
              </CardContent>
            </Card>
          )}

          {currentFolderId && filteredMedia.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center text-muted-foreground">
                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4">This folder is empty</p>
                <p className="text-sm">Upload files to this folder</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Folders in list view */}
            {!currentFolderId && folders.map((folder) => (
              <div
                key={folder.id}
                className="flex items-center justify-between border-b p-4 last:border-b-0 hover:bg-muted/50 cursor-pointer"
                onClick={() => openFolder(folder.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                    <Folder className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{folder.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {folder._count.media} {folder._count.media === 1 ? "file" : "files"}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      setEditingFolder(folder);
                      setEditFolderName(folder.name);
                    }}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {/* Media files in list view */}
            {filteredMedia.map((item) => {
              const Icon = getFileIcon(item.fileType)

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b p-4 last:border-b-0 hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedMedia(item)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                      {item.fileType.startsWith("image/") ? (
                        <img
                          src={item.url}
                          alt={item.alt || item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Icon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(item.fileSize)} • {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); copyUrl(item.url); }}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy URL
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={item.url} download={item.fileName} onClick={(e) => e.stopPropagation()}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}

            {/* Empty states for list view */}
            {!currentFolderId && folders.length === 0 && filteredMedia.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4">No media files yet</p>
                <p className="text-sm">Upload your first file or create a folder to get started</p>
              </div>
            )}

            {currentFolderId && filteredMedia.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4">This folder is empty</p>
                <p className="text-sm">Upload files to this folder</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Media Detail Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={(open) => !open && setSelectedMedia(null)}>
        <DialogContent className="max-w-3xl">
          {selectedMedia && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMedia.name}</DialogTitle>
                <DialogDescription>
                  Uploaded {formatDistanceToNow(new Date(selectedMedia.createdAt), { addSuffix: true })}
                  {selectedMedia.uploader?.name && ` by ${selectedMedia.uploader.name}`}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 md:grid-cols-2">
                <div className="rounded-lg bg-muted overflow-hidden aspect-square">
                  {selectedMedia.fileType.startsWith("image/") ? (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.alt || selectedMedia.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      {(() => {
                        const Icon = getFileIcon(selectedMedia.fileType)
                        return <Icon className="h-24 w-24 text-muted-foreground" />
                      })()}
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">File Name</Label>
                    <p className="font-medium">{selectedMedia.fileName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">File Type</Label>
                    <p className="font-medium">{selectedMedia.fileType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">File Size</Label>
                    <p className="font-medium">{formatFileSize(selectedMedia.fileSize)}</p>
                  </div>
                  {selectedMedia.width && selectedMedia.height && (
                    <div>
                      <Label className="text-muted-foreground">Dimensions</Label>
                      <p className="font-medium">{selectedMedia.width} x {selectedMedia.height}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground">URL</Label>
                    <div className="flex gap-2 mt-1">
                      <Input value={selectedMedia.url} readOnly className="text-xs" />
                      <Button variant="outline" size="icon" onClick={() => copyUrl(selectedMedia.url)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" asChild>
                  <a href={selectedMedia.url} download={selectedMedia.fileName}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedMedia.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
