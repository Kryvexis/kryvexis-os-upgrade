import type {
  Customer,
  CustomerSummary,
  DashboardResponse,
  EmailDraft,
  EmailTemplateKind,
  Invoice,
  InvoiceDetail,
  Notification,
  Payment,
  Product,
  PurchaseOrder,
  Supplier,
  Quote,
  QuoteConversionResult,
  QuoteDetail,
  QuoteStatus,
  Role,
  RoleKey,
  ReportsResponse,
  Settings,
  AutomationConfig,
  AutomationPanel,
  DayCloseDispatchResponse
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
  reports: (role: RoleKey, branch?: string) => request<ReportsResponse>(`/api/reports?role=${role}${branch ? `&branch=${encodeURIComponent(branch)}` : ''}`),
  runDayClose: (role: RoleKey, branch?: string) => request<AutomationPanel>('/api/day-close/run', {
    method: 'POST',
    body: JSON.stringify({ role, branch })
  }),
  sendDailySummary: (role: RoleKey, branch?: string) => request<DayCloseDispatchResponse>('/api/day-close/send-summary', {
    method: 'POST',
    body: JSON.stringify({ role, branch })
  }),
  updateAutomationSettings: (payload: Partial<AutomationConfig>) => request<AutomationConfig>('/api/settings/automation', {
    method: 'PATCH',
    body: JSON.stringify(payload)
  }),
  customers: () => request<Customer[]>('/api/customers'),
  customer: (id: string) => request<Customer>(`/api/customers/${id}`),
  customerSummary: (id: string) => request<CustomerSummary>(`/api/customers/${id}/summary`),
  products: () => request<Product[]>('/api/products'),
  suppliers: () => request<Supplier[]>('/api/suppliers'),
  purchaseOrders: () => request<PurchaseOrder[]>('/api/purchase-orders'),
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
  approveQuote: (id: string) =>
    request<{ quote: QuoteDetail }>(`/api/quotes/${id}/approve`, {
      method: 'POST'
    }),
  invoices: () => request<Invoice[]>('/api/invoices'),
  invoice: (id: string) => request<InvoiceDetail>(`/api/invoices/${id}`),
  sendInvoiceReminder: (id: string) =>
    request<{ invoice: InvoiceDetail }>(`/api/invoices/${id}/reminder`, {
      method: 'POST'
    }),
  payments: () => request<Payment[]>('/api/payments'),
  payment: (id: string) => request<Payment>(`/api/payments/${id}`),
  resolvePaymentProof: (id: string) =>
    request<{ payment: Payment }>(`/api/payments/${id}/resolve-proof`, {
      method: 'POST'
    }),
  allocatePayment: (id: string, invoiceId?: string) =>
    request<{ payment: Payment }>(`/api/payments/${id}/allocate`, {
      method: 'POST',
      body: JSON.stringify({ invoiceId })
    }),
  notifications: () => request<Notification[]>('/api/notifications'),
  markNotificationRead: (id: string, read: boolean) =>
    request<Notification>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ read })
    }),
  snoozeNotification: (id: string, until: string) =>
    request<Notification>(`/api/notifications/${id}/snooze`, {
      method: 'PATCH',
      body: JSON.stringify({ until })
    }),
  dismissNotification: (id: string) =>
    request<Notification>(`/api/notifications/${id}/dismiss`, {
      method: 'PATCH'
    }),
  emailDraft: (kind: EmailTemplateKind, id: string) =>
    request<EmailDraft>(`/api/emails/${kind}/${id}`),
  settings: () => request<Settings>('/api/settings'),
  roles: () => request<Role[]>('/api/roles')
};
