"use client"

import { useState, useEffect } from 'react';
import { invoicesAPI } from '@/lib/api';

export function useInvoices(page = 1, limit = 10) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await invoicesAPI.getAll(page, limit);
        setInvoices(Array.isArray(data.invoices) ? data.invoices : []);
        setPagination(data.pagination);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch invoices');
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [page, limit]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoicesAPI.getAll(page, limit);
      setInvoices(Array.isArray(data.invoices) ? data.invoices : []);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  return { invoices, pagination, loading, error, refetch };
}
