"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/sidebar"
import { DateFilter } from "@/components/date-filter"
import { reportsAPI } from "@/lib/api"

export default function ReportsPage() {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-${String(firstDay.getDate()).padStart(2, '0')}`,
    endDate: `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`,
  })
  
  const [report, setReport] = useState<any>(null)
  const [upcomingServices, setUpcomingServices] = useState<any[]>([])
  const [overdueInvoices, setOverdueInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const loadReport = async () => {
    setLoading(true)
    try {
      const [reportData, services, invoices] = await Promise.all([
        reportsAPI.getSummary(dateRange.startDate, dateRange.endDate),
        reportsAPI.getUpcomingServices(),
        reportsAPI.getOverdueInvoices(),
      ])
      setReport(reportData)
      setUpcomingServices(services)
      setOverdueInvoices(invoices)
    } catch (error: any) {
      alert(error.message || 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar currentPage="reports" />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Reports & Analytics</h2>
              <p className="text-muted-foreground">Comprehensive business insights and performance metrics</p>
            </div>

            <div className="mb-6 flex gap-4">
              <DateFilter onFilterChange={setDateRange} defaultFilter="this-month" />
              <Button onClick={loadReport} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>

            {report && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <Card className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(report.totalRevenue)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Collected in period</p>
                  </Card>

                  <Card className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">Total Costs</p>
                    <p className="text-3xl font-bold text-red-600">{formatCurrency(report.totalCosts)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Expenses incurred</p>
                  </Card>

                  <Card className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
                    <p className={`text-3xl font-bold ${report.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCurrency(report.profit)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {report.profit >= 0 ? 'Profitable' : 'Loss'} period
                    </p>
                  </Card>

                  <Card className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">Profit Margin</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {report.totalRevenue > 0 ? ((report.profit / report.totalRevenue) * 100).toFixed(1) : '0'}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Profitability ratio</p>
                  </Card>
                </div>

                {/* Activity Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">Invoices Created</p>
                    <p className="text-2xl font-bold text-foreground">{report.invoicesCount}</p>
                  </Card>

                  <Card className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">Services Completed</p>
                    <p className="text-2xl font-bold text-foreground">{report.servicesCount}</p>
                  </Card>

                  <Card className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">Machines Sold</p>
                    <p className="text-2xl font-bold text-foreground">{report.machinesSold}</p>
                  </Card>
                </div>

                {/* AMC Statistics */}
                {report.amcStats && (
                  <Card className="p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">AMC Contracts Analytics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Contracts</p>
                        <p className="text-xl font-bold text-foreground">{report.amcStats.totalContracts}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Active</p>
                        <p className="text-xl font-bold text-green-600">{report.amcStats.activeContracts}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Expired</p>
                        <p className="text-xl font-bold text-red-600">{report.amcStats.expiredContracts}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total AMC Value</p>
                        <p className="text-xl font-bold text-blue-600">{formatCurrency(report.amcStats.totalAMCValue)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Expiring (30d)</p>
                        <p className="text-xl font-bold text-orange-600">{report.amcStats.expiring30Days}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Services Under AMC</p>
                        <p className="text-xl font-bold text-purple-600">{report.amcStats.servicesUnderAMC}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Revenue Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Revenue by Category</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Machine Sales</span>
                          <span className="text-sm font-semibold">{formatCurrency(report.revenueByCategory.machines)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${report.totalRevenue > 0 ? (report.revenueByCategory.machines / report.totalRevenue) * 100 : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Service Revenue</span>
                          <span className="text-sm font-semibold">{formatCurrency(report.revenueByCategory.services)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ 
                              width: `${report.totalRevenue > 0 ? (report.revenueByCategory.services / report.totalRevenue) * 100 : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Top 5 Customers</h3>
                    <div className="space-y-3">
                      {report.topCustomers.map((customer: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">{customer.customerName}</p>
                            <p className="text-xs text-muted-foreground">{customer.invoicesCount} invoices</p>
                          </div>
                          <p className="font-semibold text-foreground">{formatCurrency(customer.totalSpent)}</p>
                        </div>
                      ))}
                      {report.topCustomers.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No customer data for this period</p>
                      )}
                    </div>
                  </Card>
                </div>
              </>
            )}

            {/* Upcoming Services */}
            {upcomingServices.length > 0 && (
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Upcoming Services</h3>
                <div className="space-y-3">
                  {upcomingServices.slice(0, 5).map((service: any) => (
                    <div key={service.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium text-foreground">{service.customer?.name}</p>
                        <p className="text-sm text-muted-foreground">{service.serviceType} - {service.machine?.name || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{new Date(service.serviceDate).toLocaleDateString('en-IN')}</p>
                        <Badge variant={service.status === 'in_progress' ? 'default' : 'secondary'}>
                          {service.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Overdue Invoices */}
            {overdueInvoices.length > 0 && (
              <Card className="p-6 border-red-200">
                <h3 className="text-lg font-semibold mb-4 text-red-600">⚠️ Overdue Invoices</h3>
                <div className="space-y-3">
                  {overdueInvoices.map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border border-red-200 rounded bg-red-50">
                      <div>
                        <p className="font-medium text-foreground">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">{invoice.customer?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-red-600">
                          {formatCurrency(Number(invoice.totalAmount) - Number(invoice.paidAmount || 0))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(invoice.dueDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {!report && !loading && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Select a date range and click "Generate Report" to view analytics</p>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

