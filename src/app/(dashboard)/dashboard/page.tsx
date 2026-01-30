import { StatsCard } from "@/components/dashboard/stats-card"
import { AreaChart } from "@/components/dashboard/charts/area-chart"
import { LineChart } from "@/components/dashboard/charts/line-chart"
import { PieChart } from "@/components/dashboard/charts/pie-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import {
  getDashboardStats,
  getUserGrowthData,
  getSubscriptionTrends,
  getPostsByCategory,
  getPlanDistribution,
  getRecentActivity,
  getVisitorStats,
  getActiveUsers,
  getPageViewTrends,
} from "@/lib/dashboard/analytics"

export const metadata = {
  title: "Dashboard - Overview",
  description: "Dashboard overview page",
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function DashboardPage() {
  // Fetch all dashboard data in parallel
  const [
    stats,
    userGrowth,
    subscriptionTrends,
    postsByCategory,
    planDistribution,
    recentActivities,
    visitorStats,
    activeUsers,
    pageViewTrends,
  ] = await Promise.all([
    getDashboardStats(),
    getUserGrowthData(),
    getSubscriptionTrends(),
    getPostsByCategory(),
    getPlanDistribution(),
    getRecentActivity(10),
    getVisitorStats(),
    getActiveUsers(),
    getPageViewTrends(),
  ])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your site.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard
          title="Total Users"
          value={formatNumber(stats.totalUsers)}
          icon="Users"
          trend={{
            value: Math.abs(stats.trends.users),
            isPositive: stats.trends.users >= 0,
          }}
          description="from last month"
        />
        <StatsCard
          title="Active Users"
          value={formatNumber(activeUsers.active24Hours)}
          icon="Activity"
          description={`${activeUsers.activeNow} online now`}
        />
        <StatsCard
          title="Page Views"
          value={formatNumber(visitorStats.pageViews.last30Days)}
          icon="Eye"
          description={`${formatNumber(visitorStats.uniqueVisitors.last30Days)} unique visitors`}
        />
        <StatsCard
          title="Total Posts"
          value={formatNumber(stats.totalPosts)}
          icon="FileText"
          trend={{
            value: Math.abs(stats.trends.posts),
            isPositive: stats.trends.posts >= 0,
          }}
          description="from last month"
        />
        <StatsCard
          title="Active Subscriptions"
          value={formatNumber(stats.activeSubscriptions)}
          icon="CreditCard"
          trend={{
            value: Math.abs(stats.trends.subscriptions),
            isPositive: stats.trends.subscriptions >= 0,
          }}
          description="from last month"
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(stats.mrr)}
          icon="DollarSign"
          description="recurring revenue"
        />
      </div>

      {/* Charts Row 1: User Growth & Page Views */}
      <div className="grid gap-4 lg:grid-cols-2">
        <LineChart
          title="User Growth"
          description="New and total users over time"
          data={userGrowth}
          xAxisKey="month"
          lines={[
            { dataKey: "totalUsers", color: "hsl(var(--chart-1))", name: "Total Users" },
            { dataKey: "newUsers", color: "hsl(var(--chart-2))", name: "New Users" },
          ]}
        />
        <LineChart
          title="Visitor Traffic"
          description="Page views and unique visitors over the last 14 days"
          data={pageViewTrends}
          xAxisKey="date"
          lines={[
            { dataKey: "pageViews", color: "hsl(var(--chart-3))", name: "Page Views" },
            { dataKey: "uniqueVisitors", color: "hsl(var(--chart-4))", name: "Unique Visitors" },
          ]}
        />
      </div>

      {/* Charts Row 2: Revenue */}
      <div className="grid gap-4 lg:grid-cols-1">
        <AreaChart
          title="Revenue Trend"
          description="Monthly recurring revenue"
          data={subscriptionTrends}
          dataKey="revenue"
          xAxisKey="month"
          color="hsl(var(--chart-3))"
        />
      </div>

      {/* Charts Row 3: Distribution Charts & Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <PieChart
          title="Posts by Category"
          description="Distribution of content"
          data={postsByCategory.length > 0 ? postsByCategory : [{ name: "No posts", value: 1, color: "hsl(var(--muted))" }]}
        />
        <PieChart
          title="Subscriptions by Plan"
          description="Active subscriptions per plan"
          data={planDistribution.length > 0 ? planDistribution : [{ name: "No subscriptions", value: 1, color: "hsl(var(--muted))" }]}
        />
        <RecentActivity activities={recentActivities} />
      </div>
    </div>
  )
}
