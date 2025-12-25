"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { amcsAPI } from "@/lib/api"

export function AMCWidgets() {
  const [stats, setStats] = useState<any>(null)
  const [expiringAMCs, setExpiringAMCs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, expiring] = await Promise.all([
          amcsAPI.getStats(),
          amcsAPI.getExpiring(30),
        ])
        setStats(statsData)
        setExpiringAMCs(expiring)
      } catch (error) {
        console.error('Failed to load AMC data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* AMC Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-600"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" x2="8" y1="13" y2="13" />
            <line x1="16" x2="8" y1="17" y2="17" />
          </svg>
          AMC Contracts Overview
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Contracts</p>
            <p className="text-2xl font-bold text-foreground">{stats?.total || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Expired</p>
            <p className="text-2xl font-bold text-red-600">{stats?.expired || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Value</p>
            <p className="text-lg font-bold text-blue-600">{formatCurrency(stats?.totalValue || 0)}</p>
          </div>
        </div>
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Expiring Soon</p>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              Next 30 days: {stats?.expiring30 || 0}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Next 60 days: {stats?.expiring60 || 0}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Next 90 days: {stats?.expiring90 || 0}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Expiring AMCs */}
      <Card className={`p-6 ${expiringAMCs.length > 0 ? 'border-orange-200' : ''}`}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-orange-600"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" x2="12" y1="9" y2="13" />
            <line x1="12" x2="12.01" y1="17" y2="17" />
          </svg>
          Expiring Contracts (Next 30 Days)
        </h3>
        <div className="space-y-3">
          {expiringAMCs.length === 0 ? (
            <div className="text-center py-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-green-600 mb-2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p className="text-sm text-green-600 font-medium">All contracts are up to date!</p>
            </div>
          ) : (
            expiringAMCs.slice(0, 5).map((amc: any) => {
              const daysUntilExpiry = Math.ceil(
                (new Date(amc.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              )
              return (
                <div
                  key={amc.id}
                  className="flex items-center justify-between p-3 border border-orange-200 rounded bg-orange-50"
                >
                  <div>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      {amc.contractNumber}
                      <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                        {daysUntilExpiry} days
                      </Badge>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {amc.customer?.name} - {amc.machine?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(Number(amc.contractValue))}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(amc.endDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
        {expiringAMCs.length > 5 && (
          <Button
            variant="link"
            className="w-full mt-3"
            onClick={() => (window.location.href = '/amcs')}
          >
            View all contracts →
          </Button>
        )}
      </Card>
    </div>
  )
}

