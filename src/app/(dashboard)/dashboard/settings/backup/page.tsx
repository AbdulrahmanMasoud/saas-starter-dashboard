"use client"

import { useState, useEffect, useRef } from "react"
import {
  Download,
  Database,
  Clock,
  AlertTriangle,
  Loader2,
  Upload,
  Trash2,
  FileJson,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { format, formatDistanceToNow } from "date-fns"

interface Backup {
  id: string
  name: string
  fileName: string
  fileSize: number
  status: "PENDING" | "COMPLETED" | "FAILED"
  tables: string[]
  recordCount: number
  error?: string
  createdBy: string
  createdAt: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

export default function BackupSettingsPage() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [restoreOptions, setRestoreOptions] = useState({
    roles: true,
    categories: true,
    tags: true,
    settings: true,
    redirects: true,
    emailTemplates: true,
    plans: true,
  })

  const fetchBackups = async () => {
    try {
      const res = await fetch("/api/backups")
      if (res.ok) {
        const data = await res.json()
        setBackups(data)
      }
    } catch {
      toast.error("Failed to load backups")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBackups()
  }, [])

  const handleCreateBackup = async () => {
    setIsCreating(true)
    try {
      const res = await fetch("/api/backups", { method: "POST" })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create backup")
      }

      setBackups((prev) => [data, ...prev])
      toast.success("Backup created successfully")
    } catch (error) {
      console.error("Backup error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create backup")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDownload = async (backup: Backup) => {
    try {
      const res = await fetch(`/api/backups/${backup.id}`)
      if (!res.ok) throw new Error("Failed to download")

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = backup.fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Failed to download backup")
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/backups/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")

      setBackups((prev) => prev.filter((b) => b.id !== id))
      toast.success("Backup deleted")
    } catch {
      toast.error("Failed to delete backup")
    } finally {
      setDeletingId(null)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith(".json")) {
        toast.error("Please select a JSON backup file")
        return
      }
      setSelectedFile(file)
      setShowRestoreDialog(true)
    }
  }

  const handleRestore = async () => {
    if (!selectedFile) return

    setIsRestoring(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("options", JSON.stringify(restoreOptions))

      const res = await fetch("/api/backups/restore", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to restore")
      }

      toast.success("Backup restored successfully", {
        description: `Restored: ${Object.entries(data.results)
          .map(([key, val]) => `${key}: ${val}`)
          .join(", ")}`,
      })

      setShowRestoreDialog(false)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to restore backup")
    } finally {
      setIsRestoring(false)
    }
  }

  const lastCompletedBackup = backups.find((b) => b.status === "COMPLETED")

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Regular backups help protect your data. We recommend creating backups
          before making significant changes to your site.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Create Backup</CardTitle>
          <CardDescription>
            Download a complete backup of your database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Database Backup</h4>
              <p className="text-sm text-muted-foreground">
                Creates a JSON export of your database
              </p>
            </div>
            <Button onClick={handleCreateBackup} disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Create Backup
            </Button>
          </div>

          {lastCompletedBackup && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last backup:{" "}
              {format(
                new Date(lastCompletedBackup.createdAt),
                "MMMM d, yyyy 'at' h:mm a"
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Restore from Backup</CardTitle>
          <CardDescription>
            Upload a backup file to restore your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
              <Upload className="h-6 w-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Upload Backup File</h4>
              <p className="text-sm text-muted-foreground">
                Select a JSON backup file to restore
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Select File
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Backup History</CardTitle>
            <CardDescription>View and manage your backups</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchBackups}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : backups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileJson className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No backups yet. Create your first backup above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    {backup.status === "COMPLETED" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : backup.status === "FAILED" ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{backup.name}</p>
                      <Badge
                        variant={
                          backup.status === "COMPLETED"
                            ? "default"
                            : backup.status === "FAILED"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {backup.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{formatFileSize(backup.fileSize)}</span>
                      <span>{backup.recordCount} records</span>
                      <span>
                        {formatDistanceToNow(new Date(backup.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {backup.status === "COMPLETED" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(backup)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(backup.id)}
                      disabled={deletingId === backup.id}
                      title="Delete"
                    >
                      {deletingId === backup.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What&apos;s Included</CardTitle>
          <CardDescription>The backup includes the following data</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Users and roles
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Posts, categories, and tags
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Media metadata (files stored separately)
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              SEO settings and redirects
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Site settings
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Email templates
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Subscription plans
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Activity logs (last 1000)
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Restore Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore from Backup</DialogTitle>
            <DialogDescription>
              Select which data to restore from{" "}
              <span className="font-medium">{selectedFile?.name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Restoring will overwrite existing data. This action cannot be
                undone.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <p className="text-sm font-medium">Select data to restore:</p>
              {Object.entries(restoreOptions).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) =>
                      setRestoreOptions((prev) => ({
                        ...prev,
                        [key]: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor={key} className="capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRestoreDialog(false)
                setSelectedFile(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRestore}
              disabled={isRestoring}
            >
              {isRestoring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Restore Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
