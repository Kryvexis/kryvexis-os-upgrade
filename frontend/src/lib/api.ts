import type {
  AccountingOverview,
  ActionCenterResponse,
  AutomationSettings,
  AuthSession,
  CompanyOnboardingPayload,
  CompanyProfile,
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
  InventoryOverview,
  Invoice,
  InvoiceDetail,
  JournalEntryRow,
  KPI,
  LedgerAccountRow,
  LedgerPayload,
  Notification,
  Payment,
  PeriodClosePayload,
  Product,
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
const COMPANY_PROFILE_STORAGE_KEY = 'kryvexis.company.profile';

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

function readCompanyProfile(): CompanyProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(COMPANY_PROFILE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CompanyProfile;
  } catch {
    return null;
  }
}

function writeCompanyProfile(profile: CompanyProfile | null) {
  if (typeof window === 'undefined') return;
  if (!profile) {
    window.localStorage.removeItem(COMPANY_PROFILE_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(COMPANY_PROFILE_STORAGE_KEY, JSON.stringify(profile));
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
  async signupCompany(payload: CompanyOnboardingPayload): Promise<AuthSession> {
    if (!payload.companyName.trim()) throw new Error('Please enter the company name');
    if (!payload.adminName.trim()) throw new Error('Please enter the admin full name');
    if (!payload.email.trim()) throw new Error('Please enter the admin email');
    const companyProfile: CompanyProfile = {
      companyName: payload.companyName.trim(),
      adminName: payload.adminName.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone?.trim(),
      businessType: payload.businessType?.trim(),
      currency: payload.currency,
      branchCount: payload.branchCount,
      primaryBranchId: payload.primaryBranchId,
      branches: payload.branches,
      documentBranding: {
        companyName: payload.companyName.trim(),
        logoDataUrl: payload.logoDataUrl,
        logoFileName: payload.logoFileName
      }
    };
    writeCompanyProfile(companyProfile);
    try {
      const session = await request<AuthSession>('/api/auth/company-signup', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      writeSession(session);
      return session;
    } catch (error) {
      try {
        const session = await request<AuthSession>('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({
            email: companyProfile.email,
            fullName: companyProfile.adminName,
            branchId: companyProfile.primaryBranchId,
            companyName: companyProfile.companyName,
            branches: companyProfile.branches,
            phone: companyProfile.phone,
            businessType: companyProfile.businessType,
            currency: companyProfile.currency,
            logoDataUrl: payload.logoDataUrl,
            logoFileName: payload.logoFileName
          })
        });
        writeSession(session);
        return session;
      } catch {
        if (error instanceof Error) throw error;
        throw new Error('Company signup failed');
      }
    }
  },
  async login(email: string): Promise<AuthSession> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) throw new Error('Please enter your work email');
    try {
      const session = await request<AuthSession>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail })
      });
      writeSession(session);
      return session;
    } catch {
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
    }
  },
  async logout(): Promise<void> {
    try {
      await request<void>('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore logout transport failures; still clear local session
    }
    writeSession(null);
  },
  async me(): Promise<AuthSession | null> {
    try {
      const session = await request<AuthSession>('/api/auth/me');
      writeSession(session);
      return session;
    } catch {
      return readSession();
    }
  },
  companyProfile: () => readCompanyProfile(),
  async switchBranch(branch: string): Promise<AuthSession | null> {
    const current = readSession();
    if (!current) return null;
    try {
      const next = await request<AuthSession>('/api/auth/switch-branch', {
        method: 'POST',
        body: JSON.stringify({ branchId: current.branchId ?? branch, branchName: branch })
      });
      writeSession(next);
      return next;
    } catch {
      const next = { ...current, branch };
      writeSession(next);
      return next;
    }
  },
  accountingOverview: () => request<AccountingOverview>('/api/accounting/overview'),
  actionCenter: (role?: RoleKey, branch = 'all', lane = 'all') => request<ActionCenterResponse>(`/api/action-center?${new URLSearchParams({ ...(role ? { role } : {}), branch, lane }).toString()}`),
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
  products: () => request<Product[]>('/api/products'),
  suppliers: () => request<Supplier[]>('/api/suppliers'),
  purchaseOrders: () => request<PurchaseOrder[]>('/api/purchase-orders'),
  product: (id: string) => request<Product>(`/api/products/${id}`),
  inventoryOverview: () => request<InventoryOverview>('/api/inventory/brain'),
  quotes: () => request<Quote[]>('/api/quotes'),
  quote: (id: string) => request<QuoteDetail>(`/api/quotes/${id}`),
  createQuote: (payload: CreateQuotePayload) => request<{ quote: QuoteDetail }>('/api/quotes', { method: 'POST', body: JSON.stringify(payload) }),
  updateQuoteStatus: (id: string, status: QuoteStatus) =>
    request<{ quote: QuoteDetail }>(`/api/quotes/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
  convertQuote: (id: string) => request<QuoteConversionResult>(`/api/quotes/${id}/convert`, { method: 'POST' }),
  approveQuote: (id: string) => request<{ quote: QuoteDetail }>(`/api/quotes/${id}/approve`, { method: 'POST' }),
  invoices: () => request<Invoice[]>('/api/invoices'),
  invoice: (id: string) => request<InvoiceDetail>(`/api/invoices/${id}`),
  createInvoice: (payload: CreateInvoicePayload) => request<{ invoice: InvoiceDetail }>('/api/invoices', { method: 'POST', body: JSON.stringify(payload) }),
  sendInvoiceReminder: (id: string) => request<{ invoice: InvoiceDetail }>(`/api/invoices/${id}/reminder`, { method: 'POST' }),
  payments: () => request<Payment[]>('/api/payments'),
  payment: (id: string) => request<Payment>(`/api/payments/${id}`),
  createPayment: (payload: CreatePaymentPayload) => request<{ payment: Payment }>('/api/payments', { method: 'POST', body: JSON.stringify(payload) }),
  resolvePaymentProof: (id: string) => request<{ payment: Payment }>(`/api/payments/${id}/resolve-proof`, { method: 'POST' }),
  allocatePayment: (id: string, invoiceId?: string) => request<{ payment: Payment }>(`/api/payments/${id}/allocate`, { method: 'POST', body: JSON.stringify({ invoiceId }) }),
  notifications: () => request<Notification[]>('/api/notifications'),
  markNotificationRead: (id: string, read: boolean) => request<Notification>(`/api/notifications/${id}/read`, { method: 'PATCH', body: JSON.stringify({ read }) }),
  snoozeNotification: (id: string, until: string) => request<Notification>(`/api/notifications/${id}/snooze`, { method: 'PATCH', body: JSON.stringify({ until }) }),
  dismissNotification: (id: string) => request<Notification>(`/api/notifications/${id}/dismiss`, { method: 'PATCH' }),
  emailDraft: (kind: EmailTemplateKind, id: string) => request<EmailDraft>(`/api/emails/${kind}/${id}`),
  settings: async () => {
    const settings = await request<Settings>('/api/settings');
    const companyProfile = readCompanyProfile();
    if (!companyProfile) return settings;
    return {
      ...settings,
      companyProfile: settings.companyProfile ?? companyProfile,
      documentBranding: settings.documentBranding ?? companyProfile.documentBranding ?? { companyName: companyProfile.companyName }
    } satisfies Settings;
  },
  roles: () => request<Role[]>('/api/roles'),
  procurementOverview: () => request<ProcurementOverview>('/api/procurement/brain'),
  procurementReorders: () => request<ReorderCandidateRow[]>('/api/procurement/reorders'),
  procurementSuppliers: () => request<SupplierInsightRow[]>('/api/procurement/suppliers'),
  procurementPurchaseOrders: () => request<ProcurementPoRow[]>('/api/procurement/purchase-orders'),
  procurementExceptions: () => request<ProcurementExceptionRow[]>('/api/procurement/exceptions'),
  reports: (role: RoleKey, branch = 'all') => request<ReportsResponse>(`/api/reports?role=${role}&branch=${encodeURIComponent(branch)}`),
  automationSettings: () => request<AutomationSettings>('/api/automation-settings'),
  updateAutomationSettings: (settings: AutomationSettings) => request<AutomationSettings>('/api/automation-settings', { method: 'POST', body: JSON.stringify(settings) }),
  runDayClose: (options?: { sendEmail?: boolean; date?: string; force?: boolean }) => request<{ summary: ReportsResponse; dispatch: EmailDispatch | null }>(`/api/day-close/run`, { method: 'POST', body: JSON.stringify({ trigger: 'manual', sendEmail: Boolean(options?.sendEmail), date: options?.date, force: Boolean(options?.force) }) }),
  sendSummaryEmail: (options?: { resend?: boolean }) => request<EmailDispatch>('/api/day-close/send-summary', { method: 'POST', body: JSON.stringify({ resend: Boolean(options?.resend) }) })
};
