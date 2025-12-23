"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CustomerDialog({
  isOpen,
  onClose,
  customer,
}: {
  isOpen: boolean
  onClose: () => void
  customer: any
}) {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
  })

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        contact: customer.hospitalOrLabName || customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
      })
    } else {
      setFormData({
        name: "",
        contact: "",
        email: "",
        phone: "",
        address: "",
      })
    }
  }, [customer, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { customersAPI } = await import('@/lib/api')
      if (customer) {
        await customersAPI.update(customer.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          hospitalOrLabName: formData.contact,
        })
      } else {
        await customersAPI.create({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          hospitalOrLabName: formData.contact,
        })
      }
      onClose()
      // Trigger page refresh by reloading or using a callback
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (error: any) {
      alert(error.message || 'Failed to save customer')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{customer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              placeholder="e.g., City General Hospital"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact Person</Label>
            <Input
              id="contact"
              placeholder="e.g., Dr. Sarah Johnson"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="123 Medical Plaza, New York, NY 10001"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{customer ? "Save Changes" : "Add Customer"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
