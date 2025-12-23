"use client"

import { useState, useEffect } from 'react';
import { servicesAPI } from '@/lib/api';

export function useServices(filters?: {
  status?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}, page = 1, limit = 10) {
  const [services, setServices] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await servicesAPI.getAll(filters, page, limit);
        setServices(Array.isArray(data.services) ? data.services : []);
        setPagination(data.pagination);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch services');
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [JSON.stringify(filters), page, limit]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await servicesAPI.getAll(filters, page, limit);
      setServices(Array.isArray(data.services) ? data.services : []);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  return { services, pagination, loading, error, refetch };
}
