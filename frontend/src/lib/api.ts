import type {
  Customer,
  CustomerSummary,
  DashboardResponse,
  Invoice,
  Notification,
  Payment,
  Product,
  Quote,
  QuoteDetail,
  Role,
  RoleKey,
  Settings
} from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
fetch(`${API_BASE}/api/customers`)

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  const payload = await response.json();
  return payload.data as T;
}

export const api = {
  dashboard: (role: RoleKey) =>
    request<DashboardResponse>(`/api/dashboard?role=${role}`),

  customers: () =>
    request<Customer[]>("/api/customers"),

  customer: (id: string) =>
    request<Customer>(`/api/customers/${id}`),

  customerSummary: (id: string) =>
    request<CustomerSummary>(`/api/customers/${id}/summary`),

  products: () =>
    request<Product[]>("/api/products"),

  product: (id: string) =>
    request<Product>(`/api/products/${id}`),

  quotes: () =>
    request<Quote[]>("/api/quotes"),

  quote: (id: string) =>
    request<QuoteDetail>(`/api/quotes/${id}`),

  invoices: () =>
    request<Invoice[]>("/api/invoices"),

  invoice: (id: string) =>
    request<Invoice>(`/api/invoices/${id}`),

  payments: () =>
    request<Payment[]>("/api/payments"),

  payment: (id: string) =>
    request<Payment>(`/api/payments/${id}`),

  notifications: () =>
    request<Notification[]>("/api/notifications"),

  settings: () =>
    request<Settings>("/api/settings"),

  roles: () =>
    request<Role[]>("/api/roles")
};