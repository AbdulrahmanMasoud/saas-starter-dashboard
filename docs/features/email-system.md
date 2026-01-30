# Email System

The email system provides template-based email sending, delivery tracking, and comprehensive logging.

## Overview

- **Templates:** Reusable email templates with variables
- **Sending:** SMTP-based email delivery via Nodemailer
- **Logging:** Complete delivery tracking and history
- **Retry:** Automatic retry for failed emails

## Email Templates

### Template Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier |
| `name` | String | Template display name |
| `slug` | String | Template identifier (unique) |
| `subject` | String | Email subject line |
| `htmlContent` | Text | HTML email body |
| `textContent` | Text | Plain text email body |
| `variables` | JSON | Available template variables |
| `createdAt` | DateTime | Creation date |
| `updatedAt` | DateTime | Last update |

### Creating Templates

```typescript
// POST /api/email/templates
{
  "name": "Welcome Email",
  "slug": "welcome",
  "subject": "Welcome to {{siteName}}, {{name}}!",
  "htmlContent": `
    <h1>Welcome, {{name}}!</h1>
    <p>Thank you for joining {{siteName}}.</p>
    <p>Your account is ready to use.</p>
    <a href="{{loginUrl}}">Login to your account</a>
  `,
  "textContent": `
    Welcome, {{name}}!

    Thank you for joining {{siteName}}.
    Your account is ready to use.

    Login: {{loginUrl}}
  `,
  "variables": {
    "name": "User's name",
    "siteName": "Website name",
    "loginUrl": "Login page URL"
  }
}
```

### Template Variables

Variables use double curly braces: `{{variableName}}`

**Common Variables:**

| Variable | Description |
|----------|-------------|
| `{{name}}` | Recipient's name |
| `{{email}}` | Recipient's email |
| `{{siteName}}` | Website/app name |
| `{{siteUrl}}` | Website URL |
| `{{loginUrl}}` | Login page URL |
| `{{resetLink}}` | Password reset link |
| `{{verifyLink}}` | Email verification link |

### Default Templates

Recommended templates to create:

| Slug | Purpose |
|------|---------|
| `welcome` | New user registration |
| `password-reset` | Password reset request |
| `email-verification` | Email address verification |
| `subscription-welcome` | New subscription |
| `subscription-canceled` | Subscription cancellation |
| `trial-ending` | Trial period ending reminder |
| `payment-failed` | Payment failure notification |
| `password-changed` | Password change confirmation |

## Sending Emails

### Send Email Request

```typescript
// POST /api/email/send
{
  "to": "user@example.com",
  "templateSlug": "welcome",
  "variables": {
    "name": "John Doe",
    "siteName": "My App",
    "loginUrl": "https://myapp.com/login"
  }
}
```

### Send Email Response

```json
{
  "success": true,
  "emailLogId": "log-id",
  "message": "Email sent successfully"
}
```

### Sending Without Template

For one-off emails:

```typescript
// POST /api/email/send
{
  "to": "user@example.com",
  "subject": "Custom Subject",
  "htmlContent": "<p>Your HTML content</p>",
  "textContent": "Your plain text content"
}
```

### Multiple Recipients

```typescript
{
  "to": ["user1@example.com", "user2@example.com"],
  "templateSlug": "announcement",
  "variables": { ... }
}
```

## Email Logs

### Log Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier |
| `to` | String | Recipient email |
| `subject` | String | Email subject |
| `templateId` | String | Template used (if any) |
| `status` | Enum | Delivery status |
| `error` | String | Error message (if failed) |
| `sentAt` | DateTime | Send timestamp |
| `retryCount` | Int | Number of retry attempts |
| `createdAt` | DateTime | Creation date |

### Log Statuses

| Status | Description |
|--------|-------------|
| `PENDING` | Queued for sending |
| `SENT` | Successfully delivered |
| `FAILED` | Delivery failed |
| `BOUNCED` | Email bounced back |

### Viewing Logs

```typescript
// GET /api/email/logs

{
  "data": [
    {
      "id": "log-id",
      "to": "user@example.com",
      "subject": "Welcome to My App!",
      "template": {
        "id": "template-id",
        "name": "Welcome Email"
      },
      "status": "SENT",
      "sentAt": "2025-01-30T10:00:00Z",
      "createdAt": "2025-01-30T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### Log Details

```typescript
// GET /api/email/logs/:id

{
  "id": "log-id",
  "to": "user@example.com",
  "subject": "Welcome to My App!",
  "htmlContent": "<h1>Welcome...</h1>",
  "textContent": "Welcome...",
  "template": { ... },
  "status": "SENT",
  "sentAt": "2025-01-30T10:00:00Z",
  "error": null,
  "retryCount": 0
}
```

## Retry Failed Emails

### Manual Retry

```typescript
// POST /api/email/logs/:id/retry

{
  "success": true,
  "message": "Email queued for retry"
}
```

### Retry Behavior

- Maximum 3 retry attempts
- Exponential backoff between retries
- Status remains `FAILED` if all retries fail

## SMTP Configuration

### Environment Variables

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@yourdomain.com"
SMTP_SECURE="false"
```

### Settings-Based Configuration

SMTP can also be configured via Settings page:

| Setting | Description |
|---------|-------------|
| `smtp_host` | SMTP server hostname |
| `smtp_port` | SMTP server port |
| `smtp_user` | SMTP username |
| `smtp_password` | SMTP password (encrypted) |
| `smtp_from` | Default sender address |
| `smtp_from_name` | Default sender name |

### Provider Examples

**Gmail:**
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
```

**SendGrid:**
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-api-key"
```

**Amazon SES:**
```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
```

## Email Service

### Service Methods

```typescript
// src/lib/email/service.ts

// Send email using template
await sendTemplatedEmail({
  to: "user@example.com",
  templateSlug: "welcome",
  variables: { name: "John" }
});

// Send custom email
await sendEmail({
  to: "user@example.com",
  subject: "Custom Email",
  html: "<p>Content</p>",
  text: "Content"
});
```

### Variable Replacement

Variables are replaced at send time:

```typescript
function replaceVariables(content: string, variables: Record<string, string>) {
  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
}
```

## API Endpoints

### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/email/templates` | List templates |
| POST | `/api/email/templates` | Create template |
| GET | `/api/email/templates/:id` | Get template |
| PUT | `/api/email/templates/:id` | Update template |
| DELETE | `/api/email/templates/:id` | Delete template |

### Sending

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/email/send` | Send email |

### Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/email/logs` | List email logs |
| GET | `/api/email/logs/:id` | Get log details |
| POST | `/api/email/logs/:id/retry` | Retry failed email |

## Query Parameters

### Filtering Logs

```typescript
// GET /api/email/logs?status=FAILED&to=user@example.com

// Parameters:
// - status: Filter by status (PENDING, SENT, FAILED, BOUNCED)
// - to: Filter by recipient
// - templateId: Filter by template
// - startDate: Filter from date
// - endDate: Filter to date
// - page, limit: Pagination
```

## Permissions

| Permission | Description |
|------------|-------------|
| `email.templates.view` | View templates |
| `email.templates.create` | Create templates |
| `email.templates.edit` | Edit templates |
| `email.templates.delete` | Delete templates |
| `email.send` | Send emails |
| `email.logs.view` | View email logs |

## Best Practices

### Template Design

1. **Keep it simple:** Clear, scannable content
2. **Mobile-friendly:** Responsive HTML
3. **Plain text:** Always include text version
4. **Test thoroughly:** Preview before sending

### Deliverability

1. **SPF/DKIM:** Configure DNS records
2. **Sender reputation:** Use consistent from address
3. **Unsubscribe:** Include unsubscribe links
4. **List hygiene:** Remove bounced addresses

### Security

1. **No sensitive data:** Avoid passwords in emails
2. **Expiring links:** Time-limit reset links
3. **HTTPS links:** Use secure URLs only

## Troubleshooting

### Emails Not Sending

1. Check SMTP configuration
2. Verify credentials are correct
3. Check for firewall blocking port
4. Review error in email logs

### Emails Going to Spam

1. Set up SPF/DKIM records
2. Use consistent sender address
3. Avoid spam trigger words
4. Include unsubscribe option

### Template Variables Not Replacing

1. Check variable names match exactly
2. Ensure variables are passed when sending
3. Use double curly braces `{{variable}}`

## Related Documentation

- [Configuration](../configuration.md)
- [Notifications](settings.md)
- [API Reference](../api/endpoints.md)
