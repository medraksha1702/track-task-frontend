const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Get auth token from localStorage
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.error?.message || error.message || 'Request failed');
  }

  const data = await response.json();
  return data.data || data;
}

// Helper to fetch paginated data (handles backend response structure)
async function fetchPaginatedData<T>(
  endpoint: string,
  params: URLSearchParams
): Promise<{ data: T[]; pagination: any }> {
  const token = getToken();
  const url = `${API_BASE_URL}${endpoint}?${params}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.error?.message || error.message || 'Request failed');
  }

  const json = await response.json();
  // Backend returns { success: true, data: array[], pagination: {...} }
  return {
    data: Array.isArray(json.data) ? json.data : [],
    pagination: json.pagination || null,
  };
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (typeof window !== 'undefined' && response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await apiRequest<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    
    if (typeof window !== 'undefined' && response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },
};

// Customers API
export const customersAPI = {
  getAll: async (search?: string, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    const result = await fetchPaginatedData<any>('/customers', params);
    return {
      customers: result.data,
      pagination: result.pagination,
    };
  },

  getById: async (id: string) => {
    return apiRequest<any>(`/customers/${id}`);
  },

  create: async (data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    hospitalOrLabName?: string;
  }) => {
    return apiRequest<any>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<{
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    hospitalOrLabName?: string;
  }>) => {
    return apiRequest<any>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/customers/${id}`, {
      method: 'DELETE',
    });
  },
};

// Machines API
export const machinesAPI = {
  getAll: async (status?: string, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });
    const result = await fetchPaginatedData<any>('/machines', params);
    return {
      machines: result.data,
      pagination: result.pagination,
    };
  },

  getById: async (id: string) => {
    return apiRequest<any>(`/machines/${id}`);
  },

  create: async (data: {
    name: string;
    model?: string;
    serialNumber?: string;
    purchasePrice: number;
    sellingPrice: number;
    stockQuantity?: number;
    status?: string;
  }) => {
    return apiRequest<any>('/machines', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<{
    name: string;
    model?: string;
    serialNumber?: string;
    purchasePrice: number;
    sellingPrice: number;
    stockQuantity: number;
    status: string;
  }>) => {
    return apiRequest<any>(`/machines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateStock: async (id: string, quantity: number) => {
    return apiRequest<any>(`/machines/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/machines/${id}`, {
      method: 'DELETE',
    });
  },
};

// Services API
export const servicesAPI = {
  getAll: async (filters?: {
    status?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
  }, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.customerId && { customerId: filters.customerId }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
    });
    const result = await fetchPaginatedData<any>('/services', params);
    return {
      services: result.data,
      pagination: result.pagination,
    };
  },

  getById: async (id: string) => {
    return apiRequest<any>(`/services/${id}`);
  },

  create: async (data: {
    customerId: string;
    machineId?: string;
    serviceType: 'repair' | 'maintenance' | 'installation';
    description?: string;
    status?: string;
    serviceDate: string;
    cost?: number;
  }) => {
    return apiRequest<any>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<{
    customerId: string;
    machineId?: string;
    serviceType: 'repair' | 'maintenance' | 'installation';
    description?: string;
    status: string;
    serviceDate: string;
    cost?: number;
  }>) => {
    return apiRequest<any>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/services/${id}`, {
      method: 'DELETE',
    });
  },
};

// Invoices API
export const invoicesAPI = {
  getAll: async (page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const result = await fetchPaginatedData<any>('/invoices', params);
    return {
      invoices: result.data,
      pagination: result.pagination,
    };
  },

  getById: async (id: string) => {
    return apiRequest<any>(`/invoices/${id}`);
  },

  create: async (data: {
    customerId: string;
    invoiceDate: string;
    dueDate?: string;
    items: Array<{
      itemType: 'service' | 'machine';
      referenceId: string;
      quantity: number;
      price: number;
    }>;
  }) => {
    return apiRequest<any>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<{
    paymentStatus: 'paid' | 'unpaid' | 'partial';
    dueDate?: string;
    paidAmount?: number;
  }>) => {
    return apiRequest<any>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updatePaymentStatus: async (id: string, paymentStatus: 'paid' | 'unpaid' | 'partial', paidAmount?: number) => {
    return apiRequest<any>(`/invoices/${id}/payment-status`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus, ...(paidAmount !== undefined ? { paidAmount } : {}) }),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/invoices/${id}`, {
      method: 'DELETE',
    });
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    return apiRequest<{
      totalCustomers: number;
      activeServices: number;
      totalRevenue: number;
      monthlyRevenue: Array<{ month: string; revenue: number }>;
    }>('/dashboard/stats');
  },

  getRevenue: async () => {
    return apiRequest<Array<{ month: string; revenue: number }>>('/dashboard/revenue');
  },
};




