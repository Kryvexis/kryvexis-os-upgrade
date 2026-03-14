import type {
  AutomationSettings,
  AuthLoginResponse,
  AuthMeResponse,
  AuthUser,
  Customer,
  CustomerSummary,
  DashboardResponse,
  EmailDispatch,
  EmailDraft,
  EmailTemplateKind,
  Invitation,
  Invoice,
  InvoiceDetail,
  Notification,
  Payment,
  PermissionBundle,
  Product,
  PurchaseOrder,
  ReportsResponse,
  Supplier,
  Quote,
  QuoteConversionResult,
  QuoteDetail,
  QuoteStatus,
  Role,
  RoleKey,
  Settings
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const TOKEN_KEY = 'kryvexis_os_session_token';

export function getStoredSessionToken() {
  return typeof window === 'undefined' ? '' : window.localStorage.getItem(TOKEN_KEY) || '';
}

export function setStoredSessionToken(token: string) {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredSessionToken();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  login: async (email: string) => {
    const session = await request<AuthLoginResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email }) });
    setStoredSessionToken(session.token);
    return session;
  },
  me: () => request<AuthMeResponse>('/api/auth/me'),
  logout: async () => {
    try {
      await request<{ loggedOut: boolean }>('/api/auth/logout', { method: 'POST' });
    } finally {
      setStoredSessionToken('');
    }
  },
  switchBranch: (branchId: string) => request<{ branchId: string }>('/api/auth/branch', { method: 'PATCH', body: JSON.stringify({ branchId }) }),
  users: () => request<AuthUser[]>('/api/users'),
  permissions: () => request<PermissionBundle[]>('/api/permissions'),
  invitations: () => request<Invitation[]>('/api/invitations'),
  createInvitation: (email: string, roleKey: RoleKey, branchId?: string) => request<Invitation>('/api/invitations', { method: 'POST', body: JSON.stringify({ email, roleKey, branchId }) }),
  dashboard: (role: RoleKey) => request<DashboardResponse>(`/api/dashboard?role=${role}`),
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
    request<{ quote: QuoteDetail }>(`/api/quotes/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
  convertQuote: (id: string) => request<QuoteConversionResult>(`/api/quotes/${id}/convert`, { method: 'POST' }),
  approveQuote: (id: string) => request<{ quote: QuoteDetail }>(`/api/quotes/${id}/approve`, { method: 'POST' }),
  invoices: () => request<Invoice[]>('/api/invoices'),
  invoice: (id: string) => request<InvoiceDetail>(`/api/invoices/${id}`),
  sendInvoiceReminder: (id: string) => request<{ invoice: InvoiceDetail }>(`/api/invoices/${id}/reminder`, { method: 'POST' }),
  payments: () => request<Payment[]>('/api/payments'),
  payment: (id: string) => request<Payment>(`/api/payments/${id}`),
  resolvePaymentProof: (id: string) => request<{ payment: Payment }>(`/api/payments/${id}/resolve-proof`, { method: 'POST' }),
  allocatePayment: (id: string, invoiceId?: string) => request<{ payment: Payment }>(`/api/payments/${id}/allocate`, { method: 'POST', body: JSON.stringify({ invoiceId }) }),
  notifications: () => request<Notification[]>('/api/notifications'),
  markNotificationRead: (id: string, read: boolean) => request<Notification>(`/api/notifications/${id}/read`, { method: 'PATCH', body: JSON.stringify({ read }) }),
  snoozeNotification: (id: string, until: string) => request<Notification>(`/api/notifications/${id}/snooze`, { method: 'PATCH', body: JSON.stringify({ until }) }),
  dismissNotification: (id: string) => request<Notification>(`/api/notifications/${id}/dismiss`, { method: 'PATCH' }),
  emailDraft: (kind: EmailTemplateKind, id: string) => request<EmailDraft>(`/api/emails/${kind}/${id}`),
  settings: () => request<Settings>('/api/settings'),
  roles: () => request<Role[]>('/api/roles'),
  reports: (role: RoleKey, branch = 'all') => request<ReportsResponse>(`/api/reports?role=${role}&branch=${encodeURIComponent(branch)}`),
  automationSettings: () => request<AutomationSettings>('/api/automation-settings'),
  updateAutomationSettings: (settings: AutomationSettings) => request<AutomationSettings>('/api/automation-settings', { method: 'POST', body: JSON.stringify(settings) }),
  runDayClose: (options?: { sendEmail?: boolean; date?: string; force?: boolean }) => request<{ summary: ReportsResponse; dispatch: EmailDispatch | null }>(`/api/day-close/run`, { method: 'POST', body: JSON.stringify({ trigger: 'manual', sendEmail: Boolean(options?.sendEmail), date: options?.date, force: Boolean(options?.force) }) }),
  sendSummaryEmail: (options?: { resend?: boolean }) => request<EmailDispatch>('/api/day-close/send-summary', { method: 'POST', body: JSON.stringify({ resend: Boolean(options?.resend) }) })
};
