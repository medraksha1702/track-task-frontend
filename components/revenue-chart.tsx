"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number; costs: number; profit: number }>
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatMonth = (month: string) => {
    const date = new Date(month + '-01')
    return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
  }

  const chartData = data.map((item) => ({
    ...item,
    month: formatMonth(item.month),
  }))

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Business Overview - Revenue, Costs & Profit</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#22c55e" name="Revenue" strokeWidth={3} />
          <Line type="monotone" dataKey="costs" stroke="#ef4444" name="Costs" strokeWidth={3} />
          <Line type="monotone" dataKey="profit" stroke="#3b82f6" name="Profit" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}

