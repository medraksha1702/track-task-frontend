"use client"

import { useState } from "react"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentActivity } from "@/components/recent-activity"
import { UpcomingServices } from "@/components/upcoming-services"
import { Sidebar } from "@/components/sidebar"
import { DateFilter } from "@/components/date-filter"
import { InventoryChart } from "@/components/inventory-chart"
import { RevenuePieChart } from "@/components/revenue-pie-chart"
import { RemindersAndAlerts } from "@/components/reminders-and-alerts"
import { AMCWidgets } from "@/components/amc-widgets"
import { useDashboard } from "@/hooks/useDashboard"

export default function DashboardPage() {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-${String(firstDay.getDate()).padStart(2, '0')}`,
    endDate: `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`,
  })

  const { stats, loading } = useDashboard(dateRange.startDate, dateRange.endDate)

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

            <div className="mb-6">
              <DateFilter onFilterChange={setDateRange} defaultFilter="this-month" />
            </div>

            <DashboardStats dateRange={dateRange} />

            {stats && stats.monthlyRevenue && stats.monthlyRevenue.length > 0 && (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InventoryChart 
                  inventoryBreakdown={stats.inventoryBreakdown}
                  totalMachines={stats.totalMachines}
                />
                <RevenuePieChart stats={{
                  totalRevenue: stats.totalRevenue,
                  totalCosts: stats.totalCosts,
                  serviceCosts: stats.serviceCosts,
                  machineCosts: stats.machineCosts,
                  profit: stats.profit
                }} />
              </div>
            )}

            <RemindersAndAlerts />

            <AMCWidgets />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
