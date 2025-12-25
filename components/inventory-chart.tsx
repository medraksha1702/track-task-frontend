"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface InventoryChartProps {
  inventoryBreakdown: {
    available: number;
    sold: number;
    totalValue: number;
  };
  totalMachines: number;
}

export function InventoryChart({ inventoryBreakdown, totalMachines }: InventoryChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const data = [
    {
      name: 'Inventory',
      'Total Stock': totalMachines,
      'Available': inventoryBreakdown.available,
      'Sold': inventoryBreakdown.sold,
    },
  ]

  const valueData = [
    {
      name: 'Inventory Value',
      value: inventoryBreakdown.totalValue,
    }
  ]

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Inventory Overview</h3>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Stock Count Chart */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">Stock Status</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Total Stock" fill="#94a3b8" name="Total Machines" />
              <Bar dataKey="Available" fill="#22c55e" name="Available" />
              <Bar dataKey="Sold" fill="#ef4444" name="Sold" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory Value */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Total Available Inventory Value</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(inventoryBreakdown.totalValue)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Capital tied in {inventoryBreakdown.available} available machine{inventoryBreakdown.available !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </Card>
  )
}

