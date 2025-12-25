"use client"

import { useState, useEffect } from 'react';
import { amcsAPI } from '@/lib/api';

export function useAMCs(page: number = 1, limit: number = 10, status?: string, customerId?: string) {
  const [amcs, setAMCs] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAMCs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await amcsAPI.getAll(page, limit, status, customerId);
        setAMCs(data.amcs);
        setPagination(data.pagination);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch AMCs');
        // Ensure pagination is set even on error
        setPagination({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAMCs();
  }, [page, limit, status, customerId]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await amcsAPI.getAll(page, limit, status, customerId);
      setAMCs(data.amcs);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch AMCs');
    } finally {
      setLoading(false);
    }
  };

  return { amcs, pagination, loading, error, refetch };
}

