import { User, AuditHistoryItem, AffiliateData } from '../types';

// Default API URL can be configured in root .env as VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'halator_auth_token';

export const tokenStorage = {
  get: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  set: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  remove: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },
};

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = tokenStorage.get();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `HTTP Error ${response.status}`,
        error: data.error,
      };
    }

    return data;
  } catch (error: any) {
    console.warn(`[API Network Error on ${endpoint}]`, error);
    return {
      success: false,
      message: error.message || 'Koneksi ke server gagal. Pastikan backend aktif.',
    };
  }
}

export const authApi = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    gender?: 'male' | 'female';
    businessName?: string;
    businessAddress?: string;
    referredBy?: string;
  }) => {
    const res = await request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (res.success && res.data?.token) {
      tokenStorage.set(res.data.token);
    }
    return res;
  },

  login: async (email: string, password: string) => {
    const res = await request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.success && res.data?.token) {
      tokenStorage.set(res.data.token);
    }
    return res;
  },

  getMe: async () => {
    return request<{ user: User }>('/auth/me');
  },

  updateProfile: async (updates: Partial<User>) => {
    return request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  logout: () => {
    tokenStorage.remove();
  },
};

export const auditApi = {
  getHistory: async (type?: string) => {
    const query = type ? `?type=${type}` : '';
    return request<{ items: AuditHistoryItem[]; total: number }>(`/audit/history${query}`);
  },

  createAudit: async (item: {
    type: 'product' | 'process' | 'transaction';
    input: any;
    output: any;
  }) => {
    return request<{ audit: AuditHistoryItem }>('/audit/history', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  deleteAudit: async (id: string) => {
    return request(`/audit/history/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async () => {
    return request<{
      total: number;
      byType: { product: number; process: number; transaction: number };
      quota: { auditsPerMonth: number; auditsUsed: number };
      plan: string;
    }>('/audit/stats');
  },
};

export const affiliateApi = {
  getData: async () => {
    return request<{ affiliate: AffiliateData }>('/affiliate');
  },

  requestPayout: async (amount: number) => {
    return request<{ affiliate: AffiliateData }>('/affiliate/payout', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },
};
