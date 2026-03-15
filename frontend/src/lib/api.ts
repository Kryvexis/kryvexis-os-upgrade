import type {
  AccountingOverview,
  ActionCenterResponse,
  AutomationSettings,
  AuthSession,
  BankAccountRow,
  CashUpRow,
  CreditorRow,
  CreateInvoicePayload,
  CreatePaymentPayload,
  CreateQuotePayload,
  Customer,
  CustomerSummary,
  DashboardResponse,
  DebtorRow,
  EmailDispatch,
  EmailDraft,
  EmailTemplateKind,
  ExpenseRow,
  FinanceExceptionRow,
  Invoice,
  InventoryExceptionRow,
  InventoryMovementRow,
  InventoryOverview,
  InventoryRow,
  InventoryStockRiskRow,
  InventoryTransferRow,
  InvoiceDetail,
  JournalEntryRow,
  KPI,
  LedgerAccountRow,
  LedgerPayload,
  Notification,
  Payment,
  PeriodClosePayload,
  Product,
  TransactionCoreOverview,
  DocumentQueueItem,
  SupplierInsightRow,
  ReorderCandidateRow,
  ProcurementPoRow,
  ProcurementOverview,
  ProcurementExceptionRow,
  PurchaseOrder,
  Quote,
  QuoteConversionResult,
  QuoteDetail,
  QuoteStatus,
  ReconciliationPayload,
  ReportsResponse,
  SignupPayload,
  Role,
  RoleKey,
  Settings,
  StatementRow,
  Supplier,
  SupplierBillsPayload,
  VatPayload
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
    if (response.status === 401) writeSession(null);
    throw new Error(payload?.error || `Failed to load ${path}`);
  }

  const payload = await response.json();
  return payload.data as T;
}

export const api = {
  async signup(payload: SignupPayload): Promise<AuthSession> {
    const session = await request<AuthSession>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    writeSession(session);
    return session;
  },
  async login(email: string): Promise<AuthSession> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) throw new Error('Please enter your work email');
    const session = await request<AuthSession>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: cleanEmail })
    });
    writeSession(session);
    return session;
  },
  async logout(): Promise<void> {
    try {
      await request<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
    } finally {
      writeSession(null);
    }
  },
  async me(): Promise<AuthSession | null> {
    const current = readSession();
    if (!current?.token) return null;
    try {
      const session = await request<AuthSession>('/api/auth/me');
      writeSession(session);
      return session;
    } catch {
      writeSession(null);
      return null;
    }
  },
  async switchBranch(branch: string): Promise<AuthSession | null> {
    const current = readSession();
    if (!current?.token) return null;
    const next = await request<AuthSession>('/api/auth/switch-branch', {
      method: 'POST',
      body: JSON.stringify({ branch })
    });
    writeSession(next);
    return next;
  },
  accountingOverview: () => request<AccountingOverview>('/api/accounting/overview'),
  actionCenter: (role?: RoleKey, branch = 'all', lane = 'all') => request<ActionCenterResponse>(`/api/action-center${role ? `?role=${role}&branch=${encodeURIComponent(branch)}&lane=${encodeURIComponent(lane)}` : ''}`),
  debtors: () => request<DebtorRow[]>('/api/accounting/debtors'),
  statements: () => request<StatementRow[]>('/api/accounting/statements'),
  sendStatement: (customerId: string) => request<StatementRow>(`/api/accounting/statements/${customerId}/send`, { method: 'POST' }),
  cashUps: () => request<CashUpRow[]>('/api/accounting/cash-ups'),
  approveCashUp: (id: string) => request<CashUpRow>(`/api/accounting/cash-ups/${id}/approve`, { method: 'POST' }),
  expensesLedger: () => request<ExpenseRow[]>('/api/accounting/expenses'),
  approveExpense: (id: string) => request<ExpenseRow>(`/api/accounting/expenses/${id}/approve`, { method: 'POST' }),
  creditors: () => request<CreditorRow[]>('/api/accounting/creditors'),
  financeExceptions: () => request<FinanceExceptionRow[]>('/api/accounting/exceptions'),
  accountingLedger: () => request<LedgerPayload>('/api/accounting/ledger'),
  accountingBills: () => request<SupplierBillsPayload>('/api/accounting/bills'),
  accountingReconciliation: () => request<ReconciliationPayload>('/api/accounting/reconciliation'),
  accountingVat: () => request<VatPayload>('/api/accounting/vat'),
  accountingPeriodClose: () => request<PeriodClosePayload>('/api/accounting/period-close'),
  dashboard: (role: RoleKey) => request<DashboardResponse>(`/api/dashboard?role=${role}`),
  customers: () => request<Customer[]>('/api/customers'),
  customer: (id: string) => request<Customer>(`/api/customers/${id}`),
  customerSummary: (id: string) => request<CustomerSummary>(`/api/customers/${id}/summary`),
  products: () => request<InventoryRow[]>('/api/products'),
  suppliers: () => request<Supplier[]>('/api/suppliers'),
  purchaseOrders: () => request<PurchaseOrder[]>('/api/purchase-orders'),
  product: (id: string) => request<Product>(`/api/products/${id}`),
  quotes: () => request<Quote[]>('/api/quotes'),
  createQuote: (payload: CreateQuotePayload) => request<{ quote: QuoteDetail }>('/api/quotes', { method: 'POST', body: JSON.stringify(payload) }),
  quote: (id: string) => request<QuoteDetail>(`/api/quotes/${id}`),
  updateQuoteStatus: (id: string, status: QuoteStatus) =>
    request<{ quote: QuoteDetail }>(`/api/quotes/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
  convertQuote: (id: string) => request<QuoteConversionResult>(`/api/quotes/${id}/convert`, { method: 'POST' }),
  approveQuote: (id: string) => request<{ quote: QuoteDetail }>(`/api/quotes/${id}/approve`, { method: 'POST' }),
  invoices: () => request<Invoice[]>('/api/invoices'),
  createInvoice: (payload: CreateInvoicePayload) => request<{ invoice: InvoiceDetail }>('/api/invoices', { method: 'POST', body: JSON.stringify(payload) }),
  invoice: (id: string) => request<InvoiceDetail>(`/api/invoices/${id}`),
  sendInvoiceReminder: (id: string) => request<{ invoice: InvoiceDetail }>(`/api/invoices/${id}/reminder`, { method: 'POST' }),
  payments: () => request<Payment[]>('/api/payments'),
  createPayment: (payload: CreatePaymentPayload) => request<{ payment: Payment }>('/api/payments', { method: 'POST', body: JSON.stringify(payload) }),
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

  procurementOverview: () => request<ProcurementOverview>('/api/procurement/brain'),
  procurementReorders: () => request<ReorderCandidateRow[]>('/api/procurement/reorders'),
  procurementSuppliers: () => request<SupplierInsightRow[]>('/api/procurement/suppliers'),
  procurementPurchaseOrders: () => request<ProcurementPoRow[]>('/api/procurement/purchase-orders'),
  procurementExceptions: () => request<ProcurementExceptionRow[]>('/api/procurement/exceptions'),
  inventoryOverview: () => request<InventoryOverview>('/api/inventory/brain'),
  inventoryStockRisks: () => request<InventoryStockRiskRow[]>('/api/inventory/stock-risks'),
  inventoryTransfers: () => request<InventoryTransferRow[]>('/api/inventory/transfers'),
  inventoryMovement: () => request<InventoryMovementRow[]>('/api/inventory/movement-intelligence'),
  inventoryExceptions: () => request<InventoryExceptionRow[]>('/api/inventory/exceptions'),
  transactionOverview: (branch = 'all') => request<TransactionCoreOverview>(`/api/transaction-core/overview?branch=${encodeURIComponent(branch)}`),
  documentQueue: (branch = 'all') => request<DocumentQueueItem[]>(`/api/documents/queue?branch=${encodeURIComponent(branch)}`),
  reports: (role: RoleKey, branch = 'all') => request<ReportsResponse>(`/api/reports?role=${role}&branch=${encodeURIComponent(branch)}`),
  automationSettings: () => request<AutomationSettings>('/api/automation-settings'),
  updateAutomationSettings: (settings: AutomationSettings) => request<AutomationSettings>('/api/automation-settings', { method: 'POST', body: JSON.stringify(settings) }),
  runDayClose: (options?: { sendEmail?: boolean; date?: string; force?: boolean }) => request<{ summary: ReportsResponse; dispatch: EmailDispatch | null }>(`/api/day-close/run`, { method: 'POST', body: JSON.stringify({ trigger: 'manual', sendEmail: Boolean(options?.sendEmail), date: options?.date, force: Boolean(options?.force) }) }),
  sendSummaryEmail: (options?: { resend?: boolean }) => request<EmailDispatch>('/api/day-close/send-summary', { method: 'POST', body: JSON.stringify({ resend: Boolean(options?.resend) }) })
};
