import type {
  AccountingBrain,
  AccountingOverview,
  AutomationSettings,
  Customer,
  CreditorRow,
  CustomerSummary,
  DebtorRow,
  DashboardResponse,
  EmailDispatch,
  ExpenseRow,
  FinanceExceptionRow,
  EmailDraft,
  EmailTemplateKind,
  Invoice,
  InvoiceDetail,
  Notification,
  Payment,
  CashUpRow,
  Product,
  StatementRow,
  PurchaseOrder,
  ReportsResponse,
  Supplier,
  Quote,
  QuoteConversionResult,
  QuoteDetail,
  QuoteStatus,
  Role,
  RoleKey,
  Settings,
  AuthSession
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const AUTH_STORAGE_KEY = 'kryvexis.auth.session';

function readSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

function writeSession(session: AuthSession | null) {
  if (typeof window === 'undefined') return;
  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function inferRole(email: string): RoleKey {
  const value = email.toLowerCase();
  if (value.includes('finance') || value.includes('rina')) return 'finance';
  if (value.includes('warehouse') || value.includes('stock')) return 'warehouse';
  if (value.includes('procurement') || value.includes('buyer')) return 'procurement';
  if (value.includes('ops') || value.includes('operations')) return 'operations';
  if (value.includes('exec')) return 'executive';
  if (value.includes('manager')) return 'manager';
  if (value.includes('admin')) return 'admin';
  return 'sales';
}

function inferBranch(email: string): string {
  const value = email.toLowerCase();
  if (value.includes('ct') || value.includes('cape')) return 'Cape Town';
  if (value.includes('dbn') || value.includes('durban')) return 'Durban';
  if (value.includes('pta') || value.includes('pretoria')) return 'Pretoria';
  return 'Johannesburg';
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const session = readSession();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
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
  async login(email: string): Promise<AuthSession> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) throw new Error('Please enter your work email');
    const session: AuthSession = {
      email: cleanEmail,
      name: cleanEmail.split('@')[0].split(/[._-]/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '),
      role: inferRole(cleanEmail),
      branch: inferBranch(cleanEmail),
      token: `demo-${btoa(cleanEmail)}`,
      lastLoginAt: new Date().toISOString()
    };
    writeSession(session);
    return session;
  },
  async logout(): Promise<void> {
    writeSession(null);
  },
  async me(): Promise<AuthSession | null> {
    return readSession();
  },
  async switchBranch(branch: string): Promise<AuthSession | null> {
    const current = readSession();
    if (!current) return null;
    const next = { ...current, branch };
    writeSession(next);
    return next;
  },
  accountingOverview: () => request<AccountingOverview>('/api/accounting/overview'),
  accountingBrain: () => request<AccountingBrain>('/api/accounting/brain'),
  debtors: () => request<DebtorRow[]>('/api/accounting/debtors'),
  statements: () => request<StatementRow[]>('/api/accounting/statements'),
  sendStatement: (customerId: string) => request<StatementRow>(`/api/accounting/statements/${customerId}/send`, { method: 'POST' }),
  cashUps: () => request<CashUpRow[]>('/api/accounting/cash-ups'),
  approveCashUp: (id: string) => request<CashUpRow>(`/api/accounting/cash-ups/${id}/approve`, { method: 'POST' }),
  expensesLedger: () => request<ExpenseRow[]>('/api/accounting/expenses'),
  approveExpense: (id: string) => request<ExpenseRow>(`/api/accounting/expenses/${id}/approve`, { method: 'POST' }),
  creditors: () => request<CreditorRow[]>('/api/accounting/creditors'),
  financeExceptions: () => request<FinanceExceptionRow[]>('/api/accounting/exceptions'),
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
