"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Shield, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { PERMISSION_GROUPS, type Permission } from "@/config/permissions"

interface Role {
  id: string
  name: string
  description: string | null
  permissions: Permission[]
  isDefault: boolean
  _count: { users: number }
}

interface RolesManagerProps {
  initialRoles: Role[]
}

export function RolesManager({ initialRoles }: RolesManagerProps) {
  const [roles, setRoles] = useState(initialRoles)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  })

  const resetForm = () => {
    setFormData({ name: "", description: "", permissions: [] })
  }

  const openEdit = (role: Role) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions as string[],
    })
  }

  const handlePermissionToggle = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }))
  }

  const handleGroupToggle = (groupPermissions: { key: string }[]) => {
    const groupKeys = groupPermissions.map((p) => p.key)
    const allSelected = groupKeys.every((k) => formData.permissions.includes(k))

    if (allSelected) {
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((p) => !groupKeys.includes(p)),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...groupKeys])],
      }))
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Role name is required")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create role")
      }

      const newRole = await response.json()
      // Update local state with the new role
      setRoles((prev) => [...prev, { ...newRole, _count: { users: 0 } }])

      toast.success("Role created successfully")
      setIsCreateOpen(false)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingRole || !formData.name.trim()) {
      toast.error("Role name is required")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/roles/${editingRole.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update role")
      }

      const updatedRole = await response.json()
      // Update local state with the updated role
      setRoles((prev) =>
        prev.map((role) =>
          role.id === editingRole.id
            ? { ...updatedRole, _count: role._count }
            : role
        )
      )

      toast.success("Role updated successfully")
      setEditingRole(null)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (roleId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete role")
      }

      // Update local state by removing the deleted role
      setRoles((prev) => prev.filter((role) => role.id !== roleId))

      toast.success("Role deleted successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  // Permission editor as JSX variable (not a function component) to prevent focus loss
  const permissionEditorContent = (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-6">
        {Object.entries(PERMISSION_GROUPS).map(([key, group]) => {
          const allSelected = group.permissions.every((p) =>
            formData.permissions.includes(p.key)
          )
          const someSelected = group.permissions.some((p) =>
            formData.permissions.includes(p.key)
          )

          return (
            <div key={key} className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`group-${key}`}
                  checked={allSelected}
                  onCheckedChange={() => handleGroupToggle(group.permissions)}
                  className={someSelected && !allSelected ? "data-[state=checked]:bg-primary/50" : ""}
                />
                <Label htmlFor={`group-${key}`} className="font-semibold">
                  {group.label}
                </Label>
              </div>
              <div className="ml-6 grid gap-2">
                {group.permissions.map((permission) => (
                  <div key={permission.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission.key}
                      checked={formData.permissions.includes(permission.key)}
                      onCheckedChange={() => handlePermissionToggle(permission.key)}
                    />
                    <Label
                      htmlFor={permission.key}
                      className="text-sm font-normal text-muted-foreground"
                    >
                      {permission.label}
                    </Label>
                  </div>
                ))}
              </div>
              <Separator />
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )

  return (
    <div className="space-y-4">
      {/* Create Button */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Define a new role with specific permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Content Manager"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this role can do..."
              />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              {permissionEditorContent}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingRole} onOpenChange={(open) => { if (!open) { setEditingRole(null); resetForm(); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Modify role details and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role-name">Role Name</Label>
              <Input
                id="edit-role-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role-description">Description</Label>
              <Textarea
                id="edit-role-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              {permissionEditorContent}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRole(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Roles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {role.name}
                      {role.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {role.description || "No description"}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {role._count.users} users
                </div>
                <div>
                  {(role.permissions as string[]).length} permissions
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEdit(role)}
                >
                  <Pencil className="mr-2 h-3 w-3" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={role._count.users > 0}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Role?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the
                        role &quot;{role.name}&quot;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(role.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
