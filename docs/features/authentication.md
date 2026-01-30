# Authentication

The Taqnihub Fullstack Starter Dashboard uses NextAuth.js v5 for authentication with a JWT-based session strategy.

## Overview

- **Provider:** Credentials (email/password)
- **Session Strategy:** JWT tokens
- **Password Hashing:** bcryptjs
- **Session Duration:** 30 days (configurable)

## How It Works

### Login Flow

1. User submits email and password on `/login`
2. NextAuth validates credentials against the database
3. Password is verified using bcryptjs
4. On success, a JWT token is created with user data
5. User is redirected to the dashboard

### Session Management

Sessions are stored in JWT tokens (not in the database). The token contains:

```typescript
{
  id: string;        // User ID
  email: string;     // User email
  name: string;      // User name
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
}
```

## Password Requirements

Default password policy:

| Requirement | Value |
|-------------|-------|
| Minimum length | 8 characters |
| Uppercase | At least 1 |
| Lowercase | At least 1 |
| Numbers | At least 1 |

Password requirements are validated using Zod:

```typescript
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");
```

## Protected Routes

All routes under `/(dashboard)` require authentication. The protection is handled by NextAuth middleware.

### Middleware Configuration

```typescript
// middleware.ts
export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

### Checking Authentication in Components

**Server Components:**

```typescript
import { auth } from "@/auth";

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <div>Welcome, {session.user.name}</div>;
}
```

**Client Components:**

```typescript
"use client";

import { useSession } from "next-auth/react";

export default function Component() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Not authenticated</div>;
  }

  return <div>Welcome, {session.user.name}</div>;
}
```

## Role-Based Access Control (RBAC)

### Default Roles

| Role | Description |
|------|-------------|
| Admin | Full access to all features |
| Editor | Manage content, limited user access |
| Author | Create and manage own content |
| User | Basic access, view-only for most features |

### Permission Format

Permissions follow the pattern: `resource.action`

**Common Permissions:**

| Permission | Description |
|------------|-------------|
| `users.view` | View users list |
| `users.create` | Create new users |
| `users.edit` | Edit user details |
| `users.delete` | Delete users |
| `posts.view` | View posts |
| `posts.create` | Create new posts |
| `posts.edit` | Edit posts |
| `posts.delete` | Delete posts |
| `posts.publish` | Publish/unpublish posts |
| `settings.view` | View settings |
| `settings.edit` | Modify settings |

### Checking Permissions

**In Server Components/API Routes:**

```typescript
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user?.role?.permissions?.includes("users.view")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Proceed with authorized action
}
```

**In Client Components:**

```typescript
const { data: session } = useSession();

const canEditUsers = session?.user?.role?.permissions?.includes("users.edit");

return (
  <div>
    {canEditUsers && <EditButton />}
  </div>
);
```

## Password Reset Flow

### 1. Request Reset

User submits email on `/forgot-password`:

```typescript
// POST /api/auth/forgot-password
{
  "email": "user@example.com"
}
```

System:
1. Generates a unique token
2. Stores token in `PasswordResetToken` table (expires in 1 hour)
3. Sends email with reset link

### 2. Reset Password

User clicks link and submits new password on `/reset-password`:

```typescript
// POST /api/auth/reset-password
{
  "token": "reset-token-from-email",
  "password": "newSecurePassword123",
  "confirmPassword": "newSecurePassword123"
}
```

System:
1. Validates token exists and not expired
2. Hashes new password
3. Updates user's password
4. Deletes the reset token
5. Redirects to login

## Registration

New user registration on `/register`:

```typescript
// POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

The system:
1. Validates input with Zod schema
2. Checks if email already exists
3. Hashes password with bcryptjs
4. Creates user with default role
5. Redirects to login

## Session Callbacks

Session data is enriched with role information through NextAuth callbacks:

```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.role = user.role;
    }
    return token;
  },
  async session({ session, token }) {
    if (token) {
      session.user.id = token.id;
      session.user.role = token.role;
    }
    return session;
  },
}
```

## Sign Out

Sign out is handled by NextAuth:

```typescript
import { signOut } from "next-auth/react";

// Client-side sign out
await signOut({ callbackUrl: "/login" });
```

## Security Considerations

### Password Storage

- Passwords are hashed using bcryptjs with salt rounds
- Plain text passwords are never stored
- Password comparison uses constant-time comparison

### Session Security

- JWT tokens are signed with `NEXTAUTH_SECRET`
- Tokens expire after 30 days
- Sessions are validated on each request

### Best Practices

1. **Use HTTPS** in production
2. **Rotate `NEXTAUTH_SECRET`** periodically
3. **Implement rate limiting** for login attempts
4. **Log authentication events** for audit trail
5. **Use secure cookie settings** in production

## Activity Logging

Authentication events are logged to the `ActivityLog` table:

| Event | Description |
|-------|-------------|
| `user.login` | Successful login |
| `user.logout` | User signed out |
| `user.login_failed` | Failed login attempt |
| `user.password_reset` | Password was reset |
| `user.register` | New user registered |

## Troubleshooting

### "Invalid credentials"

- Verify email exists in database
- Check password is correct
- Ensure user account is active

### Session not persisting

- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your domain
- Check cookie settings in production

### Role/permissions not loading

- Ensure user has a valid `roleId`
- Check role exists in database
- Verify role has permissions array

## Related Documentation

- [User Management](user-management.md)
- [API Endpoints](../api/endpoints.md)
- [Configuration](../configuration.md)
