# Taqnihub Fullstack Starter Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC)](https://tailwindcss.com/)

A production-ready, full-featured dashboard starter built with Next.js 16, Prisma, and MySQL. Perfect for SaaS applications, admin panels, and content management systems.

![Dashboard Preview](docs/assets/dashboard-preview.png)

## Features

- **Authentication & Authorization** - NextAuth.js with JWT sessions, role-based access control (RBAC), and 55+ granular permissions
- **User Management** - Complete user CRUD with roles, permissions, and activity tracking
- **Content Management** - Posts with categories, tags, rich text editor (TipTap), and SEO metadata
- **Media Library** - File uploads with folder organization and metadata tracking
- **Subscription System** - Pricing plans, billing periods, trial support, and subscription management
- **Email System** - Template-based emails with variable substitution, SMTP configuration, and delivery logs
- **Notifications** - Real-time notifications with user preferences and multiple categories
- **Settings Management** - Grouped settings for site configuration, appearance, security, and integrations
- **Analytics Dashboard** - Stats cards, charts (Recharts), activity logs, and page view tracking
- **Backup & Restore** - Full database backup to JSON with restore capability

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Database | [MySQL 8](https://www.mysql.com/) + [Prisma 6](https://www.prisma.io/) |
| Authentication | [NextAuth.js 5](https://next-auth.js.org/) (Beta) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Rich Text | [TipTap](https://tiptap.dev/) |
| Charts | [Recharts](https://recharts.org/) |
| Data Tables | [TanStack Table](https://tanstack.com/table) |
| Email | [Nodemailer](https://nodemailer.com/) |
| State | [Zustand](https://zustand-demo.pmnd.rs/) |

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8+
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/taqnihub/dashboard-starter.git
cd dashboard-starter

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your database URL in .env
# DATABASE_URL="mysql://user:password@localhost:3306/dashboard"

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Editor | editor@example.com | editor123 |

## Documentation

- [Getting Started](docs/getting-started.md) - Installation and setup guide
- [Configuration](docs/configuration.md) - Environment variables and settings
- [Features](docs/features/) - Detailed feature documentation
  - [Authentication](docs/features/authentication.md)
  - [Content Management](docs/features/content-management.md)
  - [Media Library](docs/features/media-library.md)
  - [User Management](docs/features/user-management.md)
  - [Subscriptions](docs/features/subscriptions.md)
  - [Email System](docs/features/email-system.md)
  - [Settings](docs/features/settings.md)
  - [Analytics](docs/features/analytics.md)
- [API Reference](docs/api/endpoints.md) - Complete API documentation
- [Database Schema](docs/database/schema.md) - Prisma models and relationships
- [UI Components](docs/components/ui-components.md) - Component library guide
- [Deployment](docs/deployment.md) - Production deployment guide

## Project Structure

```
├── prisma/
│   └── schema.prisma        # Database schema (23 models)
├── src/
│   ├── app/
│   │   ├── api/             # API routes (38 endpoints)
│   │   ├── (dashboard)/     # Dashboard pages
│   │   └── (auth)/          # Auth pages
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── dashboard/       # Dashboard components
│   │   └── auth/            # Auth forms
│   ├── lib/
│   │   ├── validations/     # Zod schemas
│   │   ├── email/           # Email service
│   │   └── hooks/           # Custom hooks
│   └── auth.ts              # NextAuth configuration
├── public/
│   └── uploads/             # Media uploads
└── docs/                    # Documentation
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- [GitHub Issues](https://github.com/taqnihub/dashboard-starter/issues) - Bug reports and feature requests
- [Discussions](https://github.com/taqnihub/dashboard-starter/discussions) - Questions and community support

---

Built with care by [Taqnihub](https://taqnihub.com)
