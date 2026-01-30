# API Reference

Complete reference for all API endpoints in the Taqnihub Fullstack Starter Dashboard.

## Overview

- **Base URL:** `/api`
- **Format:** JSON
- **Authentication:** NextAuth.js sessions (JWT)
- **Error Format:** `{ "error": "message" }`

## Authentication

All endpoints (except auth routes) require authentication. Include the session cookie automatically handled by NextAuth.

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - Not logged in |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 422 | Validation Error - Invalid input |
| 500 | Server Error - Internal error |

---

## Authentication Endpoints

### POST /api/auth/[...nextauth]

NextAuth.js handler for all authentication operations.

**Operations:**
- Sign in: `POST /api/auth/callback/credentials`
- Sign out: `POST /api/auth/signout`
- Session: `GET /api/auth/session`

### POST /api/auth/register

Create a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

**Response:** `201 Created`
```json
{
  "id": "user-id",
  "email": "john@example.com",
  "name": "John Doe"
}
```

### POST /api/auth/forgot-password

Request password reset email.

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset email sent"
}
```

### POST /api/auth/reset-password

Reset password with token.

**Request:**
```json
{
  "token": "reset-token",
  "password": "NewSecurePass123",
  "confirmPassword": "NewSecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successful"
}
```

---

## Users

### GET /api/users

List all users with pagination.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |
| search | string | Search in name/email |
| roleId | string | Filter by role |

**Response:**
```json
{
  "data": [
    {
      "id": "user-id",
      "email": "john@example.com",
      "name": "John Doe",
      "role": { "id": "role-id", "name": "Admin" },
      "createdAt": "2025-01-30T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### POST /api/users

Create a new user.

**Request:**
```json
{
  "email": "john@example.com",
  "name": "John Doe",
  "password": "SecurePass123",
  "roleId": "role-id"
}
```

**Response:** `201 Created`

### GET /api/users/:id

Get user details.

**Response:**
```json
{
  "id": "user-id",
  "email": "john@example.com",
  "name": "John Doe",
  "image": "/uploads/avatar.jpg",
  "role": {
    "id": "role-id",
    "name": "Admin",
    "permissions": ["users.view", "users.create"]
  },
  "lastActiveAt": "2025-01-30T10:00:00Z",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### PUT /api/users/:id

Update user.

**Request:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "roleId": "new-role-id"
}
```

### DELETE /api/users/:id

Delete user.

**Response:** `204 No Content`

---

## Roles

### GET /api/roles

List all roles.

**Response:**
```json
{
  "data": [
    {
      "id": "role-id",
      "name": "Admin",
      "description": "Full access",
      "permissions": ["*"],
      "_count": { "users": 5 }
    }
  ]
}
```

### POST /api/roles

Create a new role.

**Request:**
```json
{
  "name": "Content Manager",
  "description": "Manages content",
  "permissions": ["posts.view", "posts.create", "posts.edit"]
}
```

### GET /api/roles/:id

Get role details with users count.

### PUT /api/roles/:id

Update role.

### DELETE /api/roles/:id

Delete role. Fails if users are assigned.

---

## Posts

### GET /api/posts

List posts with filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| status | string | DRAFT, PUBLISHED, SCHEDULED, ARCHIVED |
| search | string | Search in title/content |
| categoryId | string | Filter by category |
| authorId | string | Filter by author |

**Response:**
```json
{
  "data": [
    {
      "id": "post-id",
      "title": "My Post",
      "slug": "my-post",
      "excerpt": "Short description",
      "status": "PUBLISHED",
      "featuredImage": "/uploads/featured.jpg",
      "author": { "id": "user-id", "name": "John" },
      "category": { "id": "cat-id", "name": "Tech" },
      "tags": [{ "id": "tag-id", "name": "JavaScript" }],
      "publishedAt": "2025-01-30T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### POST /api/posts

Create a new post.

**Request:**
```json
{
  "title": "My New Post",
  "slug": "my-new-post",
  "content": "<p>HTML content...</p>",
  "excerpt": "Short description",
  "status": "DRAFT",
  "categoryId": "category-id",
  "tags": ["tag-id-1", "tag-id-2"],
  "featuredImage": "/uploads/image.jpg"
}
```

### GET /api/posts/:id

Get post details with relations.

### PUT /api/posts/:id

Update post.

### DELETE /api/posts/:id

Delete post.

### GET /api/posts/:id/seo

Get SEO metadata for post.

**Response:**
```json
{
  "metaTitle": "SEO Title",
  "metaDescription": "Meta description",
  "ogTitle": "OG Title",
  "ogImage": "/uploads/og.jpg",
  "twitterTitle": "Twitter Title",
  "noIndex": false
}
```

### PUT /api/posts/:id/seo

Update SEO metadata.

---

## Categories

### GET /api/categories

List all categories with hierarchy.

**Response:**
```json
{
  "data": [
    {
      "id": "cat-id",
      "name": "Technology",
      "slug": "technology",
      "children": [
        { "id": "child-id", "name": "Web Dev", "slug": "web-dev" }
      ],
      "_count": { "posts": 15 }
    }
  ]
}
```

### POST /api/categories

Create category.

**Request:**
```json
{
  "name": "Web Development",
  "slug": "web-development",
  "description": "Web dev articles",
  "parentId": "parent-category-id"
}
```

### GET /api/categories/:id

Get category with children and posts.

### PUT /api/categories/:id

Update category.

### DELETE /api/categories/:id

Delete category. Fails if has children or posts.

---

## Tags

### GET /api/tags

List all tags.

**Response:**
```json
{
  "data": [
    {
      "id": "tag-id",
      "name": "JavaScript",
      "slug": "javascript",
      "color": "#f7df1e",
      "_count": { "posts": 25 }
    }
  ]
}
```

### POST /api/tags

Create tag.

**Request:**
```json
{
  "name": "TypeScript",
  "slug": "typescript",
  "color": "#3178c6"
}
```

### GET /api/tags/:id
### PUT /api/tags/:id
### DELETE /api/tags/:id

---

## Media

### GET /api/media

List media files.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| folderId | string | Filter by folder |
| type | string | image, document |
| search | string | Search filename |

**Response:**
```json
{
  "data": [
    {
      "id": "media-id",
      "filename": "image.jpg",
      "originalName": "My Image.jpg",
      "mimeType": "image/jpeg",
      "size": 245678,
      "width": 1920,
      "height": 1080,
      "url": "/uploads/images/image.jpg",
      "folder": { "id": "folder-id", "name": "Blog" }
    }
  ]
}
```

### POST /api/media

Upload file. Use `multipart/form-data`.

**Form Fields:**
- `file`: File to upload
- `folderId`: Target folder (optional)

### GET /api/media/:id

Get media details.

### PATCH /api/media/:id

Update media (move to folder).

### DELETE /api/media/:id

Delete media file.

### GET /api/media/folders

List folders.

### POST /api/media/folders

Create folder.

**Request:**
```json
{
  "name": "Blog Images",
  "parentId": "parent-folder-id"
}
```

### GET /api/media/folders/:id
### PUT /api/media/folders/:id
### DELETE /api/media/folders/:id

---

## Plans

### GET /api/plans

List pricing plans.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | ACTIVE, INACTIVE, ARCHIVED |

**Response:**
```json
{
  "data": [
    {
      "id": "plan-id",
      "name": "Pro",
      "description": "For growing businesses",
      "priceMonthly": 29.99,
      "priceYearly": 299.99,
      "features": {
        "maxUsers": 10,
        "maxPosts": 100
      },
      "trialDays": 14,
      "status": "ACTIVE",
      "isPopular": true,
      "_count": { "subscriptions": 50 }
    }
  ]
}
```

### POST /api/plans

Create plan.

### GET /api/plans/:id
### PUT /api/plans/:id
### DELETE /api/plans/:id

---

## Subscriptions

### GET /api/subscriptions

List subscriptions.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | TRIALING, ACTIVE, PAST_DUE, CANCELED, EXPIRED |
| planId | string | Filter by plan |
| userId | string | Filter by user |

### POST /api/subscriptions

Create subscription.

**Request:**
```json
{
  "userId": "user-id",
  "planId": "plan-id",
  "billingPeriod": "MONTHLY"
}
```

### GET /api/subscriptions/:id

Get subscription details.

### PUT /api/subscriptions/:id

Update subscription.

### DELETE /api/subscriptions/:id

Cancel subscription.

---

## Email Templates

### GET /api/email/templates

List templates.

### POST /api/email/templates

Create template.

**Request:**
```json
{
  "name": "Welcome Email",
  "slug": "welcome",
  "subject": "Welcome, {{name}}!",
  "htmlContent": "<h1>Welcome...</h1>",
  "textContent": "Welcome...",
  "variables": {
    "name": "User's name",
    "loginUrl": "Login URL"
  }
}
```

### GET /api/email/templates/:id
### PUT /api/email/templates/:id
### DELETE /api/email/templates/:id

---

## Email Sending & Logs

### POST /api/email/send

Send email.

**Request:**
```json
{
  "to": "user@example.com",
  "templateSlug": "welcome",
  "variables": {
    "name": "John",
    "loginUrl": "https://app.com/login"
  }
}
```

### GET /api/email/logs

List email logs.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | PENDING, SENT, FAILED, BOUNCED |
| to | string | Filter by recipient |

### GET /api/email/logs/:id

Get log details.

### POST /api/email/logs/:id/retry

Retry failed email.

---

## Notifications

### GET /api/notifications

Get user notifications.

**Response:**
```json
{
  "data": [...],
  "unreadCount": 5
}
```

### POST /api/notifications

Create notification (admin).

### PATCH /api/notifications

Mark all as read.

### DELETE /api/notifications

Delete all notifications.

### GET /api/notifications/:id
### PATCH /api/notifications/:id

Mark as read.

### DELETE /api/notifications/:id

### GET /api/notifications/preferences
### POST /api/notifications/preferences

---

## Settings

### GET /api/settings

Get all settings.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| group | string | Filter by group |

### POST /api/settings

Upsert settings.

**Request:**
```json
{
  "settings": [
    { "key": "site_name", "value": "My App", "group": "general" },
    { "key": "theme", "value": "dark", "group": "appearance" }
  ]
}
```

---

## Redirects

### GET /api/redirects

List URL redirects.

### POST /api/redirects

Create redirect.

**Request:**
```json
{
  "source": "/old-page",
  "destination": "/new-page",
  "statusCode": 301
}
```

### GET /api/redirects/:id
### PUT /api/redirects/:id
### DELETE /api/redirects/:id

---

## Activity

### GET /api/activity

Get activity logs.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | Filter by user |
| entity | string | Filter by entity type |
| action | string | Filter by action |
| startDate | date | From date |
| endDate | date | To date |

---

## Analytics

### POST /api/analytics/track

Track page view.

**Request:**
```json
{
  "path": "/dashboard/posts"
}
```

---

## Search

### GET /api/search

Global search.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| q | string | Search query |
| type | string | posts, users, categories (optional) |

**Response:**
```json
{
  "posts": [...],
  "users": [...],
  "categories": [...]
}
```

---

## Backups

### GET /api/backups

List backups.

### POST /api/backups

Create backup.

**Response:**
```json
{
  "id": "backup-id",
  "filename": "backup-2025-01-30.json",
  "size": 1234567,
  "status": "COMPLETED",
  "tables": ["User", "Post", "Category"],
  "recordCount": 5000
}
```

### GET /api/backups/:id

Get backup details.

### POST /api/backups/restore

Restore from backup.

**Request:**
```json
{
  "backupId": "backup-id"
}
```

### DELETE /api/backups/:id

Delete backup.

---

## Profile

### GET /api/profile

Get current user profile.

### PUT /api/profile

Update profile.

**Request:**
```json
{
  "name": "Updated Name",
  "image": "/uploads/avatar.jpg"
}
```

### POST /api/profile/change-password

Change password.

**Request:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456",
  "confirmPassword": "NewPass456"
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "Error message",
  "details": {
    "field": ["Validation error"]
  }
}
```

### Common Errors

| Code | Message | Description |
|------|---------|-------------|
| 401 | Unauthorized | Session expired or invalid |
| 403 | Forbidden | Missing required permission |
| 404 | Not found | Resource doesn't exist |
| 422 | Validation failed | Invalid input data |
| 500 | Internal server error | Server-side error |
