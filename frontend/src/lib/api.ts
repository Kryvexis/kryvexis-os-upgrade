import type { Customer, DashboardResponse, Invoice, Notification, Payment, Product, Quote, Role, RoleKey, Settings } from '../types';
async function request<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  const payload = await response.json();
  return payload.data as T;
}
export const api = {
  dashboard: (role: RoleKey) => request<DashboardResponse>(`/api/dashboard?role=${role}`),
  customers: () => request<Customer[]>('/api/customers'),
  customer: (id: string) => request<Customer>(`/api/customers/${id}`),
  products: () => request<Product[]>('/api/products'),
  product: (id: string) => request<Product>(`/api/products/${id}`),
  quotes: () => request<Quote[]>('/api/quotes'),
  quote: (id: string) => request<Quote>(`/api/quotes/${id}`),
  invoices: () => request<Invoice[]>('/api/invoices'),
  invoice: (id: string) => request<Invoice>(`/api/invoices/${id}`),
  payments: () => request<Payment[]>('/api/payments'),
  payment: (id: string) => request<Payment>(`/api/payments/${id}`),
  notifications: () => request<Notification[]>('/api/notifications'),
  settings: () => request<Settings>('/api/settings'),
  roles: () => request<Role[]>('/api/roles')
};
