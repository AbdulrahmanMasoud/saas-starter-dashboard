# Content Management

The content management system provides a complete solution for creating, organizing, and publishing content with rich text editing, categories, tags, and SEO optimization.

## Overview

- **Rich Text Editor:** TipTap with extensive formatting options
- **Organization:** Hierarchical categories and color-coded tags
- **SEO:** Full metadata support (meta tags, Open Graph, Twitter Cards)
- **Workflow:** Multiple post statuses for publishing workflow

## Posts

### Post Statuses

| Status | Description |
|--------|-------------|
| `DRAFT` | Work in progress, not visible publicly |
| `PUBLISHED` | Live and visible to users |
| `SCHEDULED` | Will be published at a future date/time |
| `ARCHIVED` | Hidden but preserved for reference |

### Post Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Post title (required) |
| `slug` | String | URL-friendly identifier (unique) |
| `content` | Text | Rich text content (HTML) |
| `excerpt` | String | Short summary/teaser |
| `featuredImage` | String | URL to featured image |
| `status` | Enum | Post status (see above) |
| `publishedAt` | DateTime | Publication date/time |
| `categoryId` | String | Associated category |
| `authorId` | String | Post author (User) |

### Creating a Post

```typescript
// POST /api/posts
{
  "title": "Getting Started with Next.js",
  "slug": "getting-started-nextjs",
  "content": "<p>Your HTML content here...</p>",
  "excerpt": "Learn the basics of Next.js",
  "status": "DRAFT",
  "categoryId": "category-id",
  "tags": ["tag-id-1", "tag-id-2"]
}
```

### Rich Text Editor

The TipTap editor supports:

- **Text Formatting:** Bold, italic, underline, strikethrough
- **Headings:** H1, H2, H3, H4
- **Lists:** Ordered, unordered, task lists
- **Text Alignment:** Left, center, right, justify
- **Colors:** Text color, highlight/background color
- **Links:** Inline hyperlinks
- **Images:** Embedded images with alt text
- **Code:** Inline code and code blocks
- **Blockquotes:** Quote formatting

### Editor Toolbar

The editor toolbar provides quick access to:

```
[B] [I] [U] [S] | [H1] [H2] [H3] | [•] [1.] | ["] [</>] | [🔗] [📷] | [Align]
```

## Categories

Categories provide hierarchical organization for posts.

### Hierarchical Structure

Categories support parent-child relationships:

```
Technology
├── Web Development
│   ├── Frontend
│   └── Backend
├── Mobile Development
└── DevOps
```

### Category Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Category name (required) |
| `slug` | String | URL-friendly identifier (unique) |
| `description` | String | Category description |
| `parentId` | String | Parent category (optional) |

### Creating Categories

```typescript
// POST /api/categories
{
  "name": "Web Development",
  "slug": "web-development",
  "description": "Articles about web development",
  "parentId": "parent-category-id" // Optional
}
```

### Fetching with Hierarchy

```typescript
// GET /api/categories
// Returns categories with nested children
[
  {
    "id": "1",
    "name": "Technology",
    "children": [
      { "id": "2", "name": "Web Development", "children": [...] }
    ]
  }
]
```

## Tags

Tags provide flexible, non-hierarchical labeling for posts.

### Tag Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Tag name (required) |
| `slug` | String | URL-friendly identifier (unique) |
| `color` | String | Display color (hex, optional) |

### Creating Tags

```typescript
// POST /api/tags
{
  "name": "JavaScript",
  "slug": "javascript",
  "color": "#f7df1e"
}
```

### Assigning Tags to Posts

Tags are assigned via the post's `tags` array:

```typescript
// PUT /api/posts/:id
{
  "tags": ["tag-id-1", "tag-id-2", "tag-id-3"]
}
```

## SEO Metadata

Each post can have comprehensive SEO metadata via the `SeoMeta` model.

### SEO Fields

| Field | Description |
|-------|-------------|
| `metaTitle` | Custom title for search engines (default: post title) |
| `metaDescription` | Description for search results |
| `metaKeywords` | Keywords for SEO (comma-separated) |
| `canonicalUrl` | Canonical URL for duplicate content |
| `ogTitle` | Open Graph title for social sharing |
| `ogDescription` | Open Graph description |
| `ogImage` | Open Graph image URL |
| `twitterTitle` | Twitter card title |
| `twitterDescription` | Twitter card description |
| `twitterImage` | Twitter card image URL |
| `noIndex` | Exclude from search engines |
| `noFollow` | Don't follow links on page |

### Managing SEO

```typescript
// GET /api/posts/:id/seo
// Returns SEO metadata for a post

// PUT /api/posts/:id/seo
{
  "metaTitle": "Custom SEO Title | Site Name",
  "metaDescription": "A compelling description for search results",
  "ogTitle": "Share Title for Facebook",
  "ogImage": "/uploads/og-image.jpg",
  "twitterTitle": "Share Title for Twitter"
}
```

## Slugs

Slugs are URL-friendly identifiers used for:
- Posts: `/blog/my-post-slug`
- Categories: `/category/web-development`
- Tags: `/tag/javascript`

### Slug Generation

Slugs are typically generated from titles:

```typescript
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

// "Getting Started with Next.js" → "getting-started-with-nextjs"
```

### Uniqueness

Slugs must be unique within their type (posts, categories, tags). The system validates uniqueness on create/update.

## Content Workflow

### Draft to Published

1. **Create Draft:** Author creates post with `status: DRAFT`
2. **Review:** Content is reviewed and edited
3. **Publish:** Status changed to `PUBLISHED`, `publishedAt` is set
4. **Archive:** Old content moved to `ARCHIVED` status

### Scheduled Publishing

1. Create post with `status: SCHEDULED`
2. Set `publishedAt` to future date/time
3. Background job changes status to `PUBLISHED` at scheduled time

## Featured Images

Posts support featured images for:
- Blog listings
- Social media sharing (Open Graph)
- Post headers

### Setting Featured Image

1. Upload image via Media Library
2. Copy image URL
3. Set `featuredImage` field on post

```typescript
{
  "featuredImage": "/uploads/images/featured-image.jpg"
}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List posts (with filters) |
| POST | `/api/posts` | Create post |
| GET | `/api/posts/:id` | Get post details |
| PUT | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |
| GET | `/api/posts/:id/seo` | Get SEO metadata |
| PUT | `/api/posts/:id/seo` | Update SEO metadata |
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category |
| GET | `/api/categories/:id` | Get category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |
| GET | `/api/tags` | List tags |
| POST | `/api/tags` | Create tag |
| GET | `/api/tags/:id` | Get tag |
| PUT | `/api/tags/:id` | Update tag |
| DELETE | `/api/tags/:id` | Delete tag |

## Filtering Posts

The posts list supports filtering:

```typescript
// GET /api/posts?status=PUBLISHED&search=nextjs&categoryId=123

// Query parameters:
// - status: Filter by status (DRAFT, PUBLISHED, etc.)
// - search: Search in title and content
// - categoryId: Filter by category
// - authorId: Filter by author
// - page: Page number (default: 1)
// - limit: Items per page (default: 10)
```

## Permissions

| Permission | Description |
|------------|-------------|
| `posts.view` | View posts list |
| `posts.create` | Create new posts |
| `posts.edit` | Edit existing posts |
| `posts.delete` | Delete posts |
| `posts.publish` | Change post status to published |
| `categories.view` | View categories |
| `categories.create` | Create categories |
| `categories.edit` | Edit categories |
| `categories.delete` | Delete categories |
| `tags.view` | View tags |
| `tags.create` | Create tags |
| `tags.edit` | Edit tags |
| `tags.delete` | Delete tags |

## Related Documentation

- [Media Library](media-library.md)
- [API Reference](../api/endpoints.md)
- [Database Schema](../database/schema.md)
