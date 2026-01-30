import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart } from "@/components/dashboard/charts/line-chart"
import { Users, Eye, Activity, Clock, Globe, TrendingUp } from "lucide-react"
import {
  getVisitorStats,
  getActiveUsers,
  getPageViewTrends,
  getTopPages,
} from "@/lib/dashboard/analytics"

export const metadata = {
  title: "Analytics - Dashboard",
  description: "Visitor and user analytics",
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

export default async function AnalyticsPage() {
  const [visitorStats, activeUsers, pageViewTrends, topPages] = await Promise.all([
    getVisitorStats(),
    getActiveUsers(),
    getPageViewTrends(),
    getTopPages(10),
  ])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track visitor activity and user engagement
        </p>
      </div>

      {/* Real-time Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers.activeNow}</div>
            <p className="text-xs text-muted-foreground">
              {activeUsers.active1Hour} in last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers.active24Hours}</div>
            <p className="text-xs text-muted-foreground">
              {activeUsers.active7Days} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views Today</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(visitorStats.pageViews.today)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(visitorStats.uniqueVisitors.today)} unique visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(visitorStats.pageViews.last30Days)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(visitorStats.uniqueVisitors.last30Days)} unique visitors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Trends */}
      <div className="grid gap-4 lg:grid-cols-2">
        <LineChart
          title="Traffic Overview"
          description="Page views and unique visitors over the last 14 days"
          data={pageViewTrends}
          xAxisKey="date"
          lines={[
            { dataKey: "pageViews", color: "hsl(var(--chart-1))", name: "Page Views" },
            { dataKey: "uniqueVisitors", color: "hsl(var(--chart-2))", name: "Unique Visitors" },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle>Active Users Breakdown</CardTitle>
            <CardDescription>User activity over different time periods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">Online Now (15 min)</span>
                </div>
                <span className="font-medium">{activeUsers.activeNow}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm">Last Hour</span>
                </div>
                <span className="font-medium">{activeUsers.active1Hour}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-sm">Last 24 Hours</span>
                </div>
                <span className="font-medium">{activeUsers.active24Hours}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  <span className="text-sm">Last 7 Days</span>
                </div>
                <span className="font-medium">{activeUsers.active7Days}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gray-500" />
                  <span className="text-sm">Last 30 Days</span>
                </div>
                <span className="font-medium">{activeUsers.active30Days}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Top Pages
          </CardTitle>
          <CardDescription>Most visited pages in the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {topPages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No page view data yet. Start browsing to see statistics.
            </p>
          ) : (
            <div className="space-y-3">
              {topPages.map((page, index) => {
                const maxViews = topPages[0]?.views || 1
                const percentage = (page.views / maxViews) * 100

                return (
                  <div key={page.path} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate max-w-[70%]">
                        {index + 1}. {page.path}
                      </span>
                      <span className="text-muted-foreground">
                        {formatNumber(page.views)} views
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visitor Stats Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(visitorStats.totalPageViews)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Views This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(visitorStats.pageViews.last7Days)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(visitorStats.uniqueVisitors.last7Days)} unique visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Views Last 24h</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(visitorStats.pageViews.last24Hours)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(visitorStats.uniqueVisitors.last24Hours)} unique visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. per Visitor</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {visitorStats.uniqueVisitors.last30Days > 0
                ? (visitorStats.pageViews.last30Days / visitorStats.uniqueVisitors.last30Days).toFixed(1)
                : "0"}
            </div>
            <p className="text-xs text-muted-foreground">Pages per session (30d)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
