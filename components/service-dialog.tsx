"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCustomers } from "@/hooks/useCustomers"
import { useMachines } from "@/hooks/useMachines"

export function ServiceDialog({ isOpen, onClose, service }: { isOpen: boolean; onClose: () => void; service: any }) {
  const [formData, setFormData] = useState({
    customerId: "",
    machineId: "",
    serviceType: "maintenance",
    status: "pending",
    serviceDate: "",
    cost: "",
    description: "",
  })

  const { customers } = useCustomers()
  const { machines } = useMachines('available')

  useEffect(() => {
    if (service) {
      setFormData({
        customerId: service.customerId || service.customer?.id || "",
        machineId: service.machineId || service.machine?.id || "",
        serviceType: service.serviceType || "maintenance",
        status: service.status || "pending",
        serviceDate: service.serviceDate ? new Date(service.serviceDate).toISOString().split('T')[0] : "",
        cost: service.cost ? String(service.cost) : "",
        description: service.description || "",
      })
    } else {
      const today = new Date().toISOString().split('T')[0]
      setFormData({
        customerId: "",
        machineId: "",
        serviceType: "maintenance",
        status: "pending",
        serviceDate: today,
        cost: "",
        description: "",
      })
    }
  }, [service, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { servicesAPI } = await import('@/lib/api')
      const serviceDate = new Date(formData.serviceDate).toISOString()
      
      if (service) {
        await servicesAPI.update(service.id, {
          customerId: formData.customerId,
          machineId: formData.machineId || undefined,
          serviceType: formData.serviceType as 'repair' | 'maintenance' | 'installation',
          status: formData.status,
          serviceDate,
          cost: formData.cost ? parseFloat(formData.cost) : undefined,
          description: formData.description || undefined,
        })
      } else {
        await servicesAPI.create({
          customerId: formData.customerId,
          machineId: formData.machineId || undefined,
          serviceType: formData.serviceType as 'repair' | 'maintenance' | 'installation',
          status: formData.status,
          serviceDate,
          cost: formData.cost ? parseFloat(formData.cost) : undefined,
          description: formData.description || undefined,
        })
      }
      onClose()
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (error: any) {
      alert(error.message || 'Failed to save service')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{service ? "Edit Service" : "Create New Service"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer</Label>
              <Select value={formData.customerId} onValueChange={(value) => setFormData({ ...formData, customerId: value })}>
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

            <div className="space-y-2">
              <Label htmlFor="machineId">Machine/Equipment (Optional)</Label>
              <Select value={formData.machineId || "none"} onValueChange={(value) => setFormData({ ...formData, machineId: value === "none" ? "" : value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select machine (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.name} {machine.model ? `- ${machine.model}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type</Label>
              <Select value={formData.serviceType} onValueChange={(value) => setFormData({ ...formData, serviceType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="installation">Installation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serviceDate">Service Date</Label>
              <Input
                id="serviceDate"
                type="date"
                value={formData.serviceDate}
                onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Service Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                placeholder="e.g., 1500"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                step="0.01"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add any relevant details about the service..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{service ? "Save Changes" : "Create Service"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
