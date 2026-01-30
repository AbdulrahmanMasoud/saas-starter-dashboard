import { redirect } from "next/navigation"
import { format } from "date-fns"
import { User, Shield, CreditCard, FileText, Image, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { ProfileForm } from "./profile-form"
import { PasswordForm } from "./password-form"

export const metadata = {
  title: "Profile - Dashboard",
  description: "Manage your profile settings",
}

async function getProfile(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    include: {
      role: true,
      subscription: {
        include: {
          plan: true,
        },
      },
      _count: {
        select: { posts: true, media: true },
      },
    },
  })
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await getProfile(session.user.id)

  if (!user) {
    redirect("/login")
  }

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U"

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar & Name */}
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-semibold">{user.name || "Unnamed"}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.role && (
                <Badge variant="secondary" className="mt-2">
                  <Shield className="mr-1 h-3 w-3" />
                  {user.role.name}
                </Badge>
              )}
            </div>

            <Separator />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  {user._count.posts}
                </div>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                  <Image className="h-5 w-5 text-muted-foreground" />
                  {user._count.media}
                </div>
                <p className="text-xs text-muted-foreground">Media</p>
              </div>
            </div>

            <Separator />

            {/* Dates */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {format(new Date(user.createdAt), "MMMM d, yyyy")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Forms */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm user={user} />
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription
              </CardTitle>
              <CardDescription>
                Your current subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.subscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.subscription.plan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.subscription.plan.description}
                      </p>
                    </div>
                    <Badge variant={user.subscription.status === "ACTIVE" ? "default" : "secondary"}>
                      {user.subscription.status}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Billing Period</span>
                      <span>{user.subscription.billingPeriod === "YEARLY" ? "Yearly" : "Monthly"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Period Ends</span>
                      <span>{format(new Date(user.subscription.currentPeriodEnd), "MMM d, yyyy")}</span>
                    </div>
                    {user.subscription.trialEnd && user.subscription.status === "TRIALING" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trial Ends</span>
                        <span>{format(new Date(user.subscription.trialEnd), "MMM d, yyyy")}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Active Subscription</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You don&apos;t have an active subscription plan.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
