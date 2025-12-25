"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface DateFilterProps {
  onFilterChange: (filters: { startDate: string; endDate: string }) => void
  defaultFilter?: "this-month" | "last-month" | "this-year" | "custom"
}

export function DateFilter({ onFilterChange, defaultFilter = "this-month" }: DateFilterProps) {
  const [filterType, setFilterType] = useState(defaultFilter)
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")

  const getDateRange = useMemo(() => {
    const now = new Date()
    let startDate = ""
    let endDate = ""

    switch (filterType) {
      case "this-month":
        // Current month: from 1st to last day of current month
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        startDate = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-${String(firstDay.getDate()).padStart(2, '0')}`
        endDate = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`
        break
      case "last-month":
        // Last month: from 1st to last day of previous month
        const lastMonthFirst = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthLast = new Date(now.getFullYear(), now.getMonth(), 0)
        startDate = `${lastMonthFirst.getFullYear()}-${String(lastMonthFirst.getMonth() + 1).padStart(2, '0')}-${String(lastMonthFirst.getDate()).padStart(2, '0')}`
        endDate = `${lastMonthLast.getFullYear()}-${String(lastMonthLast.getMonth() + 1).padStart(2, '0')}-${String(lastMonthLast.getDate()).padStart(2, '0')}`
        break
      case "this-year":
        // Current year: from Jan 1 to Dec 31
        const yearFirst = new Date(now.getFullYear(), 0, 1)
        const yearLast = new Date(now.getFullYear(), 11, 31)
        startDate = `${yearFirst.getFullYear()}-${String(yearFirst.getMonth() + 1).padStart(2, '0')}-${String(yearFirst.getDate()).padStart(2, '0')}`
        endDate = `${yearLast.getFullYear()}-${String(yearLast.getMonth() + 1).padStart(2, '0')}-${String(yearLast.getDate()).padStart(2, '0')}`
        break
      case "custom":
        startDate = customStartDate
        endDate = customEndDate
        break
    }

    return { startDate, endDate }
  }, [filterType, customStartDate, customEndDate])

  useEffect(() => {
    if (getDateRange.startDate && getDateRange.endDate) {
      onFilterChange(getDateRange)
    }
  }, [getDateRange.startDate, getDateRange.endDate, onFilterChange])

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 space-y-2">
          <Label>Filter Period</Label>
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filterType === "custom" && (
          <>
            <div className="flex-1 space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="text-sm text-muted-foreground">
          {getDateRange.startDate && getDateRange.endDate && (
            <div suppressHydrationWarning>
              {new Date(getDateRange.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })} - {new Date(getDateRange.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

