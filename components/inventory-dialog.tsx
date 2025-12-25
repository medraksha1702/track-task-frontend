"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function InventoryDialog({ isOpen, onClose, machine }: { isOpen: boolean; onClose: () => void; machine: any }) {
  const [formData, setFormData] = useState({
    name: "",
    manufacturer: "",
    model: "",
    condition: "New",
    purchasePrice: "",
    salePrice: "",
    stockQuantity: "",
    status: "Available",
    location: "",
    dateAcquired: "",
    serialNumber: "",
  })

  useEffect(() => {
    if (machine) {
      setFormData({
        name: machine.name || "",
        manufacturer: "",
        model: machine.model || "",
        condition: "New",
        purchasePrice: machine.purchasePrice ? String(machine.purchasePrice) : "",
        salePrice: machine.sellingPrice ? String(machine.sellingPrice) : "",
        stockQuantity: machine.stockQuantity ? String(machine.stockQuantity) : "0",
        status: machine.status === "available" ? "Available" : "Sold",
        location: "",
        dateAcquired: machine.createdAt ? new Date(machine.createdAt).toISOString().split('T')[0] : "",
        serialNumber: machine.serialNumber || "",
      })
    } else {
      setFormData({
        name: "",
        manufacturer: "",
        model: "",
        condition: "New",
        purchasePrice: "",
        salePrice: "",
        stockQuantity: "1",
        status: "Available",
        location: "",
        dateAcquired: "",
        serialNumber: "",
      })
    }
  }, [machine, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { machinesAPI } = await import('@/lib/api')
      const purchasePrice = parseFloat(formData.purchasePrice)
      const salePrice = parseFloat(formData.salePrice)
      const stockQuantity = parseInt(formData.stockQuantity) || 0
      
      if (machine) {
        await machinesAPI.update(machine.id, {
          name: formData.name,
          model: formData.model || undefined,
          serialNumber: formData.serialNumber || undefined,
          purchasePrice,
          sellingPrice: salePrice,
          stockQuantity,
          status: formData.status.toLowerCase() as "available" | "sold",
        })
      } else {
        await machinesAPI.create({
          name: formData.name,
          model: formData.model || undefined,
          serialNumber: formData.serialNumber || undefined,
          purchasePrice,
          sellingPrice: salePrice,
          stockQuantity,
          status: formData.status.toLowerCase() as "available" | "sold",
        })
      }
      onClose()
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (error: any) {
      alert(error.message || 'Failed to save machine')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{machine ? "Edit Machine" : "Add New Machine"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Equipment Name</Label>
            <Input
              id="name"
              placeholder="e.g., MRI Scanner"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                placeholder="e.g., Magnetom Skyra 3T"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                placeholder="e.g., SKY3T-2024-001"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price (₹)</Label>
              <Input
                id="purchasePrice"
                type="number"
                placeholder="e.g., 850000"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salePrice">Sale Price (₹)</Label>
              <Input
                id="salePrice"
                type="number"
                placeholder="e.g., 1050000"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stockQuantity">Stock Quantity</Label>
            <Input
              id="stockQuantity"
              type="number"
              min="0"
              placeholder="e.g., 5"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
              required
            />
          </div>


          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{machine ? "Save Changes" : "Add Machine"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
