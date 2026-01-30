"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, FolderTree, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  parent: { name: string } | null
  _count: { posts: number; children: number }
}

interface CategoriesManagerProps {
  initialCategories: Category[]
}

// Special value for "no parent" since empty string is not allowed
const NO_PARENT_VALUE = "__none__"

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: NO_PARENT_VALUE,
  })
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const resetForm = () => {
    setFormData({ name: "", slug: "", description: "", parentId: NO_PARENT_VALUE })
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
      slug: !slugManuallyEdited && !editingCategory ? generateSlug(value) : prev.slug,
    }))
  }

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true)
    setFormData((prev) => ({ ...prev, slug: value }))
  }

  const openEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      parentId: category.parentId || NO_PARENT_VALUE,
    })
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          slug: formData.slug || generateSlug(formData.name),
          parentId: formData.parentId === NO_PARENT_VALUE ? null : formData.parentId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create category")
      }

      const newCategory = await response.json()
      // Update local state with the new category
      const parent = formData.parentId !== NO_PARENT_VALUE
        ? categories.find(c => c.id === formData.parentId)
        : null
      setCategories((prev) => [...prev, {
        ...newCategory,
        parent: parent ? { name: parent.name } : null,
        _count: { posts: 0, children: 0 }
      }])

      toast.success("Category created successfully")
      setIsCreateOpen(false)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingCategory || !formData.name.trim()) {
      toast.error("Category name is required")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          parentId: formData.parentId === NO_PARENT_VALUE ? null : formData.parentId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update category")
      }

      const updatedCategory = await response.json()
      // Update local state with the updated category
      const parent = formData.parentId !== NO_PARENT_VALUE
        ? categories.find(c => c.id === formData.parentId)
        : null
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id
            ? {
                ...updatedCategory,
                parent: parent ? { name: parent.name } : null,
                _count: cat._count
              }
            : cat
        )
      )

      toast.success("Category updated successfully")
      setEditingCategory(null)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete category")
      }

      // Update local state by removing the deleted category
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))

      toast.success("Category deleted successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  // Build hierarchy for display
  const rootCategories = categories.filter((c) => !c.parentId)
  const getChildren = (parentId: string) =>
    categories.filter((c) => c.parentId === parentId)

  // Form content as JSX variable (not a function component) to prevent focus loss
  const categoryFormContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category-name">Name</Label>
        <Input
          id="category-name"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Category name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category-slug">Slug</Label>
        <Input
          id="category-slug"
          value={formData.slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="category-slug"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category-description">Description</Label>
        <Textarea
          id="category-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Category description"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category-parent">Parent Category</Label>
        <Select
          value={formData.parentId}
          onValueChange={(value) => setFormData({ ...formData, parentId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="None (Top level)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_PARENT_VALUE}>None (Top level)</SelectItem>
            {categories
              .filter((c) => c.id !== editingCategory?.id)
              .map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const CategoryItem = ({ category, level = 0 }: { category: Category; level?: number }) => {
    const children = getChildren(category.id)

    return (
      <>
        <div
          className="flex items-center justify-between p-4 border-b last:border-b-0"
          style={{ paddingLeft: `${level * 24 + 16}px` }}
        >
          <div className="flex items-center gap-3">
            <FolderTree className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{category.name}</p>
              <p className="text-sm text-muted-foreground">/{category.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              {category._count.posts}
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => openEdit(category)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={category._count.posts > 0 || category._count.children > 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the
                      category &quot;{category.name}&quot;.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(category.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
        {children.map((child) => (
          <CategoryItem key={child.id} category={child} level={level + 1} />
        ))}
      </>
    )
  }

  return (
    <div className="space-y-4">
      {/* Create Button */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>Add a new category for your posts</DialogDescription>
          </DialogHeader>
          {categoryFormContent}
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
      <Dialog open={!!editingCategory} onOpenChange={(open) => { if (!open) { setEditingCategory(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category details</DialogDescription>
          </DialogHeader>
          {categoryFormContent}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Categories List */}
      <Card>
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No categories yet. Create your first category to get started.
            </div>
          ) : (
            rootCategories.map((category) => (
              <CategoryItem key={category.id} category={category} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
