"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useServices } from "@/hooks/useServices"

export function UpcomingServices() {
  const { services, loading } = useServices({ status: 'pending' }, 1, 10)

  const upcomingServices = services
    .filter(service => {
      const serviceDate = new Date(service.serviceDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return serviceDate >= today
    })
    .sort((a, b) => new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime())
    .slice(0, 5)

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-4">Upcoming Services</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-foreground mb-4">Upcoming Services</h3>
      <div className="space-y-4">
        {upcomingServices.length > 0 ? (
          upcomingServices.map((service) => (
            <div key={service.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground">{service.customer?.name || "Unknown Customer"}</h4>
                  <Badge variant="secondary">
                    {service.status === "pending" ? "Pending" : service.status === "in_progress" ? "In Progress" : "Completed"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{service.machine?.name || "No machine"}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                    {service.serviceType}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                    {new Date(service.serviceDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No upcoming services scheduled</p>
        )}
      </div>
    </Card>
  )
}
