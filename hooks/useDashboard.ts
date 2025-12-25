"use client"

import { useState, useEffect } from 'react';
import { dashboardAPI } from '@/lib/api';

export function useDashboard(startDate?: string, endDate?: string) {
  const [stats, setStats] = useState<{
    totalCustomers: number;
    activeServices: number;
    totalMachines: number;
    totalRevenue: number;
    totalCosts: number;
    serviceCosts: number;
    machineCosts: number;
    profit: number;
    monthlyRevenue: Array<{ month: string; revenue: number; costs: number; profit: number }>;
    inventoryBreakdown: {
      available: number;
      sold: number;
      totalValue: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardAPI.getStats(startDate, endDate);
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [startDate, endDate]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardAPI.getStats(startDate, endDate);
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch };
}
