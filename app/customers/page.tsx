"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/sidebar"
import { CustomerDialog } from "@/components/customer-dialog"
import { useCustomers } from "@/hooks/useCustomers"
import { customersAPI } from "@/lib/api"

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { customers, loading, error, refetch } = useCustomers(searchQuery || undefined)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return
    try {
      setDeletingId(id)
      await customersAPI.delete(id)
      refetch()
    } catch (err: any) {
      alert(err.message || 'Failed to delete customer')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedCustomer(null)
    refetch()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar currentPage="customers" />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Customers</h2>
                <p className="text-muted-foreground">Manage your customer database and contacts</p>
              </div>
              <Button
                onClick={() => {
                  setSelectedCustomer(null)
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
                Add Customer
              </Button>
            </div>

            <Card className="p-6 mb-6">
              <div className="flex items-center gap-4">
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
                    placeholder="Search customers by name, contact, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </Card>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customers.map((customer) => (
                    <Card key={customer.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground mb-1">{customer.name}</h3>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCustomer(customer)
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
                            onClick={() => handleDelete(customer.id)}
                            disabled={deletingId === customer.id}
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

                      <div className="space-y-3 mb-4">
                        {customer.hospitalOrLabName && (
                          <div className="flex items-start gap-2">
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
                              className="mt-0.5 text-muted-foreground"
                            >
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm text-foreground">{customer.hospitalOrLabName}</p>
                            </div>
                          </div>
                        )}

                        {customer.email && (
                          <div className="flex items-start gap-2">
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
                              className="mt-0.5 text-muted-foreground"
                            >
                              <rect width="20" height="16" x="2" y="4" rx="2" />
                              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground break-all">{customer.email}</p>
                            </div>
                          </div>
                        )}

                        {customer.phone && (
                          <div className="flex items-start gap-2">
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
                              className="mt-0.5 text-muted-foreground"
                            >
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">{customer.phone}</p>
                            </div>
                          </div>
                        )}

                        {customer.address && (
                          <div className="flex items-start gap-2">
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
                              className="mt-0.5 text-muted-foreground"
                            >
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">{customer.address}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-border pt-4">
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(customer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>

                {customers.length === 0 && (
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground">
                      {searchQuery ? 'No customers found matching your search.' : 'No customers yet. Add your first customer!'}
                    </p>
                  </Card>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <CustomerDialog isOpen={isDialogOpen} onClose={handleDialogClose} customer={selectedCustomer} />
    </div>
  )
}
