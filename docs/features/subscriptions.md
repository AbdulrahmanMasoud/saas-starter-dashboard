# Subscriptions

The subscription system provides complete management for pricing plans, billing periods, trial support, and user subscriptions.

## Overview

- **Plans:** Multiple pricing tiers with feature limits
- **Billing:** Monthly and yearly billing periods
- **Trials:** Configurable trial periods
- **Status Tracking:** Full subscription lifecycle management

## Plans

### Plan Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier |
| `name` | String | Plan name (e.g., "Pro", "Enterprise") |
| `description` | String | Plan description |
| `priceMonthly` | Decimal | Monthly price |
| `priceYearly` | Decimal | Yearly price |
| `features` | JSON | Feature limits and flags |
| `trialDays` | Int | Trial period in days |
| `status` | Enum | ACTIVE, INACTIVE, ARCHIVED |
| `sortOrder` | Int | Display order |
| `isPopular` | Boolean | Highlight as popular choice |
| `createdAt` | DateTime | Creation date |
| `updatedAt` | DateTime | Last update |

### Plan Statuses

| Status | Description |
|--------|-------------|
| `ACTIVE` | Available for new subscriptions |
| `INACTIVE` | Hidden but existing subscriptions honored |
| `ARCHIVED` | Fully deprecated, read-only |

### Creating Plans

```typescript
// POST /api/plans
{
  "name": "Pro",
  "description": "Perfect for growing businesses",
  "priceMonthly": 29.99,
  "priceYearly": 299.99,
  "features": {
    "maxUsers": 10,
    "maxPosts": 100,
    "maxStorage": "10GB",
    "analytics": true,
    "prioritySupport": true,
    "customBranding": false
  },
  "trialDays": 14,
  "status": "ACTIVE",
  "sortOrder": 2,
  "isPopular": true
}
```

### Feature Limits

Features are stored as JSON, allowing flexible configuration:

```json
{
  "maxUsers": 5,
  "maxPosts": 50,
  "maxStorage": "5GB",
  "maxMediaFiles": 100,
  "apiAccess": true,
  "analytics": false,
  "prioritySupport": false,
  "customBranding": false,
  "ssoEnabled": false,
  "whiteLabeling": false
}
```

### Updating Plans

```typescript
// PUT /api/plans/:id
{
  "priceMonthly": 34.99,
  "priceYearly": 349.99,
  "features": {
    // Updated features
  }
}
```

## Subscriptions

### Subscription Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier |
| `userId` | String | Subscribed user |
| `planId` | String | Associated plan |
| `status` | Enum | Subscription status |
| `billingPeriod` | Enum | MONTHLY or YEARLY |
| `currentPeriodStart` | DateTime | Current period start |
| `currentPeriodEnd` | DateTime | Current period end |
| `trialStart` | DateTime | Trial start date |
| `trialEnd` | DateTime | Trial end date |
| `canceledAt` | DateTime | Cancellation date |
| `createdAt` | DateTime | Creation date |
| `updatedAt` | DateTime | Last update |

### Subscription Statuses

| Status | Description |
|--------|-------------|
| `TRIALING` | In trial period |
| `ACTIVE` | Paid and active |
| `PAST_DUE` | Payment failed, grace period |
| `CANCELED` | User canceled, access until period end |
| `EXPIRED` | Subscription ended |

### Creating Subscriptions

```typescript
// POST /api/subscriptions
{
  "userId": "user-id",
  "planId": "plan-id",
  "billingPeriod": "MONTHLY"
}
```

If the plan has trial days, the subscription starts in `TRIALING` status.

### Subscription Response

```json
{
  "id": "subscription-id",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "plan": {
    "id": "plan-id",
    "name": "Pro",
    "priceMonthly": 29.99,
    "features": { ... }
  },
  "status": "ACTIVE",
  "billingPeriod": "MONTHLY",
  "currentPeriodStart": "2025-01-01T00:00:00Z",
  "currentPeriodEnd": "2025-02-01T00:00:00Z",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### Updating Subscriptions

```typescript
// PUT /api/subscriptions/:id
{
  "status": "ACTIVE",
  "planId": "new-plan-id",  // Upgrade/downgrade
  "billingPeriod": "YEARLY" // Switch billing cycle
}
```

### Canceling Subscriptions

```typescript
// DELETE /api/subscriptions/:id

// Sets status to CANCELED
// Access continues until currentPeriodEnd
```

## Trial Periods

### How Trials Work

1. Plan defines `trialDays` (e.g., 14 days)
2. New subscription starts with status `TRIALING`
3. `trialStart` and `trialEnd` dates are set
4. After trial ends, status changes to `ACTIVE` (with payment) or `EXPIRED`

### Trial Response

```json
{
  "status": "TRIALING",
  "trialStart": "2025-01-15T00:00:00Z",
  "trialEnd": "2025-01-29T00:00:00Z",
  "currentPeriodStart": "2025-01-29T00:00:00Z",
  "currentPeriodEnd": "2025-02-28T00:00:00Z"
}
```

### Checking Trial Status

```typescript
const isInTrial = subscription.status === "TRIALING";
const trialDaysLeft = differenceInDays(
  new Date(subscription.trialEnd),
  new Date()
);
```

## Billing Periods

### Monthly Billing

- Charged on same day each month
- `currentPeriodEnd` = start date + 1 month

### Yearly Billing

- Discounted rate (typically ~2 months free)
- `currentPeriodEnd` = start date + 1 year

### Switching Billing Periods

When switching from monthly to yearly (or vice versa):

```typescript
// PUT /api/subscriptions/:id
{
  "billingPeriod": "YEARLY"
}
```

The system can prorate or wait until current period ends based on your implementation.

## Subscription Lifecycle

```
[Create] → [TRIALING] → [ACTIVE] → [CANCELED] → [EXPIRED]
                ↓            ↓
          [EXPIRED]    [PAST_DUE] → [EXPIRED]
```

### State Transitions

| From | To | Trigger |
|------|-----|---------|
| - | TRIALING | New subscription with trial |
| - | ACTIVE | New subscription without trial |
| TRIALING | ACTIVE | Trial ends, payment successful |
| TRIALING | EXPIRED | Trial ends, no payment |
| ACTIVE | PAST_DUE | Payment failed |
| ACTIVE | CANCELED | User cancels |
| PAST_DUE | ACTIVE | Payment recovered |
| PAST_DUE | EXPIRED | Grace period ends |
| CANCELED | EXPIRED | Period ends |

## API Endpoints

### Plans

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/plans` | List all plans |
| POST | `/api/plans` | Create plan |
| GET | `/api/plans/:id` | Get plan details |
| PUT | `/api/plans/:id` | Update plan |
| DELETE | `/api/plans/:id` | Delete/archive plan |

### Subscriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscriptions` | List subscriptions |
| POST | `/api/subscriptions` | Create subscription |
| GET | `/api/subscriptions/:id` | Get subscription |
| PUT | `/api/subscriptions/:id` | Update subscription |
| DELETE | `/api/subscriptions/:id` | Cancel subscription |

## Query Parameters

### Filtering Plans

```typescript
// GET /api/plans?status=ACTIVE

// Parameters:
// - status: Filter by status
// - search: Search in name/description
```

### Filtering Subscriptions

```typescript
// GET /api/subscriptions?status=ACTIVE&planId=123&userId=456

// Parameters:
// - status: Filter by status
// - planId: Filter by plan
// - userId: Filter by user
// - billingPeriod: MONTHLY or YEARLY
// - page, limit: Pagination
```

## Feature Access Control

### Checking Feature Limits

```typescript
async function checkFeatureLimit(userId: string, feature: string) {
  const subscription = await getActiveSubscription(userId);

  if (!subscription) {
    return { allowed: false, reason: "No active subscription" };
  }

  const plan = subscription.plan;
  const limit = plan.features[feature];

  // Check if feature is enabled
  if (typeof limit === "boolean") {
    return { allowed: limit };
  }

  // Check numeric limits
  if (typeof limit === "number") {
    const currentUsage = await getCurrentUsage(userId, feature);
    return {
      allowed: currentUsage < limit,
      current: currentUsage,
      limit: limit,
    };
  }

  return { allowed: false };
}
```

### Usage Example

```typescript
// Check if user can create more posts
const check = await checkFeatureLimit(userId, "maxPosts");

if (!check.allowed) {
  return Response.json(
    { error: `Post limit reached (${check.limit})` },
    { status: 403 }
  );
}
```

## Permissions

| Permission | Description |
|------------|-------------|
| `plans.view` | View plans list |
| `plans.create` | Create new plans |
| `plans.edit` | Edit plan details |
| `plans.delete` | Delete/archive plans |
| `subscriptions.view` | View subscriptions |
| `subscriptions.create` | Create subscriptions |
| `subscriptions.edit` | Edit subscriptions |
| `subscriptions.cancel` | Cancel subscriptions |

## Integration Notes

### Payment Processing

This starter includes subscription management but not payment processing. To integrate payments:

1. **Stripe:** Use Stripe Subscriptions API
2. **Paddle:** Use Paddle subscriptions
3. **LemonSqueezy:** For digital products

Webhooks can update subscription status based on payment events.

### Webhook Events

Handle these events from your payment provider:

| Event | Action |
|-------|--------|
| `payment.successful` | Set status to ACTIVE |
| `payment.failed` | Set status to PAST_DUE |
| `subscription.canceled` | Set status to CANCELED |
| `trial.ending` | Send reminder email |

## Related Documentation

- [User Management](user-management.md)
- [Email System](email-system.md)
- [API Reference](../api/endpoints.md)
