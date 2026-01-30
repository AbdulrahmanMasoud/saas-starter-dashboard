# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database (no migration)
npm run db:migrate   # Create and apply migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio GUI
npm run db:reset     # Reset database and reapply migrations
```

## Architecture

### Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Database:** MySQL + Prisma 6
- **Auth:** NextAuth.js v5 (JWT strategy)
- **UI:** shadcn/ui + Radix UI + Tailwind CSS 4
- **Forms:** React Hook Form + Zod
- **State:** Zustand (client state)

### Route Structure
- `src/app/(auth)/` - Public auth pages (login, register, forgot-password)
- `src/app/(dashboard)/dashboard/` - Protected dashboard pages
- `src/app/api/` - API routes (38 endpoints)

### Key Patterns

**Authentication & Permissions:**
- Auth config in `src/auth.ts` using NextAuth with Prisma adapter
- JWT tokens include `id`, `role`, and `permissions` array
- Permissions defined in `src/config/permissions.ts` (PERMISSIONS constant)
- Check permissions via `session.user.permissions.includes("permission.key")`
- Default roles: Admin (all permissions), Editor, Author, User

**API Routes:**
- All routes require auth: `const session = await auth()`
- Return 401 for unauthenticated, 403 for unauthorized
- Use `logActivity()` from `src/lib/activity.ts` for audit logging
- Validation with Zod schemas from `src/lib/validations/`

**Database:**
- Prisma client singleton in `src/lib/db.ts`
- Schema in `prisma/schema.prisma` (23 models)
- Key models: User, Role, Post, Category, Tag, Media, Plan, Subscription, Setting, EmailTemplate

**Settings System:**
- Key-value store in `Setting` model with `group` field
- Get settings: `getSettings()` / `getSetting()` from `src/lib/settings.ts`
- Groups: general, appearance, security, email, notifications, integrations

**Navigation:**
- Sidebar config in `src/config/navigation.ts`
- Each nav item can have `permission` for visibility control

**Stores (Zustand):**
- `src/stores/sidebar-store.ts` - Sidebar collapse state
- `src/stores/notification-store.ts` - Notification state

### File Conventions
- API routes: `src/app/api/[resource]/route.ts` (GET, POST) and `[resource]/[id]/route.ts` (GET, PUT, DELETE)
- Dashboard pages: `src/app/(dashboard)/dashboard/[feature]/page.tsx`
- UI components: `src/components/ui/` (shadcn/ui)
- Feature components: `src/components/dashboard/`
- Zod schemas: `src/lib/validations/[entity].ts`

### Environment Variables
Required in `.env`:
```
DATABASE_URL="mysql://user:pass@localhost:3306/database"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="min-32-characters"
```

Optional for email:
```
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
```
