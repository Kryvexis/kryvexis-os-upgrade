export type RoleKey = 'admin' | 'manager' | 'sales' | 'finance' | 'warehouse' | 'procurement' | 'operations' | 'executive';
export type KPI = { label: string; value: string; detail: string };
export type PanelGroup = { title: string; items: string[] };
export type Customer = {
  id: string;
  name: string;
  owner: string;
  branch: string;
  status: string;
  balance: string;
  risk: string;
  creditTerms: string;
  priceList: string;
  contact: string;
  phone: string;
  notes: string;
  nextAction: string;
  activity: string[];
};

export type Supplier = {
  id: string;
  name: string;
  category: string;
  leadTime: string;
  status: string;
  contact: string;
  nextAction: string;
};
export type PurchaseOrder = {
  id: string;
  supplier: string;
  branch: string;
  status: string;
  value: string;
  eta: string;
  buyer: string;
  nextAction: string;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  branch: string;
  status: string;
  stock: number;
  reorderAt: number;
  price: string;
  cost: string;
  supplier: string;
  barcode: string;
  variants: string;
  movementSummary: string;
  nextAction: string;
};
export type QuoteStatus = 'Draft' | 'Pending approval' | 'Approved' | 'Sent to customer' | 'Converted';
export type Quote = { id: string; customer: string; owner: string; value: string; status: string; validity: string; branch: string; trigger: string; updated: string; notes: string; nextAction: string; };
export type QuoteLine = { id: string; sku: string; description: string; qty: number; unitPrice: string; total: string; };
export type QuoteWorkflowEvent = { label: string; detail: string; };
export type ActivityEntry = {
  id: string;
  title: string;
  detail: string;
  actor: string;
  timestamp: string;
  recordType: 'quote' | 'invoice' | 'payment' | 'system' | string;
  recordId: string;
  recordPath: string;
  customerId?: string | null;
  status?: string;
};
export type QuoteDetail = Quote & {
  customerId?: string;
  subtotal: string;
  tax: string;
  total: string;
  marginBand: string;
  approvalOwner: string;
  sourceCustomerId: string;
  lines: QuoteLine[];
  workflow: QuoteWorkflowEvent[];
  activityLog: ActivityEntry[];
};
export type Invoice = { id: string; customerId?: string; customer: string; amount: string; branch: string; status: string; due: string; source: string; paymentStatus: string; tax: string; reminders: string; nextAction: string; };
export type InvoiceDetail = Invoice & {
  sourceCustomerId: string;
  sourceQuoteId: string | null;
  subtotal: string;
  total: string;
  issuedOn: string;
  lines: QuoteLine[];
  workflow: QuoteWorkflowEvent[];
  activityLog: ActivityEntry[];
};
export type Payment = {
  id: string;
  ref: string;
  customerId: string;
  party: string;
  amount: string;
  method: string;
  status: string;
  date: string;
  appliedTo: string;
  proof: string;
  nextAction: string;
  linkedInvoiceId?: string | null;
  sourceCustomerId?: string;
  activityLog?: ActivityEntry[];
};
export type NotificationType = 'approval' | 'collection' | 'payment' | 'stock' | 'general';
export type Notification = {
  id: string;
  title: string;
  meta: string;
  state: string;
  read: boolean;
  type: NotificationType | string;
  dismissed?: boolean;
  snoozedUntil?: string | null;
};
export type AutomationConfig = { closeTime: string; triggerMode: string; sendToManager: boolean; sendToExecutive: boolean; managerEmails: string[]; executiveEmails: string[]; branchManagerMap: Record<string, string>; lastRunAt: string; lastLockedDate: string; };
export type Settings = { themes: string[]; paymentModes: string[]; density: string[]; supportEmail: string; whatsapp: string; business: { currency: string; taxDefault: string; paymentTerms: string; defaultBranch: string; }; automation: AutomationConfig; };
export type Role = { key: RoleKey; label: string; description: string; dashboards: string[]; };
export type TopClient = { customerId: string; name: string; revenue: string; invoices: number; averageOrderValue: string; overdueBalance: string; trend: string; };
export type OperationalActionItem = {
  id: string;
  title: string;
  detail: string;
  owner: string;
  branch: string;
  priority: 'high' | 'medium' | 'low' | string;
  recordPath: string;
  actionLabel: string;
  status: string;
};
export type BranchSnapshot = { branch: string; approvals: number; collections: number; exceptions: number };

export type SalesTrendPoint = { label: string; actual: number; target: number };
export type UserPerformance = {
  actorName: string;
  scopeLabel: string;
  branch: string;
  yesterdaySales: string;
  dailyTarget: string;
  monthToDateSales: string;
  monthlyTarget: string;
  attainmentPercent: number;
  pipelineValue: string;
  approvalsWaiting: number;
  trend: SalesTrendPoint[];
};
export type BranchDailySales = {
  branch: string;
  yesterdaySales: string;
  dailyTarget: string;
  attainmentPercent: number;
  owner: string;
};
export type SellerPerformance = {
  name: string;
  branch: string;
  sales: string;
  target: string;
  attainmentPercent: number;
};
export type DailyEmailPreview = {
  recipients: string[];
  subject: string;
  lines: string[];
};
export type DailySummaryRow = {
  date: string;
  branch: string;
  salesTotal: string;
  posSales: string;
  invoiceSales: string;
  cashSales: string;
  cardSales: string;
  eftSales: string;
  transactions: number;
  target: string;
  variance: string;
  owner: string;
};
export type EmailDispatchLog = {
  id: string;
  sentAt: string;
  audience: string;
  recipients: string[];
  status: string;
  summary: string;
};
export type AutomationCloseRow = {
  branch: string;
  date: string;
  lockedAt: string;
  salesTotal: string;
  status: string;
  emailStatus: string;
  recipients: string[];
};
export type AutomationPanel = {
  config: AutomationConfig;
  latestClose: {
    branch: string;
    lockedAt: string;
    businessDate: string;
    emailStatus: string;
    triggerMode: string;
    recipients: string[];
    branchesClosed: number;
  } | null;
  closures: AutomationCloseRow[];
};
export type DayCloseDispatchResponse = {
  dispatch: EmailDispatchLog;
  emailPreview: DailyEmailPreview;
  automation: AutomationPanel;
};
export type ReportsResponse = {
  scope: string;
  selectedBranch: string;
  generatedAt: string;
  totals: {
    yesterdaySales: string;
    monthToDateSales: string;
    monthlyTarget: string;
    attainmentPercent: number;
  };
  branches: BranchDailySales[];
  sellers: SellerPerformance[];
  dailySummaries: DailySummaryRow[];
  emailPreview: DailyEmailPreview;
  emailDispatches: EmailDispatchLog[];
  availableBranches: string[];
  automation: AutomationPanel;
};

export type DashboardResponse = {
  role: string;
  kpis: KPI[];
  panels: PanelGroup[];
  highlights: Notification[];
  recentCustomers: Customer[];
  lowStockProducts: Product[];
  topClients: TopClient[];
  performance: UserPerformance;
  actionCenter: {
    branchSnapshots: BranchSnapshot[];
    actionQueue: OperationalActionItem[];
    auditHighlights: ActivityEntry[];
  };
};
export type PurchaseHistoryEntry = {
  id: string;
  date: string;
  type: 'invoice' | 'payment' | 'quote';
  reference: string;
  amount: string;
  status: string;
  note: string;
};
export type TopProduct = { sku: string; name: string; quantity: number; revenue: string; };
export type CustomerSummary = {
  customerId: string;
  totalSpend: string;
  invoiceCount: number;
  averageOrderValue: string;
  overdueBalance: string;
  lastPurchaseDate: string;
  lastPaymentDate: string;
  collectionStatus: string;
  topProducts: TopProduct[];
  openQuotes: Quote[];
  recentInvoices: Invoice[];
  recentPayments: Payment[];
  purchaseHistory: PurchaseHistoryEntry[];
  overdueInvoices: number;
  openBalance: string;
  accountHealth: string;
  linkedActivity: ActivityEntry[];
};
export type QuoteConversionResult = {
  quote: QuoteDetail;
  invoice: InvoiceDetail;
  reused: boolean;
};
export type EmailTemplateKind = 'quote-send' | 'invoice-reminder' | 'payment-proof';
export type EmailDraft = {
  kind: EmailTemplateKind;
  subject: string;
  to: string;
  cc?: string;
  recordId: string;
  customerName: string;
  intro: string;
  body: string[];
  closing: string;
};
