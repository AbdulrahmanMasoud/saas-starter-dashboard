"use client"

import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ActivityItem {
  id: string
  user: {
    name: string | null
    image?: string | null
  }
  action: string
  entity: string
  entityName?: string | null
  createdAt: Date
}

interface RecentActivityProps {
  activities: ActivityItem[]
}

const actionColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  created: "default",
  updated: "secondary",
  deleted: "destructive",
  published: "default",
  archived: "outline",
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity
              </p>
            ) : (
              activities.map((activity) => {
                const userName = activity.user.name || "System"
                const initials = userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()

                return (
                <div key={activity.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.user.image || undefined} />
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{userName}</span>{" "}
                      <Badge
                        variant={actionColors[activity.action] || "secondary"}
                        className="mx-1 text-xs"
                      >
                        {activity.action}
                      </Badge>{" "}
                      <span className="text-muted-foreground">
                        {activity.entity}
                        {activity.entityName && (
                          <span className="font-medium text-foreground">
                            {" "}
                            &quot;{activity.entityName}&quot;
                          </span>
                        )}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              )})
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
