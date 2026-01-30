import { db } from "@/lib/db"
import { subMonths, subDays, subHours, startOfMonth, endOfMonth, startOfDay, format } from "date-fns"

export async function getDashboardStats() {
  const now = new Date()
  const currentMonthStart = startOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  // Get counts in parallel
  const [
    totalUsers,
    totalPosts,
    totalSubscriptions,
    activeSubscriptions,
    usersThisMonth,
    usersLastMonth,
    postsThisMonth,
    postsLastMonth,
    subscriptionsThisMonth,
    subscriptionsLastMonth,
    revenue,
  ] = await Promise.all([
    // Total counts
    db.user.count(),
    db.post.count(),
    db.subscription.count(),
    db.subscription.count({ where: { status: "ACTIVE" } }),

    // Users this month
    db.user.count({
      where: { createdAt: { gte: currentMonthStart } },
    }),
    // Users last month
    db.user.count({
      where: {
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
    }),

    // Posts this month
    db.post.count({
      where: { createdAt: { gte: currentMonthStart } },
    }),
    // Posts last month
    db.post.count({
      where: {
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
    }),

    // Subscriptions this month
    db.subscription.count({
      where: { createdAt: { gte: currentMonthStart } },
    }),
    // Subscriptions last month
    db.subscription.count({
      where: {
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
    }),

    // Monthly recurring revenue (active subscriptions)
    db.subscription.findMany({
      where: { status: { in: ["ACTIVE", "TRIALING"] } },
      include: { plan: { select: { monthlyPrice: true, yearlyPrice: true } } },
    }),
  ])

  // Calculate MRR
  const mrr = revenue.reduce((acc, sub) => {
    const price =
      sub.billingPeriod === "YEARLY"
        ? Number(sub.plan.yearlyPrice) / 12
        : Number(sub.plan.monthlyPrice)
    return acc + price
  }, 0)

  // Calculate trends (percentage change)
  const usersTrend = usersLastMonth > 0
    ? Math.round(((usersThisMonth - usersLastMonth) / usersLastMonth) * 100)
    : usersThisMonth > 0 ? 100 : 0

  const postsTrend = postsLastMonth > 0
    ? Math.round(((postsThisMonth - postsLastMonth) / postsLastMonth) * 100)
    : postsThisMonth > 0 ? 100 : 0

  const subscriptionsTrend = subscriptionsLastMonth > 0
    ? Math.round(((subscriptionsThisMonth - subscriptionsLastMonth) / subscriptionsLastMonth) * 100)
    : subscriptionsThisMonth > 0 ? 100 : 0

  return {
    totalUsers,
    totalPosts,
    totalSubscriptions,
    activeSubscriptions,
    mrr,
    trends: {
      users: usersTrend,
      posts: postsTrend,
      subscriptions: subscriptionsTrend,
    },
  }
}

export async function getUserGrowthData() {
  const months = 6
  const data = []

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(new Date(), i)
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)

    const [newUsers, totalUsers] = await Promise.all([
      db.user.count({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd },
        },
      }),
      db.user.count({
        where: {
          createdAt: { lte: monthEnd },
        },
      }),
    ])

    data.push({
      month: format(date, "MMM"),
      newUsers,
      totalUsers,
    })
  }

  return data
}

export async function getSubscriptionTrends() {
  const months = 6
  const data = []

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(new Date(), i)
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)

    const [newSubscriptions, activeSubscriptions, revenue] = await Promise.all([
      db.subscription.count({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd },
        },
      }),
      db.subscription.count({
        where: {
          status: { in: ["ACTIVE", "TRIALING"] },
          createdAt: { lte: monthEnd },
        },
      }),
      db.subscription.findMany({
        where: {
          status: { in: ["ACTIVE", "TRIALING"] },
          createdAt: { lte: monthEnd },
        },
        include: { plan: { select: { monthlyPrice: true, yearlyPrice: true } } },
      }),
    ])

    const mrr = revenue.reduce((acc, sub) => {
      const price =
        sub.billingPeriod === "YEARLY"
          ? Number(sub.plan.yearlyPrice) / 12
          : Number(sub.plan.monthlyPrice)
      return acc + price
    }, 0)

    data.push({
      month: format(date, "MMM"),
      subscriptions: activeSubscriptions,
      revenue: Math.round(mrr),
    })
  }

  return data
}

export async function getPostsByCategory() {
  const categories = await db.category.findMany({
    include: {
      _count: { select: { posts: true } },
    },
    orderBy: { posts: { _count: "desc" } },
    take: 5,
  })

  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return categories.map((cat, index) => ({
    name: cat.name,
    value: cat._count.posts,
    color: colors[index % colors.length],
  }))
}

export async function getPostsByStatus() {
  const statuses = await db.post.groupBy({
    by: ["status"],
    _count: { status: true },
  })

  const colors: Record<string, string> = {
    DRAFT: "hsl(var(--chart-1))",
    PUBLISHED: "hsl(var(--chart-2))",
    SCHEDULED: "hsl(var(--chart-3))",
    ARCHIVED: "hsl(var(--chart-4))",
  }

  return statuses.map((s) => ({
    name: s.status.charAt(0) + s.status.slice(1).toLowerCase(),
    value: s._count.status,
    color: colors[s.status] || "hsl(var(--chart-5))",
  }))
}

export async function getRecentActivity(limit = 10) {
  const activities = await db.activityLog.findMany({
    include: {
      user: { select: { name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return activities.map((activity) => ({
    id: activity.id,
    user: {
      name: activity.user?.name || activity.user?.email || "System",
      image: activity.user?.image || undefined,
    },
    action: activity.action,
    entity: activity.entity,
    entityName: activity.description?.split("'")[1] || activity.entityId || undefined,
    createdAt: activity.createdAt,
  }))
}

export async function getPlanDistribution() {
  const plans = await db.plan.findMany({
    include: {
      _count: { select: { subscriptions: true } },
    },
    where: {
      subscriptions: { some: {} },
    },
    orderBy: { subscriptions: { _count: "desc" } },
  })

  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return plans.map((plan, index) => ({
    name: plan.name,
    value: plan._count.subscriptions,
    color: colors[index % colors.length],
  }))
}

export async function getVisitorStats() {
  const now = new Date()
  const today = startOfDay(now)
  const last24Hours = subHours(now, 24)
  const last7Days = subDays(now, 7)
  const last30Days = subDays(now, 30)

  const [
    totalPageViews,
    pageViewsToday,
    pageViews24h,
    pageViews7d,
    pageViews30d,
    uniqueVisitorsToday,
    uniqueVisitors24h,
    uniqueVisitors7d,
    uniqueVisitors30d,
  ] = await Promise.all([
    // Total page views
    db.pageView.count(),

    // Page views today
    db.pageView.count({
      where: { createdAt: { gte: today } },
    }),

    // Page views last 24 hours
    db.pageView.count({
      where: { createdAt: { gte: last24Hours } },
    }),

    // Page views last 7 days
    db.pageView.count({
      where: { createdAt: { gte: last7Days } },
    }),

    // Page views last 30 days
    db.pageView.count({
      where: { createdAt: { gte: last30Days } },
    }),

    // Unique visitors today (by sessionId)
    db.pageView.groupBy({
      by: ["sessionId"],
      where: {
        createdAt: { gte: today },
        sessionId: { not: null },
      },
    }).then(r => r.length),

    // Unique visitors last 24 hours
    db.pageView.groupBy({
      by: ["sessionId"],
      where: {
        createdAt: { gte: last24Hours },
        sessionId: { not: null },
      },
    }).then(r => r.length),

    // Unique visitors last 7 days
    db.pageView.groupBy({
      by: ["sessionId"],
      where: {
        createdAt: { gte: last7Days },
        sessionId: { not: null },
      },
    }).then(r => r.length),

    // Unique visitors last 30 days
    db.pageView.groupBy({
      by: ["sessionId"],
      where: {
        createdAt: { gte: last30Days },
        sessionId: { not: null },
      },
    }).then(r => r.length),
  ])

  return {
    totalPageViews,
    pageViews: {
      today: pageViewsToday,
      last24Hours: pageViews24h,
      last7Days: pageViews7d,
      last30Days: pageViews30d,
    },
    uniqueVisitors: {
      today: uniqueVisitorsToday,
      last24Hours: uniqueVisitors24h,
      last7Days: uniqueVisitors7d,
      last30Days: uniqueVisitors30d,
    },
  }
}

export async function getActiveUsers() {
  const now = new Date()
  const last15Minutes = subHours(now, 0.25) // 15 minutes
  const last1Hour = subHours(now, 1)
  const last24Hours = subHours(now, 24)
  const last7Days = subDays(now, 7)
  const last30Days = subDays(now, 30)

  const [
    activeNow,
    active1Hour,
    active24Hours,
    active7Days,
    active30Days,
  ] = await Promise.all([
    // Users active in last 15 minutes
    db.user.count({
      where: { lastActiveAt: { gte: last15Minutes } },
    }),

    // Users active in last hour
    db.user.count({
      where: { lastActiveAt: { gte: last1Hour } },
    }),

    // Users active in last 24 hours
    db.user.count({
      where: { lastActiveAt: { gte: last24Hours } },
    }),

    // Users active in last 7 days
    db.user.count({
      where: { lastActiveAt: { gte: last7Days } },
    }),

    // Users active in last 30 days
    db.user.count({
      where: { lastActiveAt: { gte: last30Days } },
    }),
  ])

  return {
    activeNow,
    active1Hour,
    active24Hours,
    active7Days,
    active30Days,
  }
}

export async function getPageViewTrends() {
  const days = 14
  const data = []

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i)
    const dayStart = startOfDay(date)
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)

    const [pageViews, uniqueVisitors] = await Promise.all([
      db.pageView.count({
        where: {
          createdAt: { gte: dayStart, lte: dayEnd },
        },
      }),
      db.pageView.groupBy({
        by: ["sessionId"],
        where: {
          createdAt: { gte: dayStart, lte: dayEnd },
          sessionId: { not: null },
        },
      }).then(r => r.length),
    ])

    data.push({
      date: format(date, "MMM d"),
      pageViews,
      uniqueVisitors,
    })
  }

  return data
}

export async function getTopPages(limit = 10) {
  const last30Days = subDays(new Date(), 30)

  const pageViews = await db.pageView.groupBy({
    by: ["path"],
    where: {
      createdAt: { gte: last30Days },
    },
    _count: {
      path: true,
    },
    orderBy: {
      _count: {
        path: "desc",
      },
    },
    take: limit,
  })

  return pageViews.map((pv) => ({
    path: pv.path,
    views: pv._count.path,
  }))
}
