import type {
  Customer,
  CustomerSummary,
  DashboardResponse,
  Invoice,
  InvoiceDetail,
  Notification,
  Payment,
  Product,
  Quote,
  QuoteConversionResult,
  QuoteDetail,
  QuoteStatus,
  Role,
  RoleKey,
  Settings
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || `Failed to load ${path}`);
  }

  const payload = await response.json();
  return payload.data as T;
}

export const api = {
  dashboard: (role: RoleKey) => request<DashboardResponse>(`/api/dashboard?role=${role}`),
  customers: () => request<Customer[]>('/api/customers'),
  customer: (id: string) => request<Customer>(`/api/customers/${id}`),
  customerSummary: (id: string) => request<CustomerSummary>(`/api/customers/${id}/summary`),
  products: () => request<Product[]>('/api/products'),
  product: (id: string) => request<Product>(`/api/products/${id}`),
  quotes: () => request<Quote[]>('/api/quotes'),
  quote: (id: string) => request<QuoteDetail>(`/api/quotes/${id}`),
  updateQuoteStatus: (id: string, status: QuoteStatus) =>
    request<{ quote: QuoteDetail }>(`/api/quotes/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    }),
  convertQuote: (id: string) =>
    request<QuoteConversionResult>(`/api/quotes/${id}/convert`, {
      method: 'POST'
    }),
  invoices: () => request<Invoice[]>('/api/invoices'),
  invoice: (id: string) => request<InvoiceDetail>(`/api/invoices/${id}`),
  payments: () => request<Payment[]>('/api/payments'),
  payment: (id: string) => request<Payment>(`/api/payments/${id}`),
  notifications: () => request<Notification[]>('/api/notifications'),
  settings: () => request<Settings>('/api/settings'),
  roles: () => request<Role[]>('/api/roles')
};
