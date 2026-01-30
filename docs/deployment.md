# Deployment

This guide covers deploying the Taqnihub Fullstack Starter Dashboard to production.

## Overview

- **Recommended Platform:** Vercel
- **Database:** MySQL (PlanetScale, Railway, AWS RDS)
- **File Storage:** Local or cloud (S3, Cloudflare R2)

---

## Vercel Deployment

### Prerequisites

1. GitHub account with repository access
2. Vercel account (free tier available)
3. MySQL database (production-ready)

### Step 1: Prepare Repository

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the repository

### Step 3: Configure Environment Variables

Add these environment variables in Vercel:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your production MySQL URL |
| `NEXTAUTH_URL` | Your production URL (e.g., https://myapp.com) |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `SMTP_HOST` | SMTP server (optional) |
| `SMTP_PORT` | SMTP port (optional) |
| `SMTP_USER` | SMTP username (optional) |
| `SMTP_PASSWORD` | SMTP password (optional) |
| `SMTP_FROM` | Sender email (optional) |

### Step 4: Configure Build Settings

Vercel auto-detects Next.js. Verify settings:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (or `pnpm build`)
- **Output Directory:** `.next`
- **Install Command:** `npm install` (or `pnpm install`)

### Step 5: Add Build Hook for Prisma

In `package.json`, ensure postinstall runs Prisma generate:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Step 6: Deploy

Click "Deploy" and wait for the build to complete.

### Step 7: Run Database Migrations

After first deployment, run migrations:

```bash
# Local machine with production DATABASE_URL
DATABASE_URL="production-url" npx prisma migrate deploy
```

Or use Vercel CLI:

```bash
vercel env pull .env.production
npx prisma migrate deploy
```

---

## Database Setup

### PlanetScale (Recommended)

1. Create account at [planetscale.com](https://planetscale.com)
2. Create new database
3. Get connection string from dashboard

**Connection String Format:**
```
mysql://username:password@host.planetscale.com/database?ssl={"rejectUnauthorized":true}
```

**Prisma Configuration:**
```prisma
datasource db {
  provider     = "mysql"
  url          = env("DATABASE_URL")
  relationMode = "prisma" // Required for PlanetScale
}
```

### Railway

1. Create account at [railway.app](https://railway.app)
2. Create MySQL database
3. Copy connection string

### AWS RDS

1. Create RDS MySQL instance
2. Configure security groups for access
3. Use connection string:
```
mysql://user:password@instance.region.rds.amazonaws.com:3306/database
```

---

## Environment Configuration

### Production Environment Variables

```env
# Database
DATABASE_URL="mysql://user:pass@host:3306/database"

# Authentication
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generated-secret-min-32-chars"

# Email (Production SMTP)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
SMTP_FROM="noreply@yourdomain.com"

# Optional
NODE_ENV="production"
```

### Generating Secrets

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32
```

---

## Custom Domain

### Vercel Domain Setup

1. Go to Project Settings > Domains
2. Add your domain
3. Configure DNS records:

**For apex domain (example.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For subdomain (www.example.com):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### SSL/HTTPS

Vercel provides automatic SSL certificates via Let's Encrypt.

---

## Database Migrations

### Running Migrations in Production

```bash
# Set production DATABASE_URL
export DATABASE_URL="production-connection-string"

# Run migrations
npx prisma migrate deploy
```

### Migration Checklist

- [ ] Backup production database before migrations
- [ ] Test migrations on staging first
- [ ] Have rollback plan ready
- [ ] Monitor for errors after deployment

---

## File Uploads

### Local Storage (Default)

Files are stored in `/public/uploads/`. For Vercel:

- Limited to 4.5MB per file (Vercel limit)
- Files persist between deployments
- Consider cloud storage for production

### Cloud Storage Options

**AWS S3:**

```typescript
// Example: Configure S3 upload
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
```

**Cloudflare R2:**

- S3-compatible API
- No egress fees
- Use with AWS SDK

**Uploadthing:**

- Easy file uploads
- Free tier available
- Next.js integration

---

## Performance Optimization

### Caching

Enable caching headers for static assets:

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### Image Optimization

Use Next.js Image component:

```typescript
import Image from "next/image";

<Image
  src="/uploads/image.jpg"
  width={800}
  height={600}
  alt="Description"
/>
```

### Database Optimization

- Enable connection pooling
- Add database indexes
- Use Prisma query batching

```prisma
// Add indexes
@@index([createdAt])
@@index([status])
```

---

## Monitoring

### Vercel Analytics

Enable in Vercel dashboard:
1. Go to Analytics tab
2. Enable Web Analytics
3. View performance metrics

### Error Tracking

**Sentry Integration:**

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```

### Logging

Use Vercel's built-in logging:
- View in Vercel dashboard
- Filter by function/route
- Set up alerts

---

## Scaling

### Vercel Scaling

- Automatic scaling included
- Edge functions for performance
- Global CDN distribution

### Database Scaling

**PlanetScale:**
- Automatic scaling
- Read replicas available
- Branching for safe migrations

**Connection Pooling:**

```env
# Add connection pool parameters
DATABASE_URL="mysql://user:pass@host:3306/db?connection_limit=10"
```

---

## Security Checklist

### Pre-Deployment

- [ ] Change default admin password
- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Configure CORS if needed
- [ ] Review environment variables
- [ ] Remove debug logging

### Post-Deployment

- [ ] Verify HTTPS is active
- [ ] Test authentication flow
- [ ] Check database connectivity
- [ ] Verify email sending
- [ ] Test all critical features

### Security Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## Troubleshooting

### Build Failures

**Prisma Client not generated:**
```bash
# Add to package.json scripts
"postinstall": "prisma generate"
```

**Environment variables missing:**
- Check Vercel environment settings
- Ensure no typos in variable names
- Redeploy after adding variables

### Database Connection Issues

**Connection refused:**
- Check IP allowlist on database
- Verify connection string format
- Check SSL requirements

**Too many connections:**
- Enable connection pooling
- Reduce connection limit
- Use serverless-friendly database

### Runtime Errors

**Check Vercel logs:**
1. Go to Deployments
2. Select deployment
3. View "Functions" tab
4. Check individual function logs

---

## Backup Strategy

### Database Backups

**Automated backups:**
- Enable on your database provider
- Set retention period (30+ days)
- Test restore process

**Manual backups:**
```bash
# Export using application backup feature
# Or use mysqldump
mysqldump -h host -u user -p database > backup.sql
```

### Code Backups

- Git repository is your code backup
- Tag releases for easy rollback
- Keep deployment history in Vercel

---

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Related Documentation

- [Getting Started](getting-started.md)
- [Configuration](configuration.md)
- [Database Schema](database/schema.md)
