# Analytics

The analytics system provides dashboard insights, activity tracking, and page view monitoring.

## Overview

- **Dashboard Stats:** Key metrics at a glance
- **Charts:** Visual data representation
- **Activity Logging:** Complete audit trail
- **Page View Tracking:** User engagement metrics

## Dashboard Overview

### Stats Cards

The dashboard displays key metrics in card format:

| Metric | Description |
|--------|-------------|
| Total Users | Number of registered users |
| Total Posts | Published and draft posts |
| Active Subscriptions | Current active subscriptions |
| Page Views | Views in selected period |
| Revenue | Subscription revenue (if applicable) |
| New Users | Users registered in period |

### Stats Card Component

```typescript
<StatsCard
  title="Total Users"
  value={1234}
  change={+12.5}
  changeLabel="vs last month"
  icon={Users}
/>
```

## Charts

### Chart Types

The dashboard uses Recharts for visualizations:

| Chart | Use Case |
|-------|----------|
| Area Chart | Trends over time (page views, users) |
| Line Chart | Comparative trends |
| Bar Chart | Category comparisons |
| Pie Chart | Distribution (plans, categories) |

### Area Chart Example

```typescript
import { AreaChart } from "@/components/dashboard/charts";

<AreaChart
  data={pageViewData}
  xKey="date"
  yKey="views"
  title="Page Views"
/>
```

### Chart Data Format

```typescript
const pageViewData = [
  { date: "2025-01-01", views: 1200 },
  { date: "2025-01-02", views: 1350 },
  { date: "2025-01-03", views: 980 },
  // ...
];
```

## Activity Logging

### Activity Log Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier |
| `action` | String | Action performed |
| `entity` | String | Entity type |
| `entityId` | String | Entity identifier |
| `userId` | String | User who performed action |
| `metadata` | JSON | Additional context |
| `ipAddress` | String | User's IP address |
| `userAgent` | String | Browser/client info |
| `createdAt` | DateTime | Timestamp |

### Logged Actions

**User Actions:**
- `user.login` - User logged in
- `user.logout` - User logged out
- `user.created` - New user created
- `user.updated` - User details updated
- `user.deleted` - User deleted
- `user.password_changed` - Password changed

**Content Actions:**
- `post.created` - Post created
- `post.updated` - Post updated
- `post.published` - Post published
- `post.deleted` - Post deleted

**System Actions:**
- `settings.updated` - Settings changed
- `backup.created` - Backup created
- `backup.restored` - Backup restored

### Logging Activity

```typescript
import { logActivity } from "@/lib/activity";

await logActivity({
  action: "post.created",
  entity: "post",
  entityId: post.id,
  userId: session.user.id,
  metadata: {
    title: post.title,
    status: post.status
  }
});
```

### Activity Log API

```typescript
// GET /api/activity

{
  "data": [
    {
      "id": "activity-id",
      "action": "post.published",
      "entity": "post",
      "entityId": "post-id",
      "user": {
        "id": "user-id",
        "name": "John Doe"
      },
      "metadata": {
        "title": "My First Post"
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-01-30T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### Filtering Activity

```typescript
// GET /api/activity?userId=123&entity=post&action=post.published&startDate=2025-01-01

// Parameters:
// - userId: Filter by user
// - entity: Filter by entity type (user, post, etc.)
// - action: Filter by specific action
// - startDate: Filter from date
// - endDate: Filter to date
// - page, limit: Pagination
```

## Page View Tracking

### PageView Model

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier |
| `path` | String | Page URL path |
| `sessionId` | String | Session identifier |
| `referrer` | String | Referrer URL |
| `userAgent` | String | Browser info |
| `userId` | String | Logged in user (optional) |
| `createdAt` | DateTime | View timestamp |

### Tracking Component

```typescript
// src/components/analytics/page-tracker.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view
    fetch("/api/analytics/track", {
      method: "POST",
      body: JSON.stringify({ path: pathname }),
    });
  }, [pathname]);

  return null;
}
```

### Track Page View API

```typescript
// POST /api/analytics/track
{
  "path": "/dashboard/posts"
}
```

### Page View Analytics

```typescript
// GET /api/analytics/page-views?period=7d

{
  "summary": {
    "totalViews": 5432,
    "uniqueVisitors": 1234,
    "averagePerDay": 776
  },
  "byDay": [
    { "date": "2025-01-24", "views": 678 },
    { "date": "2025-01-25", "views": 892 },
    // ...
  ],
  "topPages": [
    { "path": "/dashboard", "views": 1200 },
    { "path": "/dashboard/posts", "views": 890 },
    // ...
  ]
}
```

## Recent Activity Widget

### Component Usage

```typescript
import { RecentActivity } from "@/components/dashboard/recent-activity";

<RecentActivity limit={10} />
```

### Widget Display

Shows recent activity in a feed format:
- User avatar
- Action description
- Relative timestamp
- Link to entity

## Dashboard Analytics Helpers

### Helper Functions

```typescript
// src/lib/dashboard/analytics.ts

// Get user growth data
export async function getUserGrowth(period: "7d" | "30d" | "90d") {
  // Returns daily new user counts
}

// Get post statistics
export async function getPostStats() {
  // Returns posts by status counts
}

// Get subscription metrics
export async function getSubscriptionMetrics() {
  // Returns MRR, churn, growth
}

// Get page view trends
export async function getPageViewTrends(period: string) {
  // Returns page view data for charts
}
```

### Dashboard Data Aggregation

```typescript
// Example: Dashboard page data fetching
export default async function DashboardPage() {
  const [
    userStats,
    postStats,
    subscriptionStats,
    recentActivity,
    pageViewTrends
  ] = await Promise.all([
    getUserStats(),
    getPostStats(),
    getSubscriptionStats(),
    getRecentActivity(10),
    getPageViewTrends("30d")
  ]);

  return (
    <div>
      <StatsCards data={{ userStats, postStats, subscriptionStats }} />
      <Charts data={pageViewTrends} />
      <RecentActivity data={recentActivity} />
    </div>
  );
}
```

## Metrics Calculations

### User Metrics

```typescript
// Total users
const totalUsers = await db.user.count();

// New users this month
const newUsersThisMonth = await db.user.count({
  where: {
    createdAt: {
      gte: startOfMonth(new Date())
    }
  }
});

// Active users (last 30 days)
const activeUsers = await db.user.count({
  where: {
    lastActiveAt: {
      gte: subDays(new Date(), 30)
    }
  }
});
```

### Content Metrics

```typescript
// Posts by status
const postsByStatus = await db.post.groupBy({
  by: ["status"],
  _count: true
});

// Posts this month
const postsThisMonth = await db.post.count({
  where: {
    createdAt: {
      gte: startOfMonth(new Date())
    }
  }
});
```

### Subscription Metrics

```typescript
// Active subscriptions
const activeSubscriptions = await db.subscription.count({
  where: {
    status: "ACTIVE"
  }
});

// Monthly Recurring Revenue (MRR)
const mrr = await db.subscription.aggregate({
  where: {
    status: "ACTIVE",
    billingPeriod: "MONTHLY"
  },
  _sum: {
    // Sum of plan monthly prices
  }
});
```

## Third-Party Analytics

### Google Analytics

Add GA tracking ID in settings:

```typescript
// Settings: google_analytics_id = "G-XXXXXXXXXX"
```

Script is injected in layout:

```typescript
{googleAnalyticsId && (
  <>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} />
    <Script id="google-analytics">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${googleAnalyticsId}');
      `}
    </Script>
  </>
)}
```

### Facebook Pixel

Configure via settings:

```typescript
// Settings: facebook_pixel_id = "123456789"
```

## Permissions

| Permission | Description |
|------------|-------------|
| `analytics.view` | View analytics dashboard |
| `activity.view` | View activity logs |

## Data Retention

### Default Retention

| Data Type | Retention |
|-----------|-----------|
| Page Views | 90 days |
| Activity Logs | 1 year |
| Aggregated Stats | Indefinite |

### Cleanup Jobs

Implement scheduled cleanup for old data:

```typescript
// Clean old page views
await db.pageView.deleteMany({
  where: {
    createdAt: {
      lt: subDays(new Date(), 90)
    }
  }
});
```

## Related Documentation

- [Settings](settings.md)
- [User Management](user-management.md)
- [API Reference](../api/endpoints.md)
