"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, ArrowRight, Loader2, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { format } from "date-fns"

interface Redirect {
  id: string
  source: string
  destination: string
  statusCode: number
  hitCount: number
  isActive: boolean
  createdAt: Date
}

interface RedirectsManagerProps {
  initialRedirects: Redirect[]
}

export function RedirectsManager({ initialRedirects }: RedirectsManagerProps) {
  const [redirects, setRedirects] = useState(initialRedirects)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    source: "",
    destination: "",
    statusCode: "301",
    isActive: true,
  })

  const resetForm = () => {
    setFormData({ source: "", destination: "", statusCode: "301", isActive: true })
  }

  const openEdit = (redirect: Redirect) => {
    setEditingRedirect(redirect)
    setFormData({
      source: redirect.source,
      destination: redirect.destination,
      statusCode: redirect.statusCode.toString(),
      isActive: redirect.isActive,
    })
  }

  const handleCreate = async () => {
    if (!formData.source.trim() || !formData.destination.trim()) {
      toast.error("Source and destination are required")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          statusCode: parseInt(formData.statusCode),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create redirect")
      }

      const newRedirect = await response.json()
      // Update local state with the new redirect
      setRedirects((prev) => [newRedirect, ...prev])

      toast.success("Redirect created successfully")
      setIsCreateOpen(false)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingRedirect || !formData.source.trim() || !formData.destination.trim()) {
      toast.error("Source and destination are required")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/redirects/${editingRedirect.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          statusCode: parseInt(formData.statusCode),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update redirect")
      }

      const updatedRedirect = await response.json()
      // Update local state with the updated redirect
      setRedirects((prev) =>
        prev.map((r) =>
          r.id === editingRedirect.id ? { ...updatedRedirect, hitCount: r.hitCount } : r
        )
      )

      toast.success("Redirect updated successfully")
      setEditingRedirect(null)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (redirectId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/redirects/${redirectId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete redirect")
      }

      // Update local state by removing the deleted redirect
      setRedirects((prev) => prev.filter((r) => r.id !== redirectId))

      toast.success("Redirect deleted successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleActive = async (redirect: Redirect) => {
    try {
      const response = await fetch(`/api/redirects/${redirect.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !redirect.isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to update redirect")
      }

      // Update local state
      setRedirects((prev) =>
        prev.map((r) =>
          r.id === redirect.id ? { ...r, isActive: !r.isActive } : r
        )
      )
    } catch (error) {
      toast.error("Failed to update redirect status")
    }
  }

  // Form content as JSX variable (not a function component) to prevent focus loss
  const redirectFormContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="redirect-source">Source URL</Label>
        <Input
          id="redirect-source"
          value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          placeholder="/old-page"
        />
        <p className="text-xs text-muted-foreground">
          The URL path to redirect from (e.g., /old-page)
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="redirect-destination">Destination URL</Label>
        <Input
          id="redirect-destination"
          value={formData.destination}
          onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
          placeholder="/new-page or https://example.com"
        />
        <p className="text-xs text-muted-foreground">
          The URL to redirect to (can be relative or absolute)
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="redirect-statusCode">Redirect Type</Label>
        <Select
          value={formData.statusCode}
          onValueChange={(value) => setFormData({ ...formData, statusCode: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="301">301 - Permanent</SelectItem>
            <SelectItem value="302">302 - Temporary</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="redirect-isActive">Active</Label>
        <Switch
          id="redirect-isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
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
            Add Redirect
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Redirect</DialogTitle>
            <DialogDescription>Add a new URL redirect</DialogDescription>
          </DialogHeader>
          {redirectFormContent}
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
      <Dialog open={!!editingRedirect} onOpenChange={(open) => { if (!open) { setEditingRedirect(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Redirect</DialogTitle>
            <DialogDescription>Update redirect settings</DialogDescription>
          </DialogHeader>
          {redirectFormContent}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRedirect(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Redirects List */}
      <Card>
        <CardContent className="p-0">
          {redirects.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No redirects yet. Create your first redirect to get started.
            </div>
          ) : (
            redirects.map((redirect) => (
              <div
                key={redirect.id}
                className="flex items-center justify-between border-b p-4 last:border-b-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-sm bg-muted px-2 py-0.5 rounded truncate max-w-[200px]">
                      {redirect.source}
                    </code>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    <code className="text-sm bg-muted px-2 py-0.5 rounded truncate max-w-[200px]">
                      {redirect.destination}
                    </code>
                    <Badge variant={redirect.statusCode === 301 ? "default" : "secondary"}>
                      {redirect.statusCode}
                    </Badge>
                    {!redirect.isActive && (
                      <Badge variant="outline" className="text-muted-foreground">
                        Disabled
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      {redirect.hitCount} hits
                    </span>
                    <span>
                      Created {format(new Date(redirect.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Switch
                    checked={redirect.isActive}
                    onCheckedChange={() => toggleActive(redirect)}
                  />
                  <Button variant="ghost" size="sm" onClick={() => openEdit(redirect)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Redirect?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this redirect. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(redirect.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
