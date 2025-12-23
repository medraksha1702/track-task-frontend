import { DashboardStats } from "@/components/dashboard-stats"
import { RecentActivity } from "@/components/recent-activity"
import { UpcomingServices } from "@/components/upcoming-services"
import { Sidebar } from "@/components/sidebar"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar currentPage="dashboard" />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
              <p className="text-muted-foreground">Welcome back! Here's an overview of your business.</p>
            </div>

            <DashboardStats />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <UpcomingServices />
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
