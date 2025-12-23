"use client"

import { useState, useEffect } from 'react';
import { dashboardAPI } from '@/lib/api';

export function useDashboard() {
  const [stats, setStats] = useState<{
    totalCustomers: number;
    activeServices: number;
    totalRevenue: number;
    monthlyRevenue: Array<{ month: string; revenue: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardAPI.getStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch };
}
