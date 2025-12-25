"use client"

import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface RevenuePieChartProps {
  stats: {
    totalRevenue: number;
    totalCosts: number;
    serviceCosts: number;
    machineCosts: number;
    profit: number;
  }
}

const COLORS = {
  revenue: '#22c55e',
  serviceCosts: '#ef4444',
  machineCosts: '#f97316',
  profit: '#3b82f6',
}

export function RevenuePieChart({ stats }: RevenuePieChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const data = [
    { name: 'Revenue', value: Number(stats.totalRevenue), color: COLORS.revenue },
    { name: 'Service Costs', value: Number(stats.serviceCosts), color: COLORS.serviceCosts },
    { name: 'Machine Costs', value: Number(stats.machineCosts), color: COLORS.machineCosts },
    { name: 'Profit', value: Number(stats.profit), color: COLORS.profit },
  ].filter(item => item.value > 0) // Only show non-zero values

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Financial Breakdown</h3>
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No financial data available for the selected period
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Financial Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}

