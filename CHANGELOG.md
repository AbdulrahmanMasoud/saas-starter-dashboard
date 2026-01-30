# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-30

### Added

#### Authentication & Authorization
- NextAuth.js 5 integration with Credentials provider
- JWT-based session strategy
- Role-based access control (RBAC) with 55+ granular permissions
- Password reset flow with email verification
- Session management and activity tracking

#### User Management
- Complete user CRUD operations
- 4 default roles: Admin, Editor, Author, User
- Custom role creation with permission assignment
- User activity logging with IP and user agent tracking

#### Content Management
- Posts with multiple statuses: Draft, Published, Scheduled, Archived
- Rich text editor powered by TipTap
- Hierarchical categories with parent-child relationships
- Tags with optional color coding
- SEO metadata per post (meta titles, descriptions, OG tags, Twitter cards)
- URL slug management with uniqueness validation

#### Media Library
- File upload system with disk storage (`/public/uploads`)
- Hierarchical folder organization
- File metadata tracking (size, dimensions, type)
- Supported formats: images (JPG, PNG, GIF, WebP), documents (PDF, DOC, DOCX)

#### Subscription System
- Pricing plans with monthly and yearly billing
- Feature limits stored as JSON
- Trial period support
- Subscription statuses: Trialing, Active, Past Due, Canceled, Expired
- User subscription management

#### Email System
- Template-based email sending with Nodemailer
- Variable substitution in templates (e.g., `{{name}}`, `{{link}}`)
- HTML and plain text support
- Email delivery logs with status tracking
- Failed email retry capability
- SMTP configuration via settings

#### Notifications
- Real-time notification system
- Notification types: Info, Success, Warning, Error
- Categories: System, Post, User, Subscription, Security, Comment
- User notification preferences
- Mark as read functionality

#### Settings Management
- Grouped settings: General, Appearance, Security, Email, Notifications, Integrations
- Key-value configuration store
- Site name, tagline, and description
- Theme customization (dark/light mode)
- Logo and branding settings

#### Analytics Dashboard
- Dashboard overview with stats cards
- Charts powered by Recharts (Area, Line, Bar, Pie)
- Page view tracking
- Activity feed widget
- Session analytics

#### System Features
- URL redirects with 301/302 status codes
- Full database backup to JSON
- Backup restore capability
- Global search (Cmd+K)
- Activity logging with audit trail

#### UI/UX
- 30+ reusable UI components (shadcn/ui + Radix UI)
- Dark mode support via next-themes
- Responsive design
- Data tables with sorting, filtering, and pagination
- Toast notifications via Sonner
- Command palette for quick navigation

#### Developer Experience
- TypeScript throughout
- Zod validation schemas
- Prisma ORM with MySQL
- ESLint configuration
- Well-organized project structure

### Technical Details
- Next.js 16.1.6 with App Router
- React 19.2.3
- Prisma 6.19.2
- NextAuth 5.0.0-beta.30
- Tailwind CSS 4
- TipTap 3.18.0
- Recharts 3.7.0
- TanStack Table 8.21.3

---

## Future Releases

### Planned for v1.1.0
- Two-factor authentication (2FA)
- OAuth providers (Google, GitHub)
- Advanced analytics dashboard
- Bulk operations for content
- API rate limiting

### Planned for v1.2.0
- Multi-tenancy support
- Webhook integrations
- Advanced search with filters
- Import/Export functionality
- Audit log improvements
