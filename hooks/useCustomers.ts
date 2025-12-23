"use client"

import { useState, useEffect } from 'react';
import { customersAPI } from '@/lib/api';

export function useCustomers(search?: string, page = 1, limit = 10) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await customersAPI.getAll(search, page, limit);
        setCustomers(Array.isArray(data.customers) ? data.customers : []);
        setPagination(data.pagination);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch customers');
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [search, page, limit]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customersAPI.getAll(search, page, limit);
      setCustomers(Array.isArray(data.customers) ? data.customers : []);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  return { customers, pagination, loading, error, refetch };
}
