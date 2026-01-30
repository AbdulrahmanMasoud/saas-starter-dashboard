# Database Schema

Complete reference for the Prisma database schema used in the Taqnihub Fullstack Starter Dashboard.

## Overview

- **Database:** MySQL 8+
- **ORM:** Prisma 6
- **Models:** 23 tables
- **Enums:** 6 enumerations

## Entity Relationship Diagram

```
User ─────────┬───── Role
  │           │
  ├── Post ───┼───── Category
  │    │      │         │
  │    ├── PostTag ── Tag
  │    │
  │    └── SeoMeta
  │
  ├── Subscription ── Plan
  │
  ├── Notification
  │
  ├── NotificationPreference
  │
  └── ActivityLog

Media ──── MediaFolder (self-referential)

Setting, Redirect, EmailTemplate, EmailLog, Backup
```

---

## Authentication Models

### User

Primary user model for authentication and authorization.

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String?
  image         String?
  emailVerified DateTime?
  lastActiveAt  DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  roleId        String?
  role          Role?     @relation(fields: [roleId], references: [id])
  accounts      Account[]
  sessions      Session[]
  posts         Post[]
  subscriptions Subscription[]
  notifications Notification[]
  notificationPreferences NotificationPreference[]
  activityLogs  ActivityLog[]
  pageViews     PageView[]
}
```

| Field | Type | Description |
|-------|------|-------------|
| id | CUID | Unique identifier |
| email | String | Unique email address |
| name | String? | Display name |
| password | String? | Bcrypt hashed password |
| image | String? | Avatar URL |
| emailVerified | DateTime? | Email verification timestamp |
| lastActiveAt | DateTime? | Last activity timestamp |
| roleId | String? | Foreign key to Role |

### Account

NextAuth OAuth account linking.

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

### Session

User sessions for database strategy (not used with JWT).

```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### VerificationToken

Email verification tokens.

```prisma
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### PasswordResetToken

Password reset tokens.

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expires   DateTime
  createdAt DateTime @default(now())
}
```

---

## Authorization Models

### Role

User roles with permissions.

```prisma
model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  permissions Json     @default("[]")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  users User[]
}
```

| Field | Type | Description |
|-------|------|-------------|
| id | CUID | Unique identifier |
| name | String | Role name (unique) |
| description | String? | Role description |
| permissions | JSON | Array of permission strings |

**Permissions Format:**
```json
["users.view", "users.create", "posts.view", "posts.edit"]
```

---

## Content Models

### Post

Blog posts and articles.

```prisma
model Post {
  id            String     @id @default(cuid())
  title         String
  slug          String     @unique
  content       String?    @db.LongText
  excerpt       String?
  featuredImage String?
  status        PostStatus @default(DRAFT)
  publishedAt   DateTime?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  // Relations
  authorId   String
  author     User      @relation(fields: [authorId], references: [id])
  categoryId String?
  category   Category? @relation(fields: [categoryId], references: [id])
  tags       PostTag[]
  seoMeta    SeoMeta?
}
```

| Field | Type | Description |
|-------|------|-------------|
| id | CUID | Unique identifier |
| title | String | Post title |
| slug | String | URL slug (unique) |
| content | LongText | HTML content |
| excerpt | String? | Short summary |
| featuredImage | String? | Image URL |
| status | PostStatus | Publication status |
| publishedAt | DateTime? | Publication date |

### Category

Hierarchical content categories.

```prisma
model Category {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Self-referential relation for hierarchy
  parentId String?
  parent   Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children Category[] @relation("CategoryHierarchy")

  posts Post[]
}
```

### Tag

Post tags with optional colors.

```prisma
model Tag {
  id        String    @id @default(cuid())
  name      String
  slug      String    @unique
  color     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  posts PostTag[]
}
```

### PostTag

Junction table for Post-Tag many-to-many.

```prisma
model PostTag {
  id        String   @id @default(cuid())
  postId    String
  tagId     String
  createdAt DateTime @default(now())

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([postId, tagId])
}
```

### SeoMeta

SEO metadata for posts.

```prisma
model SeoMeta {
  id               String  @id @default(cuid())
  postId           String  @unique
  metaTitle        String?
  metaDescription  String?
  metaKeywords     String?
  canonicalUrl     String?
  ogTitle          String?
  ogDescription    String?
  ogImage          String?
  twitterTitle     String?
  twitterDescription String?
  twitterImage     String?
  noIndex          Boolean @default(false)
  noFollow         Boolean @default(false)

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
}
```

---

## Media Models

### Media

Uploaded files.

```prisma
model Media {
  id           String   @id @default(cuid())
  filename     String
  originalName String
  mimeType     String
  size         Int
  width        Int?
  height       Int?
  url          String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  folderId String?
  folder   MediaFolder? @relation(fields: [folderId], references: [id])
}
```

### MediaFolder

Folder organization for media.

```prisma
model MediaFolder {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Self-referential for hierarchy
  parentId String?
  parent   MediaFolder?  @relation("FolderHierarchy", fields: [parentId], references: [id])
  children MediaFolder[] @relation("FolderHierarchy")

  media Media[]
}
```

---

## Subscription Models

### Plan

Pricing plans.

```prisma
model Plan {
  id           String     @id @default(cuid())
  name         String
  description  String?
  priceMonthly Decimal    @db.Decimal(10, 2)
  priceYearly  Decimal    @db.Decimal(10, 2)
  features     Json       @default("{}")
  trialDays    Int        @default(0)
  status       PlanStatus @default(ACTIVE)
  sortOrder    Int        @default(0)
  isPopular    Boolean    @default(false)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  subscriptions Subscription[]
}
```

### Subscription

User subscriptions.

```prisma
model Subscription {
  id                 String             @id @default(cuid())
  status             SubscriptionStatus @default(ACTIVE)
  billingPeriod      BillingPeriod      @default(MONTHLY)
  currentPeriodStart DateTime           @default(now())
  currentPeriodEnd   DateTime
  trialStart         DateTime?
  trialEnd           DateTime?
  canceledAt         DateTime?
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  userId String
  user   User   @relation(fields: [userId], references: [id])
  planId String
  plan   Plan   @relation(fields: [planId], references: [id])
}
```

---

## System Models

### Setting

Key-value configuration store.

```prisma
model Setting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String   @db.Text
  group     String   @default("general")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Redirect

URL redirects.

```prisma
model Redirect {
  id          String   @id @default(cuid())
  source      String   @unique
  destination String
  statusCode  Int      @default(301)
  hits        Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### ActivityLog

User activity audit trail.

```prisma
model ActivityLog {
  id        String   @id @default(cuid())
  action    String
  entity    String
  entityId  String?
  metadata  Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  userId String?
  user   User?   @relation(fields: [userId], references: [id])
}
```

---

## Notification Models

### Notification

User notifications.

```prisma
model Notification {
  id        String               @id @default(cuid())
  title     String
  message   String
  type      NotificationType     @default(INFO)
  category  NotificationCategory @default(SYSTEM)
  read      Boolean              @default(false)
  link      String?
  createdAt DateTime             @default(now())

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### NotificationPreference

User notification settings.

```prisma
model NotificationPreference {
  id       String               @id @default(cuid())
  category NotificationCategory
  email    Boolean              @default(true)
  push     Boolean              @default(true)
  inApp    Boolean              @default(true)

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, category])
}
```

---

## Email Models

### EmailTemplate

Email templates.

```prisma
model EmailTemplate {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  subject     String
  htmlContent String   @db.LongText
  textContent String?  @db.LongText
  variables   Json     @default("{}")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  emailLogs EmailLog[]
}
```

### EmailLog

Email delivery logs.

```prisma
model EmailLog {
  id          String         @id @default(cuid())
  to          String
  subject     String
  htmlContent String?        @db.LongText
  textContent String?        @db.LongText
  status      EmailLogStatus @default(PENDING)
  error       String?
  sentAt      DateTime?
  retryCount  Int            @default(0)
  createdAt   DateTime       @default(now())

  templateId String?
  template   EmailTemplate? @relation(fields: [templateId], references: [id])
}
```

---

## Analytics Models

### PageView

Page view tracking.

```prisma
model PageView {
  id        String   @id @default(cuid())
  path      String
  sessionId String?
  referrer  String?
  userAgent String?
  createdAt DateTime @default(now())

  userId String?
  user   User?   @relation(fields: [userId], references: [id])
}
```

---

## Backup Model

### Backup

Database backups.

```prisma
model Backup {
  id          String       @id @default(cuid())
  filename    String
  size        Int
  status      BackupStatus @default(PENDING)
  tables      Json         @default("[]")
  recordCount Int          @default(0)
  error       String?
  createdAt   DateTime     @default(now())
}
```

---

## Enums

### PostStatus

```prisma
enum PostStatus {
  DRAFT
  PUBLISHED
  SCHEDULED
  ARCHIVED
}
```

### PlanStatus

```prisma
enum PlanStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}
```

### SubscriptionStatus

```prisma
enum SubscriptionStatus {
  TRIALING
  ACTIVE
  PAST_DUE
  CANCELED
  EXPIRED
}
```

### BillingPeriod

```prisma
enum BillingPeriod {
  MONTHLY
  YEARLY
}
```

### NotificationType

```prisma
enum NotificationType {
  INFO
  SUCCESS
  WARNING
  ERROR
}
```

### NotificationCategory

```prisma
enum NotificationCategory {
  SYSTEM
  POST
  USER
  SUBSCRIPTION
  SECURITY
  COMMENT
}
```

### EmailLogStatus

```prisma
enum EmailLogStatus {
  PENDING
  SENT
  FAILED
  BOUNCED
}
```

### BackupStatus

```prisma
enum BackupStatus {
  PENDING
  COMPLETED
  FAILED
}
```

---

## Database Commands

### Generate Prisma Client

```bash
npx prisma generate
```

### Create Migration

```bash
npx prisma migrate dev --name migration_name
```

### Apply Migrations

```bash
npx prisma migrate deploy
```

### Reset Database

```bash
npx prisma migrate reset
```

### Open Prisma Studio

```bash
npx prisma studio
```

### Seed Database

```bash
npx prisma db seed
```

---

## Indexes

Key indexes for performance:

```prisma
@@index([userId])           // On tables with userId
@@index([createdAt])        // For sorting by date
@@index([status])           // For filtering by status
@@index([slug])             // Already unique, indexed
@@index([email])            // Already unique, indexed
```

---

## Related Documentation

- [API Reference](../api/endpoints.md)
- [Configuration](../configuration.md)
- [Getting Started](../getting-started.md)
