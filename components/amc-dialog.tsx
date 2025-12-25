"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCustomers } from "@/hooks/useCustomers"
import { useMachines } from "@/hooks/useMachines"
import { amcsAPI } from "@/lib/api"

export function AMCDialog({ isOpen, onClose, amc }: { isOpen: boolean; onClose: () => void; amc?: any }) {
  const { customers } = useCustomers()
  const { machines } = useMachines()
  const [formData, setFormData] = useState({
    customerId: "",
    machineId: "",
    contractNumber: "",
    startDate: "",
    endDate: "",
    contractValue: "",
    renewalDate: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (amc) {
      setFormData({
        customerId: amc.customerId || amc.customer?.id || "",
        machineId: amc.machineId || amc.machine?.id || "",
        contractNumber: amc.contractNumber || "",
        startDate: amc.startDate ? new Date(amc.startDate).toISOString().split('T')[0] : "",
        endDate: amc.endDate ? new Date(amc.endDate).toISOString().split('T')[0] : "",
        contractValue: amc.contractValue ? String(amc.contractValue) : "",
        renewalDate: amc.renewalDate ? new Date(amc.renewalDate).toISOString().split('T')[0] : "",
        notes: amc.notes || "",
      })
    } else {
      const today = new Date().toISOString().split('T')[0]
      const nextYear = new Date()
      nextYear.setFullYear(nextYear.getFullYear() + 1)
      const nextYearStr = nextYear.toISOString().split('T')[0]
      
      setFormData({
        customerId: "",
        machineId: "",
        contractNumber: "",
        startDate: today,
        endDate: nextYearStr,
        contractValue: "",
        renewalDate: "",
        notes: "",
      })
    }
    setError("")
  }, [amc, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const data = {
        customerId: formData.customerId,
        machineId: formData.machineId,
        contractNumber: formData.contractNumber || undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        contractValue: parseFloat(formData.contractValue),
        renewalDate: formData.renewalDate ? new Date(formData.renewalDate).toISOString() : null,
        notes: formData.notes || null,
      }

      if (amc) {
        await amcsAPI.update(amc.id, data)
      } else {
        await amcsAPI.create(data)
      }
      onClose()
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save AMC')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const availableMachines = machines?.filter((m: any) => m.status === 'available') || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{amc ? "Edit AMC Contract" : "Create New AMC Contract"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="customerId">Customer *</Label>
            <Select value={formData.customerId} onValueChange={(value) => setFormData({ ...formData, customerId: value })} required>
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers?.map((customer: any) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="machineId">Machine *</Label>
            <Select value={formData.machineId} onValueChange={(value) => setFormData({ ...formData, machineId: value })} required>
              <SelectTrigger>
                <SelectValue placeholder="Select machine" />
              </SelectTrigger>
              <SelectContent>
                {availableMachines.map((machine: any) => (
                  <SelectItem key={machine.id} value={machine.id}>
                    {machine.name} {machine.model ? `- ${machine.model}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contractNumber">Contract Number</Label>
            <Input
              id="contractNumber"
              placeholder="Leave empty to auto-generate"
              value={formData.contractNumber}
              onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Auto-generated if left empty (e.g., AMC-2025-0001)</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contractValue">Contract Value (₹) *</Label>
            <Input
              id="contractValue"
              type="number"
              placeholder="e.g., 50000"
              value={formData.contractValue}
              onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="renewalDate">Renewal Date (Optional)</Label>
            <Input
              id="renewalDate"
              type="date"
              value={formData.renewalDate}
              onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this contract..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : amc ? 'Update Contract' : 'Create Contract'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

