import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar"
import { Header } from "@/components/dashboard/header"
import { PageTracker } from "@/components/analytics/page-tracker"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <PageTracker />
      <Sidebar />
      <MobileSidebar />
      <div className="lg:pl-64 transition-all duration-300 data-[collapsed=true]:lg:pl-16">
        <Header />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
