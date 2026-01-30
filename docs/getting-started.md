# Getting Started

This guide will help you set up the Taqnihub Fullstack Starter Dashboard on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Minimum Version | Recommended |
|-------------|-----------------|-------------|
| Node.js | 18.0.0 | 20.x LTS |
| MySQL | 8.0 | 8.0+ |
| npm/pnpm/yarn | npm 9+ | pnpm 8+ |
| Git | 2.30+ | Latest |

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/taqnihub/dashboard-starter.git
cd dashboard-starter
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using pnpm (recommended):
```bash
pnpm install
```

Using yarn:
```bash
yarn install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and configure the required variables:

```env
# Database (Required)
DATABASE_URL="mysql://username:password@localhost:3306/dashboard_db"

# NextAuth (Required)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"

# Email (Optional - for email features)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-email-password"
SMTP_FROM="noreply@example.com"
```

> **Tip:** Generate a secure `NEXTAUTH_SECRET` using:
> ```bash
> openssl rand -base64 32
> ```

### 4. Database Setup

Create your MySQL database:

```sql
CREATE DATABASE dashboard_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Run Prisma migrations:

```bash
npx prisma migrate dev
```

This will:
- Create all database tables
- Set up relationships and indexes
- Generate the Prisma Client

### 5. Seed the Database (Optional)

Populate the database with sample data:

```bash
npx prisma db seed
```

This creates:
- Default admin user
- Sample roles and permissions
- Example posts and categories
- Demo subscription plans

### 6. Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Default Credentials

After seeding, use these credentials to log in:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Editor | editor@example.com | editor123 |
| Author | author@example.com | author123 |
| User | user@example.com | user123 |

> **Important:** Change these passwords immediately in production!

## First-Time Setup Checklist

After logging in as admin, complete these steps:

- [ ] **Change admin password** - Go to Profile > Change Password
- [ ] **Configure site settings** - Settings > General
- [ ] **Set up email** - Settings > Email (for password reset, notifications)
- [ ] **Customize appearance** - Settings > Appearance
- [ ] **Review roles** - Users > Roles (adjust permissions as needed)
- [ ] **Create categories** - Content > Categories
- [ ] **Set up subscription plans** - Subscriptions > Plans (if using subscriptions)

## Project Structure Overview

```
dashboard-starter/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeder
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── (auth)/        # Auth pages (login, register, etc.)
│   │   └── (dashboard)/   # Dashboard pages
│   ├── components/
│   │   ├── ui/            # Base UI components
│   │   ├── dashboard/     # Dashboard components
│   │   └── auth/          # Auth forms
│   ├── lib/
│   │   ├── validations/   # Zod schemas
│   │   ├── email/         # Email service
│   │   └── hooks/         # React hooks
│   └── auth.ts            # NextAuth configuration
├── public/
│   └── uploads/           # Media uploads directory
├── docs/                  # Documentation
└── .env.example           # Environment template
```

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma database browser |
| `npx prisma migrate dev` | Run database migrations |
| `npx prisma db seed` | Seed the database |
| `npx prisma generate` | Regenerate Prisma Client |

## Troubleshooting

### Database Connection Issues

**Error:** `Can't reach database server`

1. Verify MySQL is running
2. Check your `DATABASE_URL` format
3. Ensure the database exists
4. Verify user permissions

### Migration Errors

**Error:** `Migration failed`

1. Check for pending migrations: `npx prisma migrate status`
2. Reset database (development only): `npx prisma migrate reset`
3. Review migration files in `prisma/migrations/`

### Authentication Issues

**Error:** `NEXTAUTH_SECRET` missing

1. Ensure `.env` file exists
2. Generate a new secret: `openssl rand -base64 32`
3. Restart the development server

### Port Already in Use

**Error:** `Port 3000 is already in use`

Run on a different port:
```bash
npm run dev -- -p 3001
```

## Next Steps

- [Configuration Guide](configuration.md) - Detailed environment and settings reference
- [Authentication](features/authentication.md) - Understanding the auth system
- [API Reference](api/endpoints.md) - Available API endpoints
- [Deployment](deployment.md) - Production deployment guide

## Getting Help

- Check the [documentation](.)
- Search [GitHub Issues](https://github.com/taqnihub/dashboard-starter/issues)
- Ask in [Discussions](https://github.com/taqnihub/dashboard-starter/discussions)
