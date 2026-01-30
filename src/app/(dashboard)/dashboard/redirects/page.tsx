import { db } from "@/lib/db"
import { RedirectsManager } from "./redirects-manager"

export const metadata = {
  title: "Redirects - Dashboard",
  description: "Manage URL redirects",
}

async function getRedirects() {
  return db.redirect.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export default async function RedirectsPage() {
  const redirects = await getRedirects()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Redirects</h1>
        <p className="text-muted-foreground">
          Manage URL redirects for your site
        </p>
      </div>

      {/* Redirects Manager */}
      <RedirectsManager initialRedirects={redirects} />
    </div>
  )
}
