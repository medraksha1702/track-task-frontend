"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/sidebar"
import { AMCDialog } from "@/components/amc-dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAMCs } from "@/hooks/useAMCs"
import { amcsAPI } from "@/lib/api"

export default function AMCsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAMC, setSelectedAMC] = useState<any>(null)
  const [currentTab, setCurrentTab] = useState("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const { amcs, pagination, loading, error, refetch } = useAMCs(page, 10, currentTab === "all" ? undefined : currentTab)
  
  const paginationData = pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this AMC contract?')) return
    try {
      setDeletingId(id)
      await amcsAPI.delete(id)
      refetch()
    } catch (err: any) {
      alert(err.message || 'Failed to delete AMC')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSendReminder = async (amc: any) => {
    if (!amc.customer?.email) {
      alert('Customer email not found. Cannot send reminder.')
      return
    }
    try {
      setSendingReminderId(amc.id)
      await amcsAPI.sendRenewalReminder(amc.id)
      alert(`Renewal reminder sent successfully to ${amc.customer.email}`)
    } catch (err: any) {
      alert(err.message || 'Failed to send reminder. Make sure email is configured.')
    } finally {
      setSendingReminderId(null)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedAMC(null)
    refetch()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const amcsList = amcs || []

  const filteredAMCs = useMemo(() => {
    if (!searchQuery) {
      return amcsList
    }
    return amcsList.filter((amc) => {
      const matchesSearch =
        amc.contractNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        amc.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        amc.machine?.name?.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesSearch
    })
  }, [amcsList, searchQuery])

  const statusColors: Record<string, any> = {
    active: "default",
    expired: "destructive",
    renewed: "secondary",
    cancelled: "outline",
  }

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date()
    const expiry = new Date(endDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar currentPage="amcs" />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">AMC Contracts</h2>
                <p className="text-muted-foreground">Manage Annual Maintenance Contracts</p>
              </div>
              <Button
                onClick={() => {
                  setSelectedAMC(null)
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
                New AMC Contract
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
                    placeholder="Search by contract number, customer, or machine..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Tabs value={currentTab} onValueChange={setCurrentTab}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="expired">Expired</TabsTrigger>
                    <TabsTrigger value="renewed">Renewed</TabsTrigger>
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
                  {filteredAMCs.map((amc) => {
                    const daysUntilExpiry = getDaysUntilExpiry(amc.endDate)
                    const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0

                    return (
                      <Card key={amc.id} className={`p-6 hover:shadow-lg transition-shadow ${isExpiringSoon ? 'border-orange-200 bg-orange-50/50' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <h3 className="text-lg font-bold text-foreground">{amc.contractNumber}</h3>
                              <Badge variant={statusColors[amc.status] || "default"}>
                                {amc.status.charAt(0).toUpperCase() + amc.status.slice(1)}
                              </Badge>
                              {isExpiringSoon && (
                                <Badge variant="outline" className="border-orange-500 text-orange-600">
                                  Expires in {daysUntilExpiry} days
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Customer</p>
                                <p className="text-sm text-foreground font-medium">{amc.customer?.name || "Unknown"}</p>
                              </div>

                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Machine</p>
                                <p className="text-sm text-foreground font-medium">{amc.machine?.name || "Unknown"}</p>
                              </div>

                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Contract Period</p>
                                <p className="text-sm text-foreground font-medium">
                                  {new Date(amc.startDate).toLocaleDateString('en-IN')} - {new Date(amc.endDate).toLocaleDateString('en-IN')}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Contract Value</p>
                                <p className="text-lg text-foreground font-bold">{formatCurrency(Number(amc.contractValue))}</p>
                              </div>
                            </div>

                            {amc.notes && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                                <p className="text-sm text-foreground">{amc.notes}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            {isExpiringSoon && amc.customer?.email && (
                              <Button
                                variant="outline"
                                size="sm"
                                title="Send Renewal Reminder"
                                onClick={() => handleSendReminder(amc)}
                                disabled={sendingReminderId === amc.id}
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
                                  <rect width="20" height="16" x="2" y="4" rx="2" />
                                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAMC(amc)
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
                              onClick={() => handleDelete(amc.id)}
                              disabled={deletingId === amc.id}
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
                    )
                  })}
                </div>

                {filteredAMCs.length === 0 && (
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground">No AMC contracts found</p>
                  </Card>
                )}

                {paginationData.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-muted-foreground">
                      Page {paginationData.page} of {paginationData.totalPages} ({paginationData.total} total)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={paginationData.page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(paginationData.totalPages, p + 1))}
                        disabled={paginationData.page === paginationData.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <AMCDialog isOpen={isDialogOpen} onClose={handleDialogClose} amc={selectedAMC} />
    </div>
  )
}

