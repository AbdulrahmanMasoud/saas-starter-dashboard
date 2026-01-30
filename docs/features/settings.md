# Settings

The settings system provides centralized configuration management for all aspects of the application.

## Overview

- **Key-Value Store:** Flexible configuration storage
- **Grouped Settings:** Organized by category
- **Database Backed:** Persistent configuration
- **API Access:** Programmatic settings management

## Settings Structure

### Setting Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier |
| `key` | String | Setting key (unique) |
| `value` | String | Setting value |
| `group` | String | Setting group/category |
| `createdAt` | DateTime | Creation date |
| `updatedAt` | DateTime | Last update |

### Setting Groups

| Group | Description |
|-------|-------------|
| `general` | Site name, description, URL |
| `appearance` | Theme, colors, logo |
| `security` | Password policy, session settings |
| `email` | SMTP configuration |
| `notifications` | Notification preferences |
| `integrations` | Third-party integrations |
| `backup` | Backup settings |

## General Settings

### Available Settings

| Key | Description | Example |
|-----|-------------|---------|
| `site_name` | Website/application name | "My App" |
| `site_tagline` | Short description | "The best app ever" |
| `site_description` | Full description | "A comprehensive..." |
| `site_url` | Public URL | "https://myapp.com" |
| `contact_email` | Contact email | "contact@myapp.com" |
| `support_email` | Support email | "support@myapp.com" |
| `timezone` | Default timezone | "America/New_York" |
| `date_format` | Date display format | "YYYY-MM-DD" |
| `time_format` | Time display format | "HH:mm:ss" |

## Appearance Settings

### Theme Settings

| Key | Description | Values |
|-----|-------------|--------|
| `theme` | Default theme | "light", "dark", "system" |
| `primary_color` | Primary brand color | "#3b82f6" |
| `secondary_color` | Secondary color | "#64748b" |
| `accent_color` | Accent color | "#f59e0b" |

### Branding Settings

| Key | Description | Example |
|-----|-------------|---------|
| `logo_url` | Site logo URL | "/uploads/logo.png" |
| `logo_dark_url` | Logo for dark mode | "/uploads/logo-dark.png" |
| `favicon_url` | Favicon URL | "/favicon.ico" |
| `og_image_default` | Default social image | "/uploads/og-default.jpg" |

### Layout Settings

| Key | Description | Values |
|-----|-------------|--------|
| `sidebar_collapsed` | Default sidebar state | "true", "false" |
| `items_per_page` | Default pagination | "10", "25", "50" |

## Security Settings

### Password Policy

| Key | Description | Default |
|-----|-------------|---------|
| `password_min_length` | Minimum password length | "8" |
| `password_require_uppercase` | Require uppercase | "true" |
| `password_require_lowercase` | Require lowercase | "true" |
| `password_require_numbers` | Require numbers | "true" |
| `password_require_special` | Require special chars | "false" |

### Session Settings

| Key | Description | Default |
|-----|-------------|---------|
| `session_timeout` | Session timeout (minutes) | "1440" (24 hours) |
| `max_login_attempts` | Failed attempts before lockout | "5" |
| `lockout_duration` | Lockout duration (minutes) | "15" |

### Security Features

| Key | Description | Default |
|-----|-------------|---------|
| `require_email_verification` | Verify emails on signup | "true" |
| `allow_registration` | Public registration | "true" |
| `two_factor_enabled` | Enable 2FA (future) | "false" |

## Email Settings

### SMTP Configuration

| Key | Description | Example |
|-----|-------------|---------|
| `smtp_host` | SMTP server | "smtp.gmail.com" |
| `smtp_port` | SMTP port | "587" |
| `smtp_user` | SMTP username | "email@gmail.com" |
| `smtp_password` | SMTP password | (encrypted) |
| `smtp_from` | Default sender email | "noreply@myapp.com" |
| `smtp_from_name` | Default sender name | "My App" |
| `smtp_secure` | Use TLS | "false" |

### Email Behavior

| Key | Description | Default |
|-----|-------------|---------|
| `email_footer` | Default email footer | "© 2025 My App" |
| `email_unsubscribe_url` | Unsubscribe link | "/unsubscribe" |

## Notification Settings

### System Notifications

| Key | Description | Default |
|-----|-------------|---------|
| `notify_admin_new_user` | Email admin on new user | "true" |
| `notify_admin_new_post` | Email admin on new post | "false" |
| `notify_user_welcome` | Send welcome email | "true" |
| `notify_user_password_reset` | Send reset confirmation | "true" |

### Digest Settings

| Key | Description | Values |
|-----|-------------|--------|
| `digest_frequency` | Email digest frequency | "daily", "weekly", "none" |
| `digest_day` | Day for weekly digest | "1" (Monday) |
| `digest_time` | Time for digest | "09:00" |

## Integration Settings

### Analytics

| Key | Description | Example |
|-----|-------------|---------|
| `google_analytics_id` | GA tracking ID | "G-XXXXXXXXXX" |
| `google_tag_manager_id` | GTM container ID | "GTM-XXXXXXX" |
| `facebook_pixel_id` | FB Pixel ID | "123456789" |
| `tiktok_pixel_id` | TikTok Pixel ID | "XXXXXXXXXXXXXXXXXX" |
| `snapchat_pixel_id` | Snapchat Pixel ID | "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" |

### Custom Scripts

| Key | Description | Use |
|-----|-------------|-----|
| `custom_head_scripts` | Scripts for `<head>` | Analytics, meta tags |
| `custom_body_start_scripts` | Scripts after `<body>` | Tracking |
| `custom_body_end_scripts` | Scripts before `</body>` | Chat widgets |

### Social Links

| Key | Description | Example |
|-----|-------------|---------|
| `social_twitter` | Twitter/X URL | "https://twitter.com/myapp" |
| `social_facebook` | Facebook URL | "https://facebook.com/myapp" |
| `social_linkedin` | LinkedIn URL | "https://linkedin.com/company/myapp" |
| `social_github` | GitHub URL | "https://github.com/myapp" |

## Backup Settings

| Key | Description | Default |
|-----|-------------|---------|
| `backup_retention_days` | Days to keep backups | "30" |
| `auto_backup_enabled` | Enable auto backups | "false" |
| `auto_backup_frequency` | Backup frequency | "daily" |
| `auto_backup_time` | Backup time | "02:00" |

## API Usage

### Get All Settings

```typescript
// GET /api/settings

{
  "general": {
    "site_name": "My App",
    "site_tagline": "The best app ever",
    // ...
  },
  "appearance": {
    "theme": "system",
    "primary_color": "#3b82f6",
    // ...
  },
  // ... other groups
}
```

### Get Settings by Group

```typescript
// GET /api/settings?group=general

{
  "site_name": "My App",
  "site_tagline": "The best app ever",
  "site_url": "https://myapp.com"
}
```

### Update Settings

```typescript
// POST /api/settings
{
  "settings": [
    { "key": "site_name", "value": "New App Name", "group": "general" },
    { "key": "theme", "value": "dark", "group": "appearance" },
    { "key": "smtp_host", "value": "smtp.sendgrid.net", "group": "email" }
  ]
}
```

### Upsert Behavior

The settings API uses upsert - it creates new settings or updates existing ones.

## Using Settings in Code

### Server-Side

```typescript
import { db } from "@/lib/db";

async function getSetting(key: string): Promise<string | null> {
  const setting = await db.setting.findUnique({
    where: { key }
  });
  return setting?.value || null;
}

async function getSettingsByGroup(group: string) {
  const settings = await db.setting.findMany({
    where: { group }
  });
  return Object.fromEntries(
    settings.map(s => [s.key, s.value])
  );
}

// Usage
const siteName = await getSetting("site_name");
const emailSettings = await getSettingsByGroup("email");
```

### Client-Side

```typescript
"use client";

import useSWR from "swr";

function useSettings(group?: string) {
  const url = group ? `/api/settings?group=${group}` : "/api/settings";
  const { data, error, mutate } = useSWR(url);

  return {
    settings: data,
    isLoading: !error && !data,
    isError: error,
    mutate
  };
}

// Usage
function Component() {
  const { settings } = useSettings("general");
  return <h1>{settings?.site_name}</h1>;
}
```

## Settings UI

The Settings page in the dashboard provides a form-based interface for each group:

1. **General:** Text inputs for site info
2. **Appearance:** Color pickers, file upload for logo
3. **Security:** Toggles and number inputs
4. **Email:** SMTP configuration form with test button
5. **Notifications:** Toggle switches
6. **Integrations:** API key inputs

## Permissions

| Permission | Description |
|------------|-------------|
| `settings.view` | View settings |
| `settings.edit` | Modify settings |
| `settings.security` | Modify security settings |

## Validation

Settings are validated based on their expected type:

```typescript
const validations = {
  site_name: z.string().min(1).max(100),
  site_url: z.string().url(),
  smtp_port: z.string().regex(/^\d+$/),
  password_min_length: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(6).max(128)),
  theme: z.enum(["light", "dark", "system"]),
  // ...
};
```

## Default Values

If a setting doesn't exist, the system uses defaults:

```typescript
const defaults = {
  site_name: "Dashboard",
  theme: "system",
  password_min_length: "8",
  session_timeout: "1440",
  items_per_page: "10",
  // ...
};
```

## Related Documentation

- [Configuration](../configuration.md)
- [Email System](email-system.md)
- [API Reference](../api/endpoints.md)
