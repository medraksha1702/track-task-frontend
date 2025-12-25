"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCustomers } from "@/hooks/useCustomers"
import { useServices } from "@/hooks/useServices"
import { useMachines } from "@/hooks/useMachines"

interface InvoiceItem {
  itemType: 'service' | 'machine'
  referenceId: string
  quantity: number
  price: number
}

export function InvoiceDialog({ isOpen, onClose, invoice, preSelectedMachine }: { isOpen: boolean; onClose: () => void; invoice: any; preSelectedMachine?: any }) {
  const [formData, setFormData] = useState({
    customerId: "",
    invoiceDate: "",
    dueDate: "",
    paymentStatus: "unpaid" as 'paid' | 'unpaid' | 'partial',
    paidAmount: 0,
  })

  const [items, setItems] = useState<InvoiceItem[]>([])
  const [currentItem, setCurrentItem] = useState<InvoiceItem>({
    itemType: 'service',
    referenceId: '',
    quantity: 1,
    price: 0,
  })

  const { customers } = useCustomers()
  const { services } = useServices()
  const { machines } = useMachines('available')

  useEffect(() => {
    if (invoice) {
      setFormData({
        customerId: invoice.customerId || invoice.customer?.id || "",
        invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : "",
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : "",
        paymentStatus: invoice.paymentStatus || "unpaid",
        paidAmount: Number(invoice.paidAmount || 0),
      })
      if (invoice.items) {
        setItems(invoice.items.map((item: any) => ({
          itemType: item.itemType,
          referenceId: item.referenceId,
          quantity: item.quantity,
          price: Number(item.price),
        })))
      }
    } else {
      const today = new Date().toISOString().split('T')[0]
      setFormData({
        customerId: "",
        invoiceDate: today,
        dueDate: "",
        paymentStatus: "unpaid",
        paidAmount: 0,
      })
      // If a machine is pre-selected, add it to items
      if (preSelectedMachine) {
        setItems([{
          itemType: 'machine',
          referenceId: preSelectedMachine.id,
          quantity: 1,
          price: Number(preSelectedMachine.sellingPrice || 0),
        }])
      } else {
        setItems([])
      }
    }
  }, [invoice, preSelectedMachine, isOpen])

  const addItem = () => {
    if (!currentItem.referenceId || currentItem.price <= 0) {
      alert('Please select an item and enter a price')
      return
    }
    setItems([...items, currentItem])
    setCurrentItem({
      itemType: 'service',
      referenceId: '',
      quantity: 1,
      price: 0,
    })
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const getItemName = (item: InvoiceItem) => {
    if (item.itemType === 'service') {
      const service = services.find(s => s.id === item.referenceId)
      return service ? `${service.serviceType} - ${service.customer?.name || ''}` : 'Service'
    } else {
      const machine = machines.find(m => m.id === item.referenceId)
      return machine ? machine.name : 'Machine'
    }
  }

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      alert('Please add at least one item to the invoice')
      return
    }

    try {
      const { invoicesAPI } = await import('@/lib/api')
      const invoiceDate = new Date(formData.invoiceDate).toISOString()
      const dueDate = formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined

      if (invoice) {
        // Update existing invoice
        await invoicesAPI.update(invoice.id, {
          paymentStatus: formData.paymentStatus,
          paidAmount: formData.paymentStatus === 'partial' ? formData.paidAmount : undefined,
          dueDate,
        })
      } else {
        // Create new invoice
        await invoicesAPI.create({
          customerId: formData.customerId,
          invoiceDate,
          dueDate,
          items: items.map(item => ({
            itemType: item.itemType,
            referenceId: item.referenceId,
            quantity: item.quantity,
            price: item.price,
          })),
        })
      }
      onClose()
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (error: any) {
      alert(error.message || 'Failed to save invoice')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? "Edit Invoice" : "Create New Invoice"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer *</Label>
              <Select
                value={formData.customerId}
                onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                required
                disabled={!!invoice}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {invoice && (
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value: any) => setFormData({ ...formData, paymentStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Invoice Date *</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                required
                disabled={!!invoice}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

      {invoice && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="paidAmount">Paid Amount</Label>
            <Input
              id="paidAmount"
              type="number"
              step="0.01"
              min="0"
              value={formData.paidAmount}
              onChange={(e) => setFormData({ ...formData, paidAmount: parseFloat(e.target.value) || 0 })}
              disabled={formData.paymentStatus === 'unpaid'}
            />
            <p className="text-xs text-muted-foreground">Set when status is Partial; will auto-set for Paid/Unpaid.</p>
          </div>
        </div>
      )}

          {!invoice && (
            <>
              <div className="border-t pt-4">
                <Label className="text-base font-semibold mb-3 block">Invoice Items</Label>
                
                <div className="space-y-3 mb-4 p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={currentItem.itemType}
                        onValueChange={(value: any) => {
                          setCurrentItem({ ...currentItem, itemType: value, referenceId: '', price: 0 })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="machine">Machine</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Item</Label>
                      <Select
                        value={currentItem.referenceId || undefined}
                        onValueChange={(value) => {
                          const item = currentItem.itemType === 'service'
                            ? services.find(s => s.id === value)
                            : machines.find(m => m.id === value)
                          setCurrentItem({
                            ...currentItem,
                            referenceId: value,
                            price: currentItem.itemType === 'service'
                              ? Number(item?.cost || 0)
                              : Number(item?.sellingPrice || 0),
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentItem.itemType === 'service'
                            ? services.map((service) => (
                                <SelectItem key={service.id} value={service.id}>
                                  {service.serviceType} - {service.customer?.name || ''}
                                </SelectItem>
                              ))
                            : machines.map((machine) => (
                                <SelectItem key={machine.id} value={machine.id}>
                                  {machine.name} - {formatCurrency(Number(machine.sellingPrice))}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        value={currentItem.quantity}
                        onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Price ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={currentItem.price}
                        onChange={(e) => setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <Button type="button" onClick={addItem} variant="outline" className="w-full">
                    Add Item
                  </Button>
                </div>

                {items.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <Label className="text-sm font-semibold">Added Items:</Label>
                    {items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">
                          {getItemName(item)} - Qty: {item.quantity} × {formatCurrency(item.price)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <div className="text-right pt-2 border-t">
                      <Label className="text-sm font-semibold">Total: {formatCurrency(totalAmount)}</Label>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {invoice && (
            <div className="border-t pt-4">
              <Label className="text-base font-semibold mb-3 block">Invoice Items</Label>
              <div className="space-y-2">
                {invoice.items?.map((item: any, index: number) => (
                  <div key={index} className="p-3 bg-muted rounded">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.itemType === 'service' ? 'Service' : 'Machine'}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.details?.name || item.details?.serviceType || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(Number(item.price) * item.quantity)}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-right pt-2 border-t">
                  <Label className="text-base font-bold">Total: {formatCurrency(Number(invoice.totalAmount))}</Label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{invoice ? "Save Changes" : "Create Invoice"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }
}
