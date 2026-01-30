"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Eye, Loader2, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface SeoMeta {
  id: string
  metaTitle: string | null
  metaDescription: string | null
  metaKeywords: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
  twitterTitle: string | null
  twitterDescription: string | null
  twitterImage: string | null
  canonicalUrl: string | null
  noIndex: boolean
  noFollow: boolean
}

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  seoMeta: SeoMeta | null
}

interface SeoManagerProps {
  posts: Post[]
}

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50]

export function SeoManager({ posts }: SeoManagerProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const router = useRouter()

  const [formData, setFormData] = useState<Partial<SeoMeta>>({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    canonicalUrl: "",
    noIndex: false,
    noFollow: false,
  })

  // Filter posts based on search
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination calculations
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex)

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value))
    setCurrentPage(1)
  }

  const openEdit = (post: Post) => {
    setSelectedPost(post)
    setFormData({
      metaTitle: post.seoMeta?.metaTitle || post.title,
      metaDescription: post.seoMeta?.metaDescription || post.excerpt || "",
      metaKeywords: post.seoMeta?.metaKeywords || "",
      ogTitle: post.seoMeta?.ogTitle || "",
      ogDescription: post.seoMeta?.ogDescription || "",
      ogImage: post.seoMeta?.ogImage || "",
      twitterTitle: post.seoMeta?.twitterTitle || "",
      twitterDescription: post.seoMeta?.twitterDescription || "",
      twitterImage: post.seoMeta?.twitterImage || "",
      canonicalUrl: post.seoMeta?.canonicalUrl || "",
      noIndex: post.seoMeta?.noIndex || false,
      noFollow: post.seoMeta?.noFollow || false,
    })
  }

  const handleSave = async () => {
    if (!selectedPost) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts/${selectedPost.id}/seo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to save SEO settings")
      }

      toast.success("SEO settings saved successfully")
      setSelectedPost(null)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const titleLength = formData.metaTitle?.length || 0
  const descLength = formData.metaDescription?.length || 0

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show:</span>
          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Posts List */}
      <div className="grid gap-4">
        {paginatedPosts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No posts found
            </CardContent>
          </Card>
        ) : (
          paginatedPosts.map((post) => (
            <Card key={post.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => openEdit(post)}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{post.title}</h3>
                    {post.seoMeta ? (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        SEO Set
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Needs SEO
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">/{post.slug}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  Edit SEO
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredPosts.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredPosts.length)} of {filteredPosts.length} posts
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* SEO Edit Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle>SEO Settings: {selectedPost.title}</DialogTitle>
                <DialogDescription>
                  Optimize how this post appears in search results and social media
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="general" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="social">Social Media</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 mt-4">
                  {/* SERP Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Google Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border p-4 bg-white dark:bg-zinc-950">
                        <p className="text-blue-600 text-lg hover:underline cursor-pointer truncate">
                          {formData.metaTitle || selectedPost.title}
                        </p>
                        <p className="text-green-700 dark:text-green-500 text-sm truncate">
                          example.com/{selectedPost.slug}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                          {formData.metaDescription || selectedPost.excerpt || "No description set"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="metaTitle">Meta Title</Label>
                        <span className={`text-xs ${titleLength > 60 ? "text-destructive" : "text-muted-foreground"}`}>
                          {titleLength}/60
                        </span>
                      </div>
                      <Input
                        id="metaTitle"
                        value={formData.metaTitle || ""}
                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                        placeholder="Enter meta title"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="metaDescription">Meta Description</Label>
                        <span className={`text-xs ${descLength > 160 ? "text-destructive" : "text-muted-foreground"}`}>
                          {descLength}/160
                        </span>
                      </div>
                      <Textarea
                        id="metaDescription"
                        value={formData.metaDescription || ""}
                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                        placeholder="Enter meta description"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="metaKeywords">Meta Keywords</Label>
                      <Input
                        id="metaKeywords"
                        value={formData.metaKeywords || ""}
                        onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                        placeholder="keyword1, keyword2, keyword3"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="social" className="space-y-4 mt-4">
                  {/* Facebook Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Facebook Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border overflow-hidden bg-white dark:bg-zinc-950">
                        <div className="h-40 bg-muted flex items-center justify-center">
                          {formData.ogImage ? (
                            <img src={formData.ogImage} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-muted-foreground text-sm">No image</span>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-gray-500 uppercase">example.com</p>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {formData.ogTitle || formData.metaTitle || selectedPost.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {formData.ogDescription || formData.metaDescription || selectedPost.excerpt}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="font-medium">Open Graph (Facebook)</h4>
                      <div className="space-y-2">
                        <Label htmlFor="ogTitle">OG Title</Label>
                        <Input
                          id="ogTitle"
                          value={formData.ogTitle || ""}
                          onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                          placeholder="Facebook title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ogDescription">OG Description</Label>
                        <Textarea
                          id="ogDescription"
                          value={formData.ogDescription || ""}
                          onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                          placeholder="Facebook description"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ogImage">OG Image URL</Label>
                        <Input
                          id="ogImage"
                          value={formData.ogImage || ""}
                          onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Twitter Card</h4>
                      <div className="space-y-2">
                        <Label htmlFor="twitterTitle">Twitter Title</Label>
                        <Input
                          id="twitterTitle"
                          value={formData.twitterTitle || ""}
                          onChange={(e) => setFormData({ ...formData, twitterTitle: e.target.value })}
                          placeholder="Twitter title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitterDescription">Twitter Description</Label>
                        <Textarea
                          id="twitterDescription"
                          value={formData.twitterDescription || ""}
                          onChange={(e) => setFormData({ ...formData, twitterDescription: e.target.value })}
                          placeholder="Twitter description"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitterImage">Twitter Image URL</Label>
                        <Input
                          id="twitterImage"
                          value={formData.twitterImage || ""}
                          onChange={(e) => setFormData({ ...formData, twitterImage: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="canonicalUrl">Canonical URL</Label>
                    <Input
                      id="canonicalUrl"
                      value={formData.canonicalUrl || ""}
                      onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                      placeholder="https://example.com/original-page"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use this if the content exists on another URL
                    </p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h4 className="font-medium">Indexing Options</h4>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>No Index</Label>
                        <p className="text-xs text-muted-foreground">
                          Tell search engines not to index this page
                        </p>
                      </div>
                      <Switch
                        checked={formData.noIndex}
                        onCheckedChange={(checked) => setFormData({ ...formData, noIndex: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>No Follow</Label>
                        <p className="text-xs text-muted-foreground">
                          Tell search engines not to follow links on this page
                        </p>
                      </div>
                      <Switch
                        checked={formData.noFollow}
                        onCheckedChange={(checked) => setFormData({ ...formData, noFollow: checked })}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setSelectedPost(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save SEO Settings
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
