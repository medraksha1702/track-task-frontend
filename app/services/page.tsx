"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/sidebar"
import { ServiceDialog } from "@/components/service-dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useServices } from "@/hooks/useServices"
import { servicesAPI } from "@/lib/api"

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [currentTab, setCurrentTab] = useState("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const statusFilter = useMemo(() => {
    if (currentTab === "all") return undefined
    if (currentTab === "scheduled") return "pending"
    if (currentTab === "in-progress") return "in_progress"
    if (currentTab === "completed") return "completed"
    return undefined
  }, [currentTab])

  const { services, loading, error, refetch } = useServices({ status: statusFilter })

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    try {
      setDeletingId(id)
      await servicesAPI.delete(id)
      refetch()
    } catch (err: any) {
      alert(err.message || 'Failed to delete service')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedService(null)
    refetch()
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "$0"
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Ensure services is always an array
  const servicesList = services || []

  const filteredServices = servicesList.filter((service) => {
    const customerName = service.customer?.name || ""
    const machineName = service.machine?.name || ""
    const matchesSearch =
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const statusColors: Record<string, any> = {
    pending: "default",
    in_progress: "secondary",
    completed: "outline",
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar currentPage="services" />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Services</h2>
                <p className="text-muted-foreground">Track and manage all your service requests and work orders</p>
              </div>
              <Button
                onClick={() => {
                  setSelectedService(null)
                  setIsDialogOpen(true)
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                New Service
              </Button>
            </div>

            <Card className="p-6 mb-6">
              <div className="flex flex-col gap-4">
                <div className="relative flex-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <Input
                    placeholder="Search services by customer, machine, or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Tabs value={currentTab} onValueChange={setCurrentTab}>
                  <TabsList>
                    <TabsTrigger value="all">All Services</TabsTrigger>
                    <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                    <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </Card>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6">
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="p-12 text-center">
                <p className="text-red-500">{error}</p>
              </Card>
            ) : (
              <>
                <div className="space-y-4">
                  {filteredServices.map((service) => (
                    <Card key={service.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-bold text-foreground">{service.customer?.name || "Unknown Customer"}</h3>
                            <Badge variant={statusColors[service.status] || "default"}>
                              {service.status === "pending" ? "Scheduled" : service.status === "in_progress" ? "In Progress" : "Completed"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Machine</p>
                              <p className="text-sm text-foreground font-medium">{service.machine?.name || "N/A"}</p>
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Service Type</p>
                              <p className="text-sm text-foreground font-medium capitalize">{service.serviceType}</p>
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Date</p>
                              <p className="text-sm text-foreground font-medium">
                                {new Date(service.serviceDate).toLocaleDateString()}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Cost</p>
                              <p className="text-sm text-foreground font-bold">{formatCurrency(service.cost ? Number(service.cost) : null)}</p>
                            </div>
                          </div>

                          {service.description && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{service.description}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedService(service)
                              setIsDialogOpen(true)
                            }}
                          >
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
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              <path d="m15 5 4 4" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(service.id)}
                            disabled={deletingId === service.id}
                          >
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
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {filteredServices.length === 0 && (
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground">
                      {searchQuery ? 'No services found matching your search.' : 'No services yet. Create your first service!'}
                    </p>
                  </Card>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <ServiceDialog isOpen={isDialogOpen} onClose={handleDialogClose} service={selectedService} />
    </div>
  )
}
