"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/sidebar"
import { InvoiceDialog } from "@/components/invoice-dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInvoices } from "@/hooks/useInvoices"
import { invoicesAPI } from "@/lib/api"

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [currentTab, setCurrentTab] = useState("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { invoices, loading, error, refetch } = useInvoices()

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    try {
      setDeletingId(id)
      await invoicesAPI.delete(id)
      refetch()
    } catch (err: any) {
      alert(err.message || 'Failed to delete invoice')
    } finally {
      setDeletingId(null)
    }
  }

  const handleUpdatePaymentStatus = async (id: string, status: 'paid' | 'unpaid' | 'partial') => {
    try {
      await invoicesAPI.updatePaymentStatus(id, status)
      refetch()
    } catch (err: any) {
      alert(err.message || 'Failed to update payment status')
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedInvoice(null)
    refetch()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Ensure invoices is always an array
  const invoicesList = invoices || []

  const filteredInvoices = useMemo(() => {
    return invoicesList.filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.items?.some((item: any) => 
          item.details?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )

      const matchesTab =
        currentTab === "all" ||
        (currentTab === "paid" && invoice.paymentStatus === "paid") ||
        (currentTab === "pending" && invoice.paymentStatus === "unpaid") ||
        (currentTab === "partial" && invoice.paymentStatus === "partial")

      return matchesSearch && matchesTab
    })
  }, [invoices, searchQuery, currentTab])

  const statusColors: Record<string, any> = {
    paid: "default",
    unpaid: "secondary",
    partial: "outline",
  }

  const stats = useMemo(() => {
    const paid = invoices.filter((inv) => inv.paymentStatus === "paid")
    const unpaid = invoices.filter((inv) => inv.paymentStatus === "unpaid")
    const partial = invoices.filter((inv) => inv.paymentStatus === "partial")

    const totalRevenue = paid.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0)
    const pendingAmount = unpaid.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0)
    const partialAmount = partial.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0)

    return {
      totalRevenue,
      pendingAmount,
      partialAmount,
      paidCount: paid.length,
      pendingCount: unpaid.length,
      partialCount: partial.length,
    }
  }, [invoices])

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar currentPage="invoices" />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Invoices</h2>
                <p className="text-muted-foreground">Manage billing and track payments</p>
              </div>
              <Button
                onClick={() => {
                  setSelectedInvoice(null)
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
                New Invoice
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-green-600 mt-1">{stats.paidCount} paid invoices</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(stats.pendingAmount)}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.pendingCount} invoices</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Partial</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(stats.partialAmount)}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.partialCount} invoices</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Total Billing</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(stats.totalRevenue + stats.pendingAmount + stats.partialAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">All invoices</p>
              </Card>
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
                    placeholder="Search invoices by number, customer, or service..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Tabs value={currentTab} onValueChange={setCurrentTab}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="paid">Paid</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="partial">Partial</TabsTrigger>
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
                  {filteredInvoices.map((invoice) => {
                    const itemsSummary = invoice.items?.map((item: any) => {
                      if (item.itemType === 'service') {
                        return item.details?.serviceType || 'Service'
                      } else {
                        return item.details?.name || 'Machine'
                      }
                    }).join(', ') || 'N/A'

                    return (
                      <Card key={invoice.id} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <h3 className="text-lg font-bold text-foreground">{invoice.invoiceNumber}</h3>
                              <Badge variant={statusColors[invoice.paymentStatus] || "default"}>
                                {invoice.paymentStatus === "paid" ? "Paid" : invoice.paymentStatus === "unpaid" ? "Unpaid" : "Partial"}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Customer</p>
                                <p className="text-sm text-foreground font-medium">{invoice.customer?.name || "Unknown"}</p>
                              </div>

                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Items</p>
                                <p className="text-sm text-foreground font-medium">{itemsSummary}</p>
                              </div>

                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Issued</p>
                                <p className="text-sm text-foreground font-medium">
                                  {new Date(invoice.invoiceDate).toLocaleDateString()}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                                <p className="text-sm text-foreground font-medium">
                                  {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Amount</p>
                                <p className="text-lg text-foreground font-bold">{formatCurrency(Number(invoice.totalAmount))}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            {invoice.paymentStatus !== 'paid' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newStatus = invoice.paymentStatus === 'unpaid' ? 'paid' : invoice.paymentStatus === 'partial' ? 'paid' : 'paid'
                                  handleUpdatePaymentStatus(invoice.id, newStatus)
                                }}
                              >
                                Mark Paid
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedInvoice(invoice)
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
                              onClick={() => handleDelete(invoice.id)}
                              disabled={deletingId === invoice.id}
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

                {filteredInvoices.length === 0 && (
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground">
                      {searchQuery ? 'No invoices found matching your search.' : 'No invoices yet. Create your first invoice!'}
                    </p>
                  </Card>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <InvoiceDialog isOpen={isDialogOpen} onClose={handleDialogClose} invoice={selectedInvoice} />
    </div>
  )
}
