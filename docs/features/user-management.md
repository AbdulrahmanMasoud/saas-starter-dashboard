# User Management

The user management system provides comprehensive tools for managing users, roles, and permissions.

## Overview

- **User CRUD:** Create, read, update, delete users
- **Role System:** 4 default roles with customizable permissions
- **Permissions:** 55+ granular permissions
- **Activity Tracking:** Full audit trail of user actions

## Users

### User Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier (CUID) |
| `email` | String | Email address (unique) |
| `name` | String | Display name |
| `password` | String | Hashed password (bcrypt) |
| `image` | String | Avatar URL |
| `roleId` | String | Assigned role |
| `lastActiveAt` | DateTime | Last activity timestamp |
| `emailVerified` | DateTime | Email verification date |
| `createdAt` | DateTime | Account creation date |
| `updatedAt` | DateTime | Last update date |

### Creating Users

```typescript
// POST /api/users
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123",
  "roleId": "role-id"
}
```

### Updating Users

```typescript
// PUT /api/users/:id
{
  "name": "John Updated",
  "email": "newemail@example.com",
  "roleId": "new-role-id"
}
```

### Password Updates

Passwords can be updated separately:

```typescript
// POST /api/profile/change-password
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewSecurePass456",
  "confirmPassword": "NewSecurePass456"
}
```

### Deleting Users

```typescript
// DELETE /api/users/:id

// Note: Deletes user and associated data
// Some related data may be preserved for audit
```

## Roles

### Default Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Admin** | Full system access | All permissions |
| **Editor** | Content management | posts.*, categories.*, tags.*, media.* |
| **Author** | Own content only | posts.create, posts.edit (own), media.upload |
| **User** | Basic access | View-only access to most features |

### Role Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier |
| `name` | String | Role name (unique) |
| `description` | String | Role description |
| `permissions` | JSON | Array of permission strings |
| `createdAt` | DateTime | Creation date |
| `updatedAt` | DateTime | Last update |

### Creating Roles

```typescript
// POST /api/roles
{
  "name": "Content Manager",
  "description": "Manages all content including posts and media",
  "permissions": [
    "posts.view",
    "posts.create",
    "posts.edit",
    "posts.delete",
    "posts.publish",
    "categories.view",
    "categories.create",
    "categories.edit",
    "tags.view",
    "tags.create",
    "tags.edit",
    "media.view",
    "media.upload",
    "media.delete"
  ]
}
```

### Updating Roles

```typescript
// PUT /api/roles/:id
{
  "name": "Senior Content Manager",
  "permissions": [
    // Updated permission list
  ]
}
```

## Permissions

### Permission Format

Permissions follow the pattern: `resource.action`

### Complete Permission List

**Users:**
- `users.view` - View users list
- `users.create` - Create new users
- `users.edit` - Edit user details
- `users.delete` - Delete users
- `users.roles` - Manage user roles

**Roles:**
- `roles.view` - View roles list
- `roles.create` - Create new roles
- `roles.edit` - Edit role permissions
- `roles.delete` - Delete roles

**Posts:**
- `posts.view` - View posts
- `posts.create` - Create posts
- `posts.edit` - Edit posts
- `posts.delete` - Delete posts
- `posts.publish` - Publish/unpublish posts

**Categories:**
- `categories.view` - View categories
- `categories.create` - Create categories
- `categories.edit` - Edit categories
- `categories.delete` - Delete categories

**Tags:**
- `tags.view` - View tags
- `tags.create` - Create tags
- `tags.edit` - Edit tags
- `tags.delete` - Delete tags

**Media:**
- `media.view` - View media library
- `media.upload` - Upload files
- `media.edit` - Edit file metadata
- `media.delete` - Delete files
- `media.folders.create` - Create folders
- `media.folders.edit` - Edit folders
- `media.folders.delete` - Delete folders

**Settings:**
- `settings.view` - View settings
- `settings.edit` - Modify settings
- `settings.security` - Manage security settings

**Subscriptions:**
- `plans.view` - View plans
- `plans.create` - Create plans
- `plans.edit` - Edit plans
- `plans.delete` - Delete plans
- `subscriptions.view` - View subscriptions
- `subscriptions.create` - Create subscriptions
- `subscriptions.edit` - Edit subscriptions
- `subscriptions.cancel` - Cancel subscriptions

**Email:**
- `email.templates.view` - View email templates
- `email.templates.create` - Create templates
- `email.templates.edit` - Edit templates
- `email.templates.delete` - Delete templates
- `email.send` - Send emails
- `email.logs.view` - View email logs

**Notifications:**
- `notifications.view` - View notifications
- `notifications.create` - Create notifications
- `notifications.manage` - Manage all notifications

**Backups:**
- `backups.view` - View backups
- `backups.create` - Create backups
- `backups.restore` - Restore from backup
- `backups.delete` - Delete backups

**Redirects:**
- `redirects.view` - View redirects
- `redirects.create` - Create redirects
- `redirects.edit` - Edit redirects
- `redirects.delete` - Delete redirects

### Checking Permissions

**Server-side (API Routes):**

```typescript
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  const permissions = session?.user?.role?.permissions || [];

  if (!permissions.includes("users.view")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Proceed with authorized action
}
```

**Client-side:**

```typescript
import { useSession } from "next-auth/react";

function Component() {
  const { data: session } = useSession();

  const hasPermission = (permission: string) => {
    return session?.user?.role?.permissions?.includes(permission);
  };

  return (
    <div>
      {hasPermission("users.create") && (
        <button>Create User</button>
      )}
    </div>
  );
}
```

## Activity Tracking

### Activity Log Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier |
| `action` | String | Action performed |
| `entity` | String | Entity type (user, post, etc.) |
| `entityId` | String | Entity identifier |
| `userId` | String | User who performed action |
| `metadata` | JSON | Additional action data |
| `ipAddress` | String | User's IP address |
| `userAgent` | String | Browser/client info |
| `createdAt` | DateTime | Timestamp |

### Logged Actions

- User login/logout
- User created/updated/deleted
- Role created/updated/deleted
- Permission changes
- Password changes
- Profile updates

### Viewing Activity

```typescript
// GET /api/activity?userId=123&entity=user&page=1&limit=20

{
  "data": [
    {
      "id": "activity-id",
      "action": "user.updated",
      "entity": "user",
      "entityId": "user-id",
      "user": { "id": "...", "name": "Admin" },
      "metadata": { "changes": ["name", "email"] },
      "ipAddress": "192.168.1.1",
      "createdAt": "2025-01-30T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

## API Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users |
| POST | `/api/users` | Create user |
| GET | `/api/users/:id` | Get user details |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Roles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roles` | List roles |
| POST | `/api/roles` | Create role |
| GET | `/api/roles/:id` | Get role details |
| PUT | `/api/roles/:id` | Update role |
| DELETE | `/api/roles/:id` | Delete role |

### Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get current user profile |
| PUT | `/api/profile` | Update profile |
| POST | `/api/profile/change-password` | Change password |

### Activity

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activity` | List activity logs |

## Query Parameters

### Filtering Users

```typescript
// GET /api/users?search=john&roleId=123&page=1&limit=10

// Parameters:
// - search: Search in name and email
// - roleId: Filter by role
// - page: Page number
// - limit: Items per page
// - sortBy: Sort field (name, email, createdAt)
// - sortOrder: asc or desc
```

### Filtering Roles

```typescript
// GET /api/roles?search=admin

// Parameters:
// - search: Search in name and description
```

## Best Practices

### Role Design

1. **Principle of Least Privilege:** Grant minimum required permissions
2. **Role Hierarchy:** Create roles from restrictive to permissive
3. **Audit Regularly:** Review permissions periodically

### User Management

1. **Strong Passwords:** Enforce password requirements
2. **Regular Audits:** Review user access regularly
3. **Deactivation:** Disable unused accounts promptly

### Security

1. **Activity Monitoring:** Review logs for suspicious activity
2. **Session Management:** Implement session timeouts
3. **Two-Factor Authentication:** Consider adding 2FA (future feature)

## Related Documentation

- [Authentication](authentication.md)
- [Settings](settings.md)
- [API Reference](../api/endpoints.md)
