# Configuration

This guide covers all configuration options for the Taqnihub Fullstack Starter Dashboard.

## Environment Variables

Create a `.env` file in the project root with the following variables:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@localhost:3306/db` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Session encryption key (32+ chars) | `your-super-secret-key...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | - |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username/email | - |
| `SMTP_PASSWORD` | SMTP password | - |
| `SMTP_FROM` | Default sender email | - |
| `SMTP_SECURE` | Use TLS (`true`/`false`) | `false` |

### Complete `.env.example`

```env
# ===========================================
# DATABASE
# ===========================================
# MySQL connection string
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="mysql://root:password@localhost:3306/dashboard_db"

# ===========================================
# AUTHENTICATION
# ===========================================
# The base URL of your application
NEXTAUTH_URL="http://localhost:3000"

# Secret for encrypting sessions (min 32 characters)
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"

# ===========================================
# EMAIL (Optional)
# ===========================================
# SMTP server settings for sending emails
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@yourdomain.com"
SMTP_SECURE="false"

# ===========================================
# APPLICATION (Optional)
# ===========================================
# Node environment
NODE_ENV="development"
```

## Database Configuration

### Connection String Format

```
mysql://USER:PASSWORD@HOST:PORT/DATABASE?options
```

**Examples:**

Local development:
```
mysql://root:password@localhost:3306/dashboard_db
```

Remote server:
```
mysql://admin:securepass@db.example.com:3306/production_db
```

With SSL:
```
mysql://user:pass@host:3306/db?sslmode=require
```

### Connection Pool Settings

For production, configure connection pooling in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  // Connection pool settings
  // connectionLimit = 10
}
```

## Authentication Configuration

Authentication is configured in `src/auth.ts`:

### Session Strategy

The default uses JWT tokens:

```typescript
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 days
}
```

### Password Requirements

Default password policy (configurable via settings):

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Protected Routes

Routes under `/(dashboard)` require authentication. The middleware checks session validity and redirects unauthenticated users to `/login`.

## SMTP/Email Configuration

### Gmail Setup

1. Enable 2-factor authentication on your Google account
2. Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Configure environment:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-16-char-app-password"
SMTP_FROM="your-email@gmail.com"
```

### SendGrid Setup

```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
SMTP_FROM="noreply@yourdomain.com"
```

### Mailgun Setup

```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="postmaster@your-domain.mailgun.org"
SMTP_PASSWORD="your-mailgun-password"
SMTP_FROM="noreply@yourdomain.com"
```

### Amazon SES Setup

```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_USER="your-ses-smtp-username"
SMTP_PASSWORD="your-ses-smtp-password"
SMTP_FROM="verified-email@yourdomain.com"
```

## Application Settings

Settings are managed through the Settings page in the dashboard and stored in the database.

### General Settings

| Setting | Description |
|---------|-------------|
| `site_name` | Website/application name |
| `site_tagline` | Short description/tagline |
| `site_description` | Full site description |
| `site_url` | Public URL of the site |
| `contact_email` | Contact email address |

### Appearance Settings

| Setting | Description |
|---------|-------------|
| `theme` | Default theme (`light`, `dark`, `system`) |
| `primary_color` | Primary brand color |
| `logo_url` | URL to site logo |
| `favicon_url` | URL to favicon |

### Security Settings

| Setting | Description |
|---------|-------------|
| `password_min_length` | Minimum password length |
| `require_uppercase` | Require uppercase in passwords |
| `require_numbers` | Require numbers in passwords |
| `session_timeout` | Session timeout in minutes |
| `max_login_attempts` | Max failed login attempts |

### Email Settings

| Setting | Description |
|---------|-------------|
| `smtp_host` | SMTP server (overrides env) |
| `smtp_port` | SMTP port |
| `smtp_user` | SMTP username |
| `smtp_from` | Default sender email |
| `email_footer` | Default email footer text |

### Notification Settings

| Setting | Description |
|---------|-------------|
| `notify_new_user` | Email on new user registration |
| `notify_new_post` | Email on new post published |
| `notify_new_comment` | Email on new comment |
| `digest_frequency` | Email digest frequency |

### Integration Settings

| Setting | Description |
|---------|-------------|
| `google_analytics_id` | Google Analytics tracking ID |
| `facebook_pixel_id` | Facebook Pixel ID |
| `custom_head_scripts` | Custom scripts for `<head>` |
| `custom_body_scripts` | Custom scripts for `<body>` |

## Theme Customization

### Dark Mode

Dark mode is handled by `next-themes`. Configuration in `src/components/providers/theme-provider.tsx`:

```typescript
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
```

### Tailwind CSS

Customize colors and theme in `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      // Add custom colors
    },
  },
}
```

### CSS Variables

Theme colors are defined as CSS variables in `src/app/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  /* ... dark mode overrides */
}
```

## Navigation Customization

The sidebar navigation is defined in `src/components/dashboard/sidebar.tsx`. Modify the `navigation` array to customize menu items:

```typescript
const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Posts",
    href: "/dashboard/posts",
    icon: FileText,
    permission: "posts.view", // Required permission
  },
  // Add more items...
];
```

## Permission System

### Permission Format

Permissions follow the pattern: `resource.action`

**Examples:**
- `users.view` - View users list
- `users.create` - Create new users
- `users.edit` - Edit existing users
- `users.delete` - Delete users
- `posts.publish` - Publish posts

### Default Permissions

The system includes 55+ granular permissions across:

- Users management
- Roles management
- Posts management
- Categories management
- Tags management
- Media management
- Settings management
- Subscription management
- Email management
- Notification management
- Backup management

### Role Configuration

Roles are stored in the database with a JSON permissions array:

```json
{
  "name": "Editor",
  "permissions": [
    "posts.view",
    "posts.create",
    "posts.edit",
    "categories.view",
    "media.view",
    "media.upload"
  ]
}
```

## File Upload Configuration

### Upload Directory

Files are uploaded to `/public/uploads/`. This can be customized in the media upload handler.

### Allowed File Types

Configure allowed file types in the media API:

```typescript
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
```

### File Size Limits

Default maximum file size is 10MB. Configure in your hosting environment or reverse proxy.

## Next Steps

- [Authentication](features/authentication.md) - Auth system details
- [API Reference](api/endpoints.md) - API documentation
- [Deployment](deployment.md) - Production deployment
