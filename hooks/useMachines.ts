"use client"

import { useState, useEffect } from 'react';
import { machinesAPI } from '@/lib/api';

export function useMachines(status?: string, page = 1, limit = 10) {
  const [machines, setMachines] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await machinesAPI.getAll(status, page, limit);
        setMachines(Array.isArray(data.machines) ? data.machines : []);
        setPagination(data.pagination);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch machines');
        setMachines([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
  }, [status, page, limit]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await machinesAPI.getAll(status, page, limit);
      setMachines(Array.isArray(data.machines) ? data.machines : []);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch machines');
      setMachines([]);
    } finally {
      setLoading(false);
    }
  };

  return { machines, pagination, loading, error, refetch };
}
