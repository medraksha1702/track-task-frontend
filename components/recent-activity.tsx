"use client"

import { Card } from "@/components/ui/card"
import { useInvoices } from "@/hooks/useInvoices"
import { useServices } from "@/hooks/useServices"
import { useCustomers } from "@/hooks/useCustomers"

export function RecentActivity() {
  const { invoices } = useInvoices(1, 5)
  const { services } = useServices({ status: 'completed' }, 1, 3)
  const { customers } = useCustomers(undefined, 1, 1)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatTimeAgo = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diff = now.getTime() - dateObj.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  // Ensure arrays are always defined
  const invoicesList = invoices || []
  const servicesList = services || []

  const invoiceActivities = invoicesList.slice(0, 3).map((invoice) => ({
    id: invoice.id,
    type: "invoice",
    message: `Invoice ${invoice.invoiceNumber} ${invoice.paymentStatus === 'paid' ? 'paid' : 'created'} by ${invoice.customer?.name || 'Customer'}`,
    amount: invoice.paymentStatus === 'paid' ? formatCurrency(Number(invoice.totalAmount)) : null,
    time: formatTimeAgo(invoice.createdAt),
    timestamp: new Date(invoice.createdAt).getTime(),
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" x2="8" y1="13" y2="13" />
        <line x1="16" x2="8" y1="17" y2="17" />
      </svg>
    ),
  }))

  const serviceActivities = servicesList.slice(0, 2).map((service) => ({
    id: service.id,
    type: "service",
    message: `Service ${service.serviceType} completed for ${service.customer?.name || 'Customer'}`,
    amount: service.cost ? formatCurrency(Number(service.cost)) : null,
    time: formatTimeAgo(service.createdAt),
    timestamp: new Date(service.createdAt).getTime(),
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  }))

  const activities = [...invoiceActivities, ...serviceActivities]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-muted text-muted-foreground">{activity.icon}</div>
            <div className="flex-1">
              <p className="text-sm text-foreground mb-1">{activity.message}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{activity.time}</span>
                {activity.amount && <span className="text-sm font-semibold text-green-600">{activity.amount}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
