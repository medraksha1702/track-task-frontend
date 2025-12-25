"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/sidebar"
import { InventoryDialog } from "@/components/inventory-dialog"
import { InvoiceDialog } from "@/components/invoice-dialog"
import { useMachines } from "@/hooks/useMachines"
import { machinesAPI } from "@/lib/api"

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false)
  const [selectedMachine, setSelectedMachine] = useState<any>(null)
  const [machineToSell, setMachineToSell] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)

  const { machines, loading, error, refetch } = useMachines(statusFilter)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this machine?')) return
    try {
      setDeletingId(id)
      await machinesAPI.delete(id)
      refetch()
    } catch (err: any) {
      alert(err.message || 'Failed to delete machine')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedMachine(null)
    refetch()
  }

  const handleInvoiceDialogClose = () => {
    setIsInvoiceDialogOpen(false)
    setMachineToSell(null)
    refetch()
  }

  const handleSellMachine = (machine: any) => {
    setMachineToSell(machine)
    setIsInvoiceDialogOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Ensure machines is always an array
  const machinesList = machines || []

  const filteredInventory = machinesList.filter(
    (machine) =>
      machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (machine.model && machine.model.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (machine.serialNumber && machine.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const statusColors: Record<string, any> = {
    available: "default",
    sold: "outline",
  }

  const availableCount = machinesList.filter((m) => m.status === "available").length
  const soldCount = machinesList.filter((m) => m.status === "sold").length
  const totalValue = machinesList
    .filter((m) => m.status !== "sold")
    .reduce((sum, m) => sum + Number(m.sellingPrice || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar currentPage="inventory" />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Machine Inventory</h2>
                <p className="text-muted-foreground">Track equipment available for sale and service</p>
              </div>
              <Button
                onClick={() => {
                  setSelectedMachine(null)
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
                Add Machine
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Available</p>
                <p className="text-3xl font-bold text-foreground">{availableCount}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Sold</p>
                <p className="text-3xl font-bold text-foreground">{soldCount}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Total Inventory Value</p>
                <p className="text-3xl font-bold text-foreground">${(totalValue / 1000000).toFixed(2)}M</p>
              </Card>
            </div>

            <Card className="p-6 mb-6">
              <div className="relative">
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
                  placeholder="Search by name, manufacturer, model, or serial number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </Card>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="p-6">
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredInventory.map((machine) => (
                    <Card key={machine.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground mb-2">{machine.name}</h3>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant={statusColors[machine.status] || "default"}>
                              {machine.status === "available" ? "Available" : "Sold"}
                            </Badge>
                            <Badge variant="outline">Stock: {machine.stockQuantity}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedMachine(machine)
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
                            onClick={() => handleDelete(machine.id)}
                            disabled={deletingId === machine.id}
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

                      <div className="space-y-2 mb-4">
                        {machine.model && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Model</span>
                            <span className="font-medium text-foreground">{machine.model}</span>
                          </div>
                        )}
                        {machine.serialNumber && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Serial Number</span>
                            <span className="font-mono text-xs text-foreground">{machine.serialNumber}</span>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-border pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Purchase Price</p>
                            <p className="text-sm font-semibold text-foreground">{formatCurrency(Number(machine.purchasePrice))}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground mb-1">Sale Price</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(Number(machine.sellingPrice))}</p>
                          </div>
                        </div>
                        {machine.status === "available" && machine.stockQuantity > 0 && (
                          <Button 
                            onClick={() => handleSellMachine(machine)}
                            className="w-full"
                            variant="default"
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
                              className="mr-2"
                            >
                              <circle cx="9" cy="21" r="1" />
                              <circle cx="20" cy="21" r="1" />
                              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                            Sell Machine
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                {filteredInventory.length === 0 && (
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground">
                      {searchQuery ? 'No machines found matching your search.' : 'No machines yet. Add your first machine!'}
                    </p>
                  </Card>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <InventoryDialog isOpen={isDialogOpen} onClose={handleDialogClose} machine={selectedMachine} />
      <InvoiceDialog isOpen={isInvoiceDialogOpen} onClose={handleInvoiceDialogClose} invoice={null} preSelectedMachine={machineToSell} />
    </div>
  )
}
