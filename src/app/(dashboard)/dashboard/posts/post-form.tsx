"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save, Eye, Archive, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TiptapEditor } from "@/components/dashboard/editor/tiptap-editor"
import { postSchema, type PostInput } from "@/lib/validations/post"
import { toast } from "sonner"

interface PostFormProps {
  post?: {
    id: string
    title: string
    slug: string
    content: string | null
    excerpt: string | null
    featuredImage: string | null
    status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED"
    categoryId: string | null
    tags: Array<{ tag: { id: string } }>
  }
  categories: Array<{ id: string; name: string }>
  tags: Array<{ id: string; name: string; color: string | null }>
}

export function PostForm({ post, categories, tags }: PostFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>(
    post?.tags.map((t) => t.tag.id) || []
  )
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const router = useRouter()
  const isEditing = !!post

  const form = useForm<PostInput>({
    resolver: zodResolver(postSchema) as any,
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      content: post?.content || "",
      excerpt: post?.excerpt || "",
      featuredImage: post?.featuredImage || "",
      status: post?.status || "DRAFT",
      categoryId: post?.categoryId || undefined,
      tagIds: post?.tags.map((t) => t.tag.id) || [],
    },
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    form.setValue("title", title)
    // Auto-generate slug only if not manually edited and not in edit mode
    if (!isEditing && !slugManuallyEdited) {
      form.setValue("slug", generateSlug(title))
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true)
    form.setValue("slug", e.target.value)
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => {
      const newTags = prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
      form.setValue("tagIds", newTags)
      return newTags
    })
  }

  async function onSubmit(values: PostInput, status?: "DRAFT" | "PUBLISHED") {
    setIsLoading(true)

    try {
      const data = {
        ...values,
        status: status || values.status,
        tagIds: selectedTags,
      }

      const url = isEditing ? `/api/posts/${post.id}` : "/api/posts"
      const method = isEditing ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Failed to save post")
      }

      toast.success(isEditing ? "Post updated successfully" : "Post created successfully")
      router.push("/dashboard/posts")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => onSubmit(v))} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter post title"
                          disabled={isLoading}
                          {...field}
                          onChange={handleTitleChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="post-url-slug"
                          disabled={isLoading}
                          {...field}
                          onChange={handleSlugChange}
                        />
                      </FormControl>
                      <FormDescription>
                        The URL-friendly version of the title
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <TiptapEditor
                          content={field.value}
                          onChange={field.onChange}
                          placeholder="Write your post content here..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the post"
                          disabled={isLoading}
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A short summary shown in post listings
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                  onClick={() => form.handleSubmit((v) => onSubmit(v, "DRAFT"))()}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Draft
                </Button>
                <Button
                  type="button"
                  className="w-full"
                  disabled={isLoading}
                  onClick={() => form.handleSubmit((v) => onSubmit(v, "PUBLISHED"))()}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Publish
                </Button>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      style={
                        selectedTags.includes(tag.id) && tag.color
                          ? { backgroundColor: tag.color }
                          : undefined
                      }
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {tags.length === 0 && (
                    <p className="text-sm text-muted-foreground">No tags available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="featuredImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Image URL"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter an image URL or upload from media library
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  )
}
