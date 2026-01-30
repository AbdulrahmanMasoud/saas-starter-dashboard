import { z } from "zod"

export const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).default("DRAFT"),
  publishedAt: z.string().optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
})

export type PostInput = z.infer<typeof postSchema>
