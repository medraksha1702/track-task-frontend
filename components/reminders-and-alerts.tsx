"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { reportsAPI } from "@/lib/api"

export function RemindersAndAlerts() {
  const [upcomingServices, setUpcomingServices] = useState<any[]>([])
  const [overdueInvoices, setOverdueInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [services, invoices] = await Promise.all([
          reportsAPI.getUpcomingServices(),
          reportsAPI.getOverdueInvoices(),
        ])
        setUpcomingServices(services)
        setOverdueInvoices(invoices)
      } catch (error) {
        console.error('Failed to load reminders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Upcoming Services */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600"
            >
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
            </svg>
            Upcoming Services
          </h3>
          {upcomingServices.length > 0 && (
            <Badge variant="secondary">{upcomingServices.length}</Badge>
          )}
        </div>

        <div className="space-y-3">
          {upcomingServices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No upcoming services scheduled
            </p>
          ) : (
            upcomingServices.slice(0, 5).map((service: any) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">{service.customer?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {service.serviceType} - {service.machine?.name || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-600">
                    {new Date(service.serviceDate).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <Badge variant={service.status === 'in_progress' ? 'default' : 'secondary'} className="text-xs">
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>

        {upcomingServices.length > 5 && (
          <Button variant="link" className="w-full mt-3" onClick={() => window.location.href = '/services'}>
            View all services →
          </Button>
        )}
      </Card>

      {/* Overdue Payments */}
      <Card className={`p-6 ${overdueInvoices.length > 0 ? 'border-red-200 bg-red-50/50' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-600"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" x2="12" y1="9" y2="13" />
              <line x1="12" x2="12.01" y1="17" y2="17" />
            </svg>
            Payment Alerts
          </h3>
          {overdueInvoices.length > 0 && (
            <Badge variant="destructive">{overdueInvoices.length}</Badge>
          )}
        </div>

        <div className="space-y-3">
          {overdueInvoices.length === 0 ? (
            <div className="text-center py-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-green-600 mb-2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p className="text-sm text-green-600 font-medium">All payments up to date!</p>
            </div>
          ) : (
            overdueInvoices.map((invoice: any) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 border border-red-200 rounded bg-white"
              >
                <div>
                  <p className="font-medium text-foreground flex items-center gap-2">
                    {invoice.invoiceNumber}
                    <Badge variant="destructive" className="text-xs">
                      OVERDUE
                    </Badge>
                  </p>
                  <p className="text-sm text-muted-foreground">{invoice.customer?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-600">
                    {formatCurrency(Number(invoice.totalAmount) - Number(invoice.paidAmount || 0))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Due: {new Date(invoice.dueDate).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {overdueInvoices.length > 0 && (
          <Button variant="link" className="w-full mt-3 text-red-600" onClick={() => window.location.href = '/invoices'}>
            View all invoices →
          </Button>
        )}
      </Card>
    </div>
  )
}

