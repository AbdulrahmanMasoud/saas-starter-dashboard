"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Tag, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface TagType {
  id: string
  name: string
  slug: string
  color: string | null
  _count: { posts: number }
}

interface TagsManagerProps {
  initialTags: TagType[]
}

const colorOptions = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#a855f7", // Purple
  "#d946ef", // Fuchsia
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#eab308", // Yellow
  "#84cc16", // Lime
  "#22c55e", // Green
  "#10b981", // Emerald
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#0ea5e9", // Sky
  "#3b82f6", // Blue
]

export function TagsManager({ initialTags }: TagsManagerProps) {
  const [tags, setTags] = useState(initialTags)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<TagType | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    color: "#6366f1",
  })
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const resetForm = () => {
    setFormData({ name: "", slug: "", color: "#6366f1" })
    setSlugManuallyEdited(false)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
  }

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      // Auto-generate slug only if not manually edited and not in edit mode
      slug: !slugManuallyEdited && !editingTag ? generateSlug(value) : prev.slug,
    }))
  }

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true)
    setFormData((prev) => ({ ...prev, slug: value }))
  }

  const openEdit = (tag: TagType) => {
    setEditingTag(tag)
    setFormData({
      name: tag.name,
      slug: tag.slug,
      color: tag.color || "#6366f1",
    })
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Tag name is required")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          slug: formData.slug || generateSlug(formData.name),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create tag")
      }

      const newTag = await response.json()
      // Update local state with the new tag
      setTags((prev) => [...prev, { ...newTag, _count: { posts: 0 } }].sort((a, b) => a.name.localeCompare(b.name)))

      toast.success("Tag created successfully")
      setIsCreateOpen(false)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingTag || !formData.name.trim()) {
      toast.error("Tag name is required")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/tags/${editingTag.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update tag")
      }

      const updatedTag = await response.json()
      // Update local state with the updated tag
      setTags((prev) =>
        prev.map((tag) =>
          tag.id === editingTag.id
            ? { ...updatedTag, _count: tag._count }
            : tag
        ).sort((a, b) => a.name.localeCompare(b.name))
      )

      toast.success("Tag updated successfully")
      setEditingTag(null)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (tagId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete tag")
      }

      // Update local state by removing the deleted tag
      setTags((prev) => prev.filter((tag) => tag.id !== tagId))

      toast.success("Tag deleted successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const tagFormContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tag-name">Name</Label>
        <Input
          id="tag-name"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Tag name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tag-slug">Slug</Label>
        <Input
          id="tag-slug"
          value={formData.slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="tag-slug"
        />
      </div>
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="grid grid-cols-9 gap-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              type="button"
              className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                formData.color === color ? "border-foreground scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData({ ...formData, color })}
            />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Create Button */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Tag
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Tag</DialogTitle>
            <DialogDescription>Add a new tag for your posts</DialogDescription>
          </DialogHeader>
          {tagFormContent}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingTag} onOpenChange={(open) => { if (!open) { setEditingTag(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>Update tag details</DialogDescription>
          </DialogHeader>
          {tagFormContent}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTag(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tags Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tags.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              No tags yet. Create your first tag to get started.
            </CardContent>
          </Card>
        ) : (
          tags.map((tag) => (
            <Card key={tag.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge
                    className="text-sm"
                    style={tag.color ? { backgroundColor: tag.color } : undefined}
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {tag.name}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">/{tag.slug}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {tag._count.posts} posts
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(tag)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Tag?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will remove the tag
                            &quot;{tag.name}&quot; from all posts.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(tag.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
