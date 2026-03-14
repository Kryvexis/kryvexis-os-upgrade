import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbHealth, pool, runMigrations, SQL_ENABLED as ENABLE_SQL } from './lib/db.js';
import { moneyToNumber, parseRelativeDue } from './lib/format.js';
import { createCustomersRepository } from './repositories/customersRepository.js';
import { createProductsRepository } from './repositories/productsRepository.js';
import { createSuppliersRepository } from './repositories/suppliersRepository.js';
import { createQuotesRepository } from './repositories/quotesRepository.js';
import { createInvoicesRepository } from './repositories/invoicesRepository.js';
import { createPaymentsRepository } from './repositories/paymentsRepository.js';
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');
const stateFile = path.join(dataDir, 'automation-state.json');

const customersRepo = ENABLE_SQL ? createCustomersRepository(pool) : null;
const productsRepo = ENABLE_SQL ? createProductsRepository(pool) : null;
const suppliersRepo = ENABLE_SQL ? createSuppliersRepository(pool) : null;
const quotesRepo = ENABLE_SQL ? createQuotesRepository(pool) : null;
const invoicesRepo = ENABLE_SQL ? createInvoicesRepository(pool) : null;
const paymentsRepo = ENABLE_SQL ? createPaymentsRepository(pool) : null;

const roles = [
  { key: 'admin', label: 'Admin', description: 'Full platform visibility, settings, templates, automation rules, user management, audit access.', dashboards: ['system activity', 'approvals', 'branch health', 'audit highlights'] },
  { key: 'sales', label: 'Sales', description: 'Customers, quotes, invoices, statements, selected reports.', dashboards: ['quotes awaiting action', 'invoices due', 'customer balances', 'personal targets'] },
  { key: 'finance', label: 'Finance', description: 'Payments, debtors, creditors, statements, expenses, cash up.', dashboards: ['debtor aging', 'receipts today', 'overdue accounts', 'cash-up alerts'] },
  { key: 'warehouse', label: 'Warehouse', description: 'Stock, movements, transfers, low stock, goods received.', dashboards: ['low stock', 'pending transfers', 'awaiting receipt', 'delivery queue'] },
  { key: 'procurement', label: 'Procurement', description: 'Suppliers, purchase orders, reorders, supplier bills.', dashboards: ['reorder candidates', 'pending POs', 'late suppliers', 'unmatched supplier bills'] },
  { key: 'operations', label: 'Operations', description: 'Deliveries, returns, tasks, approvals, operational dashboards.', dashboards: ['open deliveries', 'returns pending', 'tasks due', 'dispatch exceptions'] },
  { key: 'manager', label: 'Manager', description: 'Branch leadership with reports, day close, staffing oversight, and branch performance.', dashboards: ['branch sales', 'cash-up status', 'daily target', 'exceptions'] },
  { key: 'executive', label: 'Executive', description: 'Cross-module dashboards, approvals, reports, branch-specific controls.', dashboards: ['branch performance', 'exceptions', 'approvals', 'growth indicators'] }
];

const customers = [
  { id: 'CUS-001', name: 'Acme Retail Group', owner: 'Rina Patel', branch: 'Johannesburg', status: 'Needs follow-up', balance: 'R27,400', risk: 'Medium', creditTerms: '30 days', priceList: 'Wholesale A', contact: 'accounts@acmeretail.co.za', phone: '+27 11 555 0144', notes: 'Payment discipline improved after the February reminder cycle.', nextAction: 'Call finance contact tomorrow', activity: ['Statement sent 2h ago', 'Invoice INV-2201 marked overdue', 'Sales follow-up scheduled for tomorrow'] },
  { id: 'CUS-002', name: 'Northline Foods', owner: 'Alex Morgan', branch: 'Cape Town', status: 'Healthy', balance: 'R8,920', risk: 'Low', creditTerms: '14 days', priceList: 'Hospitality', contact: 'payables@northlinefoods.co.za', phone: '+27 21 555 0198', notes: 'High repeat order volume and fast payment turnaround.', nextAction: 'Review March target expansion', activity: ['Invoice paid today', 'New quote requested for refrigerated stock labels'] },
  { id: 'CUS-003', name: 'Urban Build Supply', owner: 'Tariq Naidoo', branch: 'Durban', status: 'Approval watch', balance: 'R61,800', risk: 'Medium', creditTerms: '45 days', priceList: 'Construction', contact: 'ops@urbanbuild.co.za', phone: '+27 31 555 0112', notes: 'High-value quote pending approval threshold.', nextAction: 'Escalate quote approval', activity: ['Quote Q-1045 pending approval', 'Commercial terms updated yesterday'] }
];

const products = [
  { id: 'PRD-1001', sku: 'SKU-1001', name: 'Kryvexis Label Printer', branch: 'Johannesburg', status: 'Healthy', stock: 14, reorderAt: 10, price: 'R2,499', cost: 'R1,620', supplier: 'Prime Devices', barcode: '6001001001001', variants: 'Standard / Black', movementSummary: '2 units sold today', nextAction: 'Review reorder coverage next week' },
  { id: 'PRD-1021', sku: 'SKU-1021', name: 'Thermal Roll Box', branch: 'Cape Town', status: 'Low stock', stock: 8, reorderAt: 12, price: 'R380', cost: 'R210', supplier: 'Cape Paper Supply', barcode: '6001001001021', variants: '80mm / 24 pack', movementSummary: 'Threshold breached this morning', nextAction: 'Create reorder candidate in Phase 2' },
  { id: 'PRD-1033', sku: 'SKU-1033', name: 'Warehouse Scanner Dock', branch: 'Johannesburg', status: 'Healthy', stock: 21, reorderAt: 6, price: 'R1,290', cost: 'R790', supplier: 'Prime Devices', barcode: '6001001001033', variants: 'USB-C', movementSummary: 'No movement today', nextAction: 'Monitor top mover trend' }
];

const suppliers = [
  { id: 'SUP-001', name: 'Prime Devices', category: 'Hardware', leadTime: '5 days', status: 'On track', contact: 'orders@primedevices.co.za', nextAction: 'Release next scanner dock PO' },
  { id: 'SUP-002', name: 'Cape Paper Supply', category: 'Consumables', leadTime: '3 days', status: 'Attention', contact: 'dispatch@capepaper.co.za', nextAction: 'Confirm thermal roll replenishment' },
  { id: 'SUP-003', name: 'Metro Warehouse Goods', category: 'Warehouse', leadTime: '7 days', status: 'On track', contact: 'supply@metrowarehouse.co.za', nextAction: 'Review dock accessory pricing' }
];

const purchaseOrders = [
  { id: 'PO-3101', supplier: 'Cape Paper Supply', branch: 'Cape Town', status: 'Pending approval', value: 'R18,240', eta: '2026-03-15', buyer: 'Nadine Smit', nextAction: 'Approve reorder release' },
  { id: 'PO-3098', supplier: 'Prime Devices', branch: 'Johannesburg', status: 'Issued', value: 'R42,600', eta: '2026-03-17', buyer: 'Alex Morgan', nextAction: 'Track inbound scanner docks' },
  { id: 'PO-3094', supplier: 'Metro Warehouse Goods', branch: 'Durban', status: 'Goods received', value: 'R9,880', eta: '2026-03-10', buyer: 'Tariq Naidoo', nextAction: 'Match supplier bill to GRN' }
];

const quotes = [
  {
    id: 'Q-1045', customerId: 'CUS-003', customer: 'Urban Build Supply', owner: 'Alex Morgan', value: 'R62,500', status: 'Pending approval', validity: '2026-03-17', branch: 'Durban', trigger: 'High-value threshold', updated: '22 min ago', notes: 'Requires sales manager approval before sending.', nextAction: 'Finance review at 09:00 tomorrow', subtotal: 'R54,347.83', tax: 'R8,152.17', total: 'R62,500', marginBand: 'Protected margin', approvalOwner: 'Sales Manager',
    lines: [
      { id: 'QL-1', sku: 'SKU-1001', description: 'Kryvexis Label Printer', qty: 12, unitPrice: 'R2,499', total: 'R29,988' },
      { id: 'QL-2', sku: 'SKU-1021', description: 'Thermal Roll Box', qty: 45, unitPrice: 'R380', total: 'R17,100' },
      { id: 'QL-3', sku: 'SKU-1033', description: 'Warehouse Scanner Dock', qty: 12, unitPrice: 'R1,290', total: 'R15,480' }
    ],
    workflow: [
      { label: 'Drafted', detail: 'Quote created by Alex Morgan at 08:12 today' },
      { label: 'Margin review', detail: 'Protected margin confirmed on scanner dock bundle' },
      { label: 'Approval hold', detail: 'High-value threshold requires manager approval before sending' },
      { label: 'Next step', detail: 'Convert to invoice draft after approval and customer acceptance' }
    ]
  },
  {
    id: 'Q-1042', customerId: 'CUS-001', customer: 'Acme Retail Group', owner: 'Rina Patel', value: 'R18,960', status: 'Sent to customer', validity: '2026-03-15', branch: 'Johannesburg', trigger: 'None', updated: '1 hour ago', notes: 'Bundle pricing applied.', nextAction: 'Await customer response', subtotal: 'R16,486.96', tax: 'R2,473.04', total: 'R18,960', marginBand: 'Standard margin', approvalOwner: 'Not required',
    lines: [
      { id: 'QL-4', sku: 'SKU-1001', description: 'Kryvexis Label Printer', qty: 4, unitPrice: 'R2,499', total: 'R9,996' },
      { id: 'QL-5', sku: 'SKU-1021', description: 'Thermal Roll Box', qty: 12, unitPrice: 'R380', total: 'R4,560' },
      { id: 'QL-6', sku: 'SKU-1033', description: 'Warehouse Scanner Dock', qty: 3, unitPrice: 'R1,290', total: 'R3,870' }
    ],
    workflow: [
      { label: 'Drafted', detail: 'Sales owner prepared the quote this morning' },
      { label: 'Sent', detail: 'Customer received the quote and email audit logged delivery' },
      { label: 'Next step', detail: 'Watch for acceptance and convert to invoice if approved' }
    ]
  },
  {
    id: 'Q-1039', customerId: 'CUS-002', customer: 'Northline Foods', owner: 'Alex Morgan', value: 'R9,880', status: 'Draft', validity: '2026-03-20', branch: 'Cape Town', trigger: 'Margin review', updated: 'Today 08:42', notes: 'Need final confirmation on line quantities.', nextAction: 'Finish internal note check', subtotal: 'R8,591.30', tax: 'R1,288.70', total: 'R9,880', marginBand: 'Review required', approvalOwner: 'Sales Lead',
    lines: [
      { id: 'QL-7', sku: 'SKU-1021', description: 'Thermal Roll Box', qty: 20, unitPrice: 'R380', total: 'R7,600' },
      { id: 'QL-8', sku: 'SKU-1033', description: 'Warehouse Scanner Dock', qty: 2, unitPrice: 'R1,140', total: 'R2,280' }
    ],
    workflow: [
      { label: 'Drafted', detail: 'Line quantities captured for Northline Foods expansion' },
      { label: 'Review', detail: 'Waiting for internal check before customer send' }
    ]
  }
];

const invoices = [
  { id: 'INV-2201', customerId: 'CUS-001', customer: 'Acme Retail Group', amount: 'R12,440', branch: 'Johannesburg', status: 'Overdue', due: 'Due today', source: 'Q-1042', paymentStatus: 'Partially paid', tax: 'VAT standard', reminders: 'First reminder sent', nextAction: 'Finance follow-up call' },
  { id: 'INV-2196', customerId: 'CUS-002', customer: 'Northline Foods', amount: 'R4,980', branch: 'Cape Town', status: 'Issued', due: 'Due in 2 days', source: 'Manual', paymentStatus: 'Unpaid', tax: 'VAT standard', reminders: 'Scheduled at due date', nextAction: 'Wait for due date' },
  { id: 'INV-2192', customerId: 'CUS-003', customer: 'Urban Build Supply', amount: 'R28,600', branch: 'Durban', status: 'Awaiting allocation', due: 'Due in 7 days', source: 'Q-1033', paymentStatus: 'Proof received', tax: 'VAT standard', reminders: 'Not started', nextAction: 'Allocate receipt against invoice' },
  { id: 'INV-2186', customerId: 'CUS-001', customer: 'Acme Retail Group', amount: 'R15,640', branch: 'Johannesburg', status: 'Paid', due: 'Paid 5 days ago', source: 'Q-1038', paymentStatus: 'Settled', tax: 'VAT standard', reminders: 'Closed', nextAction: 'Monitor repeat order window' }
];

const payments = [
  { id: 'PAY-7701', ref: 'PAY-7701', customerId: 'CUS-001', party: 'Acme Retail Group', amount: 'R7,400', method: 'EFT', status: 'Allocated', date: 'Today 10:42', appliedTo: 'INV-2201', proof: 'Attached', nextAction: 'Check remaining overdue balance' },
  { id: 'PAY-7693', ref: 'PAY-7693', customerId: 'CUS-002', party: 'Northline Foods', amount: 'R4,980', method: 'Cash', status: 'Pending proof', date: 'Today 09:17', appliedTo: 'INV-2196', proof: 'Missing', nextAction: 'Request proof attachment' },
  { id: 'PAY-7688', ref: 'PAY-7688', customerId: 'CUS-003', party: 'Urban Build Supply', amount: 'R12,000', method: 'EFT', status: 'Unallocated', date: 'Yesterday 16:10', appliedTo: 'To be assigned', proof: 'Attached', nextAction: 'Allocate to INV-2192' },
  { id: 'PAY-7679', ref: 'PAY-7679', customerId: 'CUS-001', party: 'Acme Retail Group', amount: 'R15,640', method: 'EFT', status: 'Allocated', date: '2026-03-04', appliedTo: 'INV-2186', proof: 'Attached', nextAction: 'No action' }
];

let notifications = [
  { id: 'NT-1', title: 'Quote approval required', meta: 'Q-1045 - Sales', state: 'Pending', read: false, type: 'approval', dismissed: false, snoozedUntil: null },
  { id: 'NT-2', title: 'Invoice INV-2201 overdue', meta: 'Acme Retail Group - Finance', state: 'Urgent', read: false, type: 'collection', dismissed: false, snoozedUntil: null },
  { id: 'NT-3', title: 'Low stock threshold reached', meta: 'Thermal Roll Box - Procurement', state: 'Alert', read: true, type: 'stock', dismissed: false, snoozedUntil: null },
  { id: 'NT-4', title: 'Payment proof missing', meta: 'PAY-7693 - Finance', state: 'Action', read: false, type: 'payment', dismissed: false, snoozedUntil: null },
  { id: 'NT-5', title: 'Payment awaiting allocation', meta: 'PAY-7688 - Finance', state: 'Action', read: false, type: 'payment', dismissed: false, snoozedUntil: null }
];

const settings = {
  themes: ['dark', 'light', 'system'],
  paymentModes: ['EFT', 'Cash'],
  density: ['comfortable', 'compact'],
  supportEmail: 'kryvexissolutions@gmail.com',
  whatsapp: '+27686282874',
  business: { currency: 'ZAR', taxDefault: 'VAT Standard', paymentTerms: '30 days', defaultBranch: 'Johannesburg' }
};

const branchDirectory = [
  { id: 'JHB', name: 'Johannesburg', managerName: 'Nadine Smit', managerEmail: 'jhb.manager@kryvexis.local' },
  { id: 'CPT', name: 'Cape Town', managerName: 'Rina Patel', managerEmail: 'cpt.manager@kryvexis.local' },
  { id: 'DBN', name: 'Durban', managerName: 'Tariq Naidoo', managerEmail: 'dbn.manager@kryvexis.local' }
];

const baseAutomationSettings = {
  triggerMode: 'manual-close',
  closeTime: '18:00',
  sendToManagers: true,
  sendToExecutives: true,
  managerRecipients: ['manager@kryvexis.local'],
  executiveRecipients: ['boss@kryvexis.local'],
  defaultManagerBranch: 'Johannesburg',
  branchManagers: branchDirectory.map((branch) => ({ branch: branch.name, manager: branch.managerName, email: branch.managerEmail }))
};

const branchSalesSeed = [
  { branch: 'Johannesburg', target: 180000, totalSales: 200000, posSales: 84000, invoiceSales: 116000, cashSales: 38000, cardSales: 102000, eftSales: 60000, transactions: 48 },
  { branch: 'Cape Town', target: 160000, totalSales: 150000, posSales: 61000, invoiceSales: 89000, cashSales: 26000, cardSales: 79000, eftSales: 45000, transactions: 39 },
  { branch: 'Durban', target: 120000, totalSales: 98000, posSales: 42000, invoiceSales: 56000, cashSales: 19000, cardSales: 51000, eftSales: 28000, transactions: 31 }
];

function envelope(data, extra = {}) { return { ok: true, ...extra, data }; }
function findQuote(id) { return quotes.find((entry) => entry.id === id); }
function findInvoice(id) { return invoices.find((entry) => entry.id === id); }
function findPayment(id) { return payments.find((entry) => entry.id === id || entry.ref === id); }
function findNotification(id) { return notifications.find((entry) => entry.id === id); }
function findCustomer(id) { return customers.find((entry) => entry.id === id); }
function activeNotifications() { return notifications.filter((item) => !item.dismissed); }
function stampNow() { return 'Just now'; }
function numericAmount(value) { return Number(String(value || '').replace(/[^\d.-]/g, '')) || 0; }

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}
function defaultAutomationState() {
  return {
    automationSettings: baseAutomationSettings,
    lastClosedAt: null,
    lastClosedDate: null,
    lastSummary: null,
    lastDispatchAt: null,
    dayCloseHistory: [],
    emailDispatches: [],
    auditTrail: [],
    scheduler: { enabled: false, lastAutoRunDate: null }
  };
}
function loadAutomationState() {
  try {
    ensureDataDir();
    if (!fs.existsSync(stateFile)) {
      const initial = defaultAutomationState();
      fs.writeFileSync(stateFile, JSON.stringify(initial, null, 2));
      return initial;
    }
    const raw = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    return {
      ...defaultAutomationState(),
      ...raw,
      automationSettings: { ...baseAutomationSettings, ...(raw.automationSettings || {}) },
      dayCloseHistory: Array.isArray(raw.dayCloseHistory) ? raw.dayCloseHistory : [],
      emailDispatches: Array.isArray(raw.emailDispatches) ? raw.emailDispatches : [],
      auditTrail: Array.isArray(raw.auditTrail) ? raw.auditTrail : []
    };
  } catch (error) {
    console.error('Failed to load automation state', error);
    return defaultAutomationState();
  }
}
let automationState = loadAutomationState();
function saveAutomationState() {
  ensureDataDir();
  fs.writeFileSync(stateFile, JSON.stringify(automationState, null, 2));
}
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 })
    .format(amount).replace('ZAR', 'R').replace(/\u00a0/g, ' ');
}
function formatPct(value) {
  return `${Math.round(value)}%`;
}
function isoDateOffset(days = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function buildDailySummary(date = isoDateOffset(-1)) {
  const branches = branchSalesSeed.map((item, index) => ({
    ...item,
    date,
    varianceToTarget: item.totalSales - item.target,
    targetAchievedPct: item.target ? Math.round((item.totalSales / item.target) * 100) : 0,
    averageBasket: item.transactions ? Math.round(item.totalSales / item.transactions) : 0,
    branchId: branchDirectory[index]?.id || `BR-${index + 1}`
  }));
  const totals = branches.reduce((acc, item) => ({
    totalSales: acc.totalSales + item.totalSales,
    posSales: acc.posSales + item.posSales,
    invoiceSales: acc.invoiceSales + item.invoiceSales,
    cashSales: acc.cashSales + item.cashSales,
    cardSales: acc.cardSales + item.cardSales,
    eftSales: acc.eftSales + item.eftSales,
    transactions: acc.transactions + item.transactions,
    target: acc.target + item.target
  }), { totalSales: 0, posSales: 0, invoiceSales: 0, cashSales: 0, cardSales: 0, eftSales: 0, transactions: 0, target: 0 });
  return {
    date,
    branches,
    totals: {
      ...totals,
      varianceToTarget: totals.totalSales - totals.target,
      targetAchievedPct: totals.target ? Math.round((totals.totalSales / totals.target) * 100) : 0
    }
  };
}
function buildEmailBody(summary) {
  const lines = summary.branches.map((branch) =>
    `${branch.branch} made ${formatCurrency(branch.totalSales)} yesterday against a target of ${formatCurrency(branch.target)} (${formatPct(branch.targetAchievedPct)}).`
  );
  lines.push(`Total company sales yesterday: ${formatCurrency(summary.totals.totalSales)}.`);
  return lines.join('\n');
}
function recordPathFor(type, id) {
  if (type === 'quote') return `/quotes/${id}`;
  if (type === 'invoice') return `/invoices/${id}`;
  if (type === 'payment') return `/payments/${id}`;
  if (type === 'customer') return `/customers/${id}`;
  return '/';
}
function pushNotification(notification) {
  notifications = [notification, ...notifications];
  return notification;
}
let auditLog = [
  { id: 'AUD-1', title: 'Quote drafted', detail: 'Q-1045 prepared for Urban Build Supply with protected margin review.', actor: 'Alex Morgan', timestamp: 'Today 08:12', recordType: 'quote', recordId: 'Q-1045', recordPath: '/quotes/Q-1045', customerId: 'CUS-003', status: 'Drafted' }
];
function pushAudit(entry) {
  const normalized = { id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`, ...entry };
  auditLog = [normalized, ...auditLog];
  return normalized;
}
function operationalActionForNotification(item) {
  const source = `${item.title} ${item.meta}`.toLowerCase();
  const recordMatch = `${item.title} ${item.meta}`.match(/(Q-\d+|INV-\d+|PAY-\d+)/i);
  const recordId = recordMatch ? recordMatch[1].toUpperCase() : '';
  let recordType = 'system';
  if (recordId.startsWith('Q-')) recordType = 'quote';
  if (recordId.startsWith('INV-')) recordType = 'invoice';
  if (recordId.startsWith('PAY-')) recordType = 'payment';
  const recordPath = recordId ? recordPathFor(recordType, recordId) : '/notifications';
  const actionLabel = source.includes('approval') ? 'Review approval' : source.includes('overdue') ? 'Collect now' : source.includes('proof') ? 'Resolve proof' : source.includes('allocate') ? 'Allocate payment' : 'Open record';
  const priority = item.state === 'Urgent' ? 'high' : item.state === 'Pending' || item.state === 'Action' ? 'medium' : 'low';
  return {
    id: item.id,
    title: item.title,
    detail: item.meta,
    owner: recordType === 'quote' ? 'Sales' : recordType === 'invoice' || recordType === 'payment' ? 'Finance' : 'Operations',
    branch: recordId.startsWith('Q-') ? findQuote(recordId)?.branch || 'Unassigned' : recordId.startsWith('INV-') ? findInvoice(recordId)?.branch || 'Unassigned' : recordId.startsWith('PAY-') ? findCustomer(findPayment(recordId)?.customerId || '')?.branch || 'Unassigned' : 'System',
    priority,
    recordPath,
    actionLabel,
    status: item.state
  };
}
function buildBranchSnapshots() {
  const branches = [...new Set(customers.map((item) => item.branch))];
  return branches.map((branch) => ({
    branch,
    approvals: quotes.filter((item) => item.branch === branch && item.status === 'Pending approval').length,
    collections: invoices.filter((item) => item.branch === branch && /overdue|collections/i.test(item.status)).length,
    exceptions: payments.filter((item) => findCustomer(item.customerId)?.branch === branch && (item.status === 'Pending proof' || item.status === 'Unallocated')).length
  }));
}
const topClients = [
  { customerId: 'CUS-001', name: 'Acme Retail Group', revenue: 'R78,240', invoices: 6, averageOrderValue: 'R13,040', overdueBalance: 'R5,040', trend: 'Growing this month' },
  { customerId: 'CUS-003', name: 'Urban Build Supply', revenue: 'R63,580', invoices: 3, averageOrderValue: 'R21,193', overdueBalance: 'R12,000', trend: 'Large deal pending' },
  { customerId: 'CUS-002', name: 'Northline Foods', revenue: 'R41,920', invoices: 5, averageOrderValue: 'R8,384', overdueBalance: 'R0', trend: 'Healthy collections' }
];
const dashboardByRole = {
  admin: {
    kpis: [
      { label: 'System activity', value: '342', detail: 'Events in the last 24h' },
      { label: 'Pending approvals', value: '6', detail: 'Quotes and exceptions' },
      { label: 'Branch health', value: '92%', detail: 'Operational completion score' },
      { label: 'Unread notifications', value: '11', detail: 'Across all roles' }
    ],
    panels: [
      { title: 'Approvals queue', items: ['Q-1045 high-value quote', 'Payment exception PAY-7693', 'Role change request for Cape Town'] },
      { title: 'Audit highlights', items: ['Theme changed to system', 'Invoice template updated', 'Branch settings edited'] }
    ]
  },
  sales: {
    kpis: [
      { label: 'Quotes awaiting action', value: '9', detail: '3 need approval' },
      { label: 'Invoices due', value: 'R45,230', detail: '12 active invoices' },
      { label: 'Customer balances', value: 'R98,120', detail: 'Across key accounts' },
      { label: 'Personal target', value: '74%', detail: 'Month-to-date progress' }
    ],
    panels: [
      { title: 'Follow-up focus', items: ['Call Acme Retail Group', 'Send revised quote to Northline', 'Approve Urban Build pricing note'] },
      { title: 'Recent communications', items: ['Invoice reminder sent', 'Quote viewed by customer', 'Statement export completed'] }
    ]
  },
  finance: {
    kpis: [
      { label: 'Debtor aging', value: 'R184,900', detail: '31+ days: R42,300' },
      { label: 'Receipts today', value: 'R18,400', detail: '3 collections booked' },
      { label: 'Overdue accounts', value: '12', detail: '5 need escalation' },
      { label: 'Cash-up alerts', value: '1', detail: 'Cape Town variance pending' }
    ],
    panels: [
      { title: 'Collection actions', items: ['INV-2201 follow-up', 'Allocate PAY-7688', 'Send first reminder batch'] },
      { title: 'Approvals and exceptions', items: ['Unallocated EFT review', 'Missing proof on PAY-7693', 'Tax override awaiting confirmation'] }
    ]
  }
};

function buildDashboard(role) {
  const dashboard = dashboardByRole[role] || dashboardByRole.admin;
  const highlights = activeNotifications().slice(0, 5);
  return {
    role,
    ...dashboard,
    highlights,
    recentCustomers: customers.slice(0, 3),
    lowStockProducts: products.filter((item) => item.stock <= item.reorderAt),
    topClients,
    actionCenter: {
      branchSnapshots: buildBranchSnapshots(),
      actionQueue: activeNotifications().slice(0, 6).map(operationalActionForNotification),
      auditHighlights: auditLog.slice(0, 6)
    }
  };
}

// SQL adapter for automation/report state only.
async function ensureSqlSchema() {
  if (!pool) return;
  const schemaPath = path.join(__dirname, 'db', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(sql);
}
async function sqlGetSettings() {
  if (!pool) return null;
  const row = await pool.query('select payload from automation_settings where id = $1', ['default']);
  return row.rows[0]?.payload || null;
}
async function sqlSaveSettings(payload) {
  if (!pool) return;
  await pool.query(
    `insert into automation_settings (id, payload, updated_at)
     values ($1, $2::jsonb, now())
     on conflict (id) do update set payload = excluded.payload, updated_at = now()`,
    ['default', JSON.stringify(payload)]
  );
}
async function sqlListCloseHistory() {
  if (!pool) return [];
  const result = await pool.query('select payload from day_close_records order by closed_at desc limit 30');
  return result.rows.map((row) => row.payload);
}
async function sqlSaveCloseRecord(record) {
  if (!pool) return;
  await pool.query(
    `insert into day_close_records (id, close_date, closed_at, payload)
     values ($1, $2, $3, $4::jsonb)
     on conflict (id) do update set close_date = excluded.close_date, closed_at = excluded.closed_at, payload = excluded.payload`,
    [record.id, record.date, record.closedAt, JSON.stringify(record)]
  );
}
async function sqlListDispatches() {
  if (!pool) return [];
  const result = await pool.query('select payload from email_dispatches order by sent_at desc limit 40');
  return result.rows.map((row) => row.payload);
}
async function sqlSaveDispatch(dispatch) {
  if (!pool) return;
  await pool.query(
    `insert into email_dispatches (id, dispatch_date, sent_at, payload)
     values ($1, $2, $3, $4::jsonb)
     on conflict (id) do update set dispatch_date = excluded.dispatch_date, sent_at = excluded.sent_at, payload = excluded.payload`,
    [dispatch.id, dispatch.date, dispatch.sentAt, JSON.stringify(dispatch)]
  );
}
async function sqlListAudit() {
  if (!pool) return [];
  const result = await pool.query('select payload from audit_events order by occurred_at desc limit 80');
  return result.rows.map((row) => row.payload);
}
async function sqlSaveAudit(entry) {
  if (!pool) return;
  await pool.query(
    `insert into audit_events (id, occurred_at, action, payload)
     values ($1, $2, $3, $4::jsonb)
     on conflict (id) do nothing`,
    [entry.id, entry.occurredAt, entry.action, JSON.stringify(entry)]
  );
}
async function hydrateAutomationState() {
  if (!pool) return;
  const [settingsPayload, closes, dispatches, audit] = await Promise.all([
    sqlGetSettings(),
    sqlListCloseHistory(),
    sqlListDispatches(),
    sqlListAudit()
  ]);
  if (settingsPayload) {
    automationState.automationSettings = { ...baseAutomationSettings, ...settingsPayload };
  }
  automationState.dayCloseHistory = closes;
  automationState.emailDispatches = dispatches;
  automationState.auditTrail = audit;
  const latestClose = closes[0] || null;
  const latestDispatch = dispatches[0] || null;
  automationState.lastClosedAt = latestClose?.closedAt || null;
  automationState.lastClosedDate = latestClose?.date || null;
  automationState.lastSummary = latestClose ? { date: latestClose.date, branches: latestClose.branchSummaries, totals: deriveVisibleTotals(latestClose.branchSummaries) } : null;
  automationState.lastDispatchAt = latestDispatch?.sentAt || null;
}
async function persistAutomationState() {
  if (!pool) {
    saveAutomationState();
    return;
  }
  await Promise.all([
    sqlSaveSettings(automationState.automationSettings),
    ...automationState.dayCloseHistory.slice(0, 30).map(sqlSaveCloseRecord),
    ...automationState.emailDispatches.slice(0, 40).map(sqlSaveDispatch),
    ...automationState.auditTrail.slice(0, 80).map(sqlSaveAudit)
  ]);
}

async function logAutomationEvent({ action, status = 'info', detail, actor = 'Antonie Meyer', branch = 'All branches', date = isoDateOffset(-1) }) {
  const entry = {
    id: `AUTO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    occurredAt: new Date().toISOString(),
    actor,
    action,
    status,
    detail,
    branch,
    date
  };
  automationState.auditTrail = [entry, ...(automationState.auditTrail || [])].slice(0, 80);
  if (pool) await sqlSaveAudit(entry);
  return entry;
}

async function deliverSummaryEmail(summary, recipients) {
  const subject = `Daily Sales Summary - ${summary.date}`;
  const body = buildEmailBody(summary);
  const provider = process.env.EMAIL_PROVIDER || (process.env.RESEND_API_KEY ? 'resend' : 'log');

  if (provider === 'resend' && process.env.RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Kryvexis OS <reports@kryvexis.local>',
        to: recipients,
        subject,
        text: body
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend send failed: ${errorText}`);
    }
    const payload = await response.json();
    return { provider: 'resend', messageId: payload.id || null, subject, body };
  }

  return { provider: 'log', messageId: `LOG-${Date.now()}`, subject, body };
}
function summarizeDispatchTargets() {
  const recipients = [];
  if (automationState.automationSettings.sendToManagers) recipients.push(...automationState.automationSettings.managerRecipients);
  if (automationState.automationSettings.sendToExecutives) recipients.push(...automationState.automationSettings.executiveRecipients);
  return [...new Set(recipients.filter(Boolean))];
}
function createDispatchRecord(result, recipients, summary, options = {}) {
  return {
    id: `MAIL-${Date.now()}`,
    sentAt: new Date().toISOString(),
    recipients,
    provider: result.provider,
    subject: result.subject,
    status: options.status || 'Delivered',
    date: summary.date,
    companyTotal: summary.totals.totalSales,
    branchCount: summary.branches.length,
    resend: Boolean(options.resend),
    closedRecordId: options.closedRecordId || null
  };
}
function latestCloseRecordFor(date) {
  return automationState.dayCloseHistory.find((item) => item.date === date) || null;
}
function latestDispatchFor(date) {
  return automationState.emailDispatches.find((item) => item.date === date) || null;
}
async function runDayClose({ trigger = 'manual', sendEmail = false, date = isoDateOffset(-1), force = false, actor = 'Antonie Meyer' } = {}) {
  const existing = latestCloseRecordFor(date);
  if (existing && !force) {
    await logAutomationEvent({ action: 'Day close blocked', status: 'blocked', detail: `Close already exists for ${date}. Use force to rerun.`, actor, date, branch: existing.branchSummaries?.map((item) => item.branch).join(', ') || 'All branches' });
    await persistAutomationState();
    throw new Error(`Day close for ${date} already exists. Use rerun confirmation to replace it.`);
  }

  const summary = buildDailySummary(date);
  const closeId = existing?.id || `CLOSE-${Date.now()}`;
  const closedAt = new Date().toISOString();
  const record = {
    id: closeId,
    closedAt,
    trigger,
    date,
    totalSales: summary.totals.totalSales,
    varianceToTarget: summary.totals.varianceToTarget,
    sentStatus: 'pending',
    sentAt: null,
    closedBy: actor,
    emailDispatchId: null,
    branchSummaries: summary.branches
  };

  automationState.lastClosedAt = closedAt;
  automationState.lastClosedDate = date;
  automationState.lastSummary = summary;
  automationState.dayCloseHistory = [record, ...automationState.dayCloseHistory.filter((item) => item.date !== date)].slice(0, 30);
  await logAutomationEvent({ action: existing ? 'Day close rerun' : 'Day close completed', status: 'success', detail: `${date} closed at ${formatCurrency(summary.totals.totalSales)}.`, actor, date, branch: summary.branches.map((item) => item.branch).join(', ') });

  let dispatch = null;
  if (sendEmail) {
    const recipients = summarizeDispatchTargets();
    const result = await deliverSummaryEmail(summary, recipients);
    dispatch = createDispatchRecord(result, recipients, summary, { closedRecordId: closeId });
    automationState.lastDispatchAt = dispatch.sentAt;
    automationState.emailDispatches = [dispatch, ...automationState.emailDispatches.filter((item) => item.id !== dispatch.id)].slice(0, 40);
    automationState.dayCloseHistory = automationState.dayCloseHistory.map((item) => item.id === closeId ? { ...item, sentStatus: 'sent', sentAt: dispatch.sentAt, emailDispatchId: dispatch.id } : item);
    await logAutomationEvent({ action: existing ? 'Summary resent from rerun' : 'Summary email sent', status: 'success', detail: `Daily summary sent to ${recipients.join(', ') || 'no recipients configured'}.`, actor, date, branch: summary.branches.map((item) => item.branch).join(', ') });
  }

  await persistAutomationState();
  return { summary, dispatch };
}
async function sendLatestSummary({ resend = false, actor = 'Antonie Meyer' } = {}) {
  const summary = automationState.lastSummary || buildDailySummary();
  const closeRecord = latestCloseRecordFor(summary.date);
  if (!closeRecord) {
    await logAutomationEvent({ action: 'Summary send blocked', status: 'blocked', detail: `No day close exists for ${summary.date}.`, actor, date: summary.date });
    await persistAutomationState();
    throw new Error('Run day close before sending a summary email.');
  }
  if (closeRecord.sentStatus === 'sent' && !resend) {
    await logAutomationEvent({ action: 'Duplicate summary blocked', status: 'blocked', detail: `Summary already sent for ${summary.date}. Use resend to send again.`, actor, date: summary.date, branch: closeRecord.branchSummaries.map((item) => item.branch).join(', ') });
    await persistAutomationState();
    throw new Error(`Summary already sent for ${summary.date}. Use resend summary if you need to send it again.`);
  }
  const recipients = summarizeDispatchTargets();
  const result = await deliverSummaryEmail(summary, recipients);
  const dispatch = createDispatchRecord(result, recipients, summary, { resend, closedRecordId: closeRecord.id });
  automationState.lastDispatchAt = dispatch.sentAt;
  automationState.emailDispatches = [dispatch, ...automationState.emailDispatches].slice(0, 40);
  automationState.dayCloseHistory = automationState.dayCloseHistory.map((item) => item.id === closeRecord.id ? { ...item, sentStatus: 'sent', sentAt: dispatch.sentAt, emailDispatchId: dispatch.id } : item);
  await logAutomationEvent({ action: resend ? 'Summary resent' : 'Summary email sent', status: 'success', detail: `Summary email ${resend ? 'resent' : 'sent'} to ${recipients.join(', ') || 'no recipients configured'}.`, actor, date: summary.date, branch: closeRecord.branchSummaries.map((item) => item.branch).join(', ') });
  await persistAutomationState();
  return dispatch;
}
function deriveVisibleTotals(branches) {
  const totals = branches.reduce((acc, item) => ({
    totalSales: acc.totalSales + item.totalSales,
    posSales: acc.posSales + item.posSales,
    invoiceSales: acc.invoiceSales + item.invoiceSales,
    cashSales: acc.cashSales + item.cashSales,
    cardSales: acc.cardSales + item.cardSales,
    eftSales: acc.eftSales + item.eftSales,
    transactions: acc.transactions + item.transactions,
    target: acc.target + item.target
  }), { totalSales: 0, posSales: 0, invoiceSales: 0, cashSales: 0, cardSales: 0, eftSales: 0, transactions: 0, target: 0 });
  return {
    ...totals,
    varianceToTarget: totals.totalSales - totals.target,
    targetAchievedPct: totals.target ? Math.round((totals.totalSales / totals.target) * 100) : 0
  };
}
function buildReportPayload(role = 'admin', branch = 'all') {
  const summary = automationState.lastSummary || buildDailySummary();
  const allowedBranch = role === 'manager' ? automationState.automationSettings.defaultManagerBranch || 'Johannesburg' : branch;
  const visibleBranches = allowedBranch && allowedBranch !== 'all' ? summary.branches.filter((item) => item.branch === allowedBranch) : summary.branches;
  const totals = deriveVisibleTotals(visibleBranches);
  const sellerBoard = [
    { name: 'Alex Morgan', branch: 'Johannesburg', sales: 84000, target: 90000 },
    { name: 'Rina Patel', branch: 'Cape Town', sales: 72500, target: 80000 },
    { name: 'Tariq Naidoo', branch: 'Durban', sales: 48800, target: 65000 }
  ].filter((item) => allowedBranch === 'all' || !allowedBranch || item.branch === allowedBranch);
  const closeRecord = latestCloseRecordFor(summary.date);
  const lastDispatch = latestDispatchFor(summary.date);
  const branchCloseHistory = automationState.dayCloseHistory
    .flatMap((record) => (record.branchSummaries || []).map((item) => ({
      recordId: record.id,
      branch: item.branch,
      date: record.date,
      closedAt: record.closedAt,
      totalSales: item.totalSales,
      varianceToTarget: item.varianceToTarget,
      sentStatus: record.sentStatus
    })))
    .filter((item) => allowedBranch === 'all' || !allowedBranch || item.branch === allowedBranch)
    .slice(0, 30);

  return {
    scope: role === 'manager' ? allowedBranch : branch,
    date: summary.date,
    canViewAllBranches: role === 'admin' || role === 'executive',
    visibleBranches,
    totals,
    sellerBoard,
    emailPreview: {
      subject: `Daily Sales Summary - ${summary.date}`,
      body: buildEmailBody({ ...summary, branches: visibleBranches.length ? visibleBranches : summary.branches, totals })
    },
    emailDispatches: automationState.emailDispatches.filter((item) => allowedBranch === 'all' || !allowedBranch || closeRecord?.branchSummaries?.some((branchItem) => branchItem.branch === allowedBranch && item.closedRecordId === closeRecord.id)).slice(0, 20),
    dayCloseHistory: automationState.dayCloseHistory.filter((item) => allowedBranch === 'all' || !allowedBranch || item.branchSummaries.some((branchItem) => branchItem.branch === allowedBranch)).slice(0, 20),
    branchCloseHistory,
    automation: automationState.automationSettings,
    closeStatus: {
      date: summary.date,
      state: closeRecord ? 'closed' : 'open',
      label: closeRecord ? 'Closed' : 'Open',
      lastClosedAt: closeRecord?.closedAt || null,
      lastClosedBy: closeRecord?.closedBy || null,
      recordId: closeRecord?.id || null
    },
    sendStatus: {
      state: closeRecord ? (closeRecord.sentStatus === 'sent' ? 'sent' : 'pending') : 'not-ready',
      label: closeRecord ? (closeRecord.sentStatus === 'sent' ? 'Sent' : 'Pending send') : 'Close required',
      lastSentAt: lastDispatch?.sentAt || closeRecord?.sentAt || null,
      duplicateBlocked: Boolean(closeRecord && closeRecord.sentStatus === 'sent'),
      lastDispatchId: lastDispatch?.id || closeRecord?.emailDispatchId || null
    },
    auditTrail: (automationState.auditTrail || []).filter((item) => allowedBranch === 'all' || !allowedBranch || item.branch.includes(allowedBranch)).slice(0, 20)
  };
}

function collectActivity({ recordType, recordId, customerId }) {
  return auditLog
    .filter((entry) => (recordType ? entry.recordType === recordType && entry.recordId === recordId : false) || (customerId ? entry.customerId === customerId : false))
    .filter((entry, index, list) => list.findIndex((check) => check.id === entry.id) === index)
    .slice(0, 8);
}
function buildQuoteDetail(quote) {
  return {
    ...quote,
    sourceCustomerId: quote.customerId,
    activityLog: collectActivity({ recordType: 'quote', recordId: quote.id, customerId: quote.customerId })
  };
}
function buildInvoiceDetail(invoice) {
  const sourceQuote = quotes.find((item) => item.id === invoice.source);
  const lines = sourceQuote?.lines ?? [];
  const workflow = [
    { label: 'Created', detail: invoice.status === 'Draft' ? `Invoice draft created from ${invoice.source}` : `Invoice recorded from ${invoice.source}` },
    { label: 'Payment state', detail: invoice.paymentStatus },
    { label: 'Reminders', detail: invoice.reminders },
    { label: 'Next action', detail: invoice.nextAction }
  ];
  if (sourceQuote) {
    workflow.unshift({ label: 'Source quote', detail: `${sourceQuote.id} was converted for ${sourceQuote.customer}` });
  }
  return {
    ...invoice,
    sourceCustomerId: invoice.customerId,
    sourceQuoteId: sourceQuote?.id ?? null,
    subtotal: sourceQuote?.subtotal ?? invoice.amount,
    total: sourceQuote?.total ?? invoice.amount,
    issuedOn: 'Today',
    lines,
    workflow,
    activityLog: collectActivity({ recordType: 'invoice', recordId: invoice.id, customerId: invoice.customerId })
  };
}
function buildPaymentDetail(payment) {
  const linkedInvoiceId = payment.appliedTo.startsWith('INV-') ? payment.appliedTo : null;
  return {
    ...payment,
    linkedInvoiceId,
    sourceCustomerId: payment.customerId,
    activityLog: collectActivity({ recordType: 'payment', recordId: payment.id, customerId: payment.customerId })
  };
}
const baseCustomerSummaries = {
  'CUS-001': {
    customerId: 'CUS-001', totalSpend: 'R78,240', invoiceCount: 6, averageOrderValue: 'R13,040', overdueBalance: 'R5,040', lastPurchaseDate: '2026-03-09', lastPaymentDate: 'Today 10:42', collectionStatus: '1 overdue invoice needs follow-up',
    topProducts: [
      { sku: 'SKU-1001', name: 'Kryvexis Label Printer', quantity: 18, revenue: 'R44,982' },
      { sku: 'SKU-1021', name: 'Thermal Roll Box', quantity: 56, revenue: 'R21,280' },
      { sku: 'SKU-1033', name: 'Warehouse Scanner Dock', quantity: 9, revenue: 'R11,610' }
    ],
    purchaseHistory: [
      { id: 'PH-1', date: '2026-03-10', type: 'payment', reference: 'PAY-7701', amount: 'R7,400', status: 'Allocated', note: 'Part-payment allocated to INV-2201' }
    ]
  }
};
function buildCustomerSummary(id) {
  const base = baseCustomerSummaries[id];
  const customer = findCustomer(id);
  if (!base || !customer) return null;
  const recentInvoices = invoices.filter((item) => item.customerId === id).slice(0, 3);
  const recentPayments = payments.filter((item) => item.customerId === id).slice(0, 3);
  const openQuotes = quotes.filter((item) => item.customerId === id && item.status !== 'Converted');
  const overdueInvoices = invoices.filter((item) => item.customerId === id && /overdue|collections/i.test(item.status)).length;
  const overdueAmount = numericAmount(base.overdueBalance);
  const openBalance = customer.balance;
  const health = overdueAmount > 10000 ? 'At risk' : customer.risk === 'Low' ? 'Healthy' : 'Needs attention';
  const linkedActivity = collectActivity({ customerId: id }).slice(0, 10);
  return { ...base, openQuotes, recentInvoices, recentPayments, overdueInvoices, openBalance, accountHealth: health, linkedActivity };
}

function listRoute(routePath, collection) {
  app.get(`/api/${routePath}`, (_req, res) => res.json(envelope(collection)));
  app.get(`/api/${routePath}/:id`, (req, res) => {
    const item = collection.find((entry) => entry.id === req.params.id || entry.ref === req.params.id || entry.sku === req.params.id);
    if (!item) return res.status(404).json({ ok: false, error: `${routePath} item not found` });
    return res.json(envelope(item));
  });
}

app.get('/', (_req, res) => res.json({ ok: true, service: 'kryvexis-os-api', status: 'running', phase: 'SQL-A1' }));
app.get('/health', async (_req, res) => {
  try {
    const sql = await dbHealth();
    return res.json({ status: 'ok', phase: 'SQL-A1', service: 'kryvexis-os-api', sqlAutomation: ENABLE_SQL, db: sql });
  } catch (error) {
    return res.status(500).json({ status: 'error', service: 'kryvexis-os-api', sqlAutomation: ENABLE_SQL, error: error.message || 'db health failed' });
  }
});
app.get('/api/bootstrap', (_req, res) => res.json(envelope({ roles, themeOptions: settings.themes, support: { email: settings.supportEmail, whatsapp: settings.whatsapp } })));
app.get('/api/dashboard', (req, res) => {
  const role = req.query.role || 'admin';
  res.json(envelope(buildDashboard(role)));
});
app.get('/api/customers/:id/summary', async (req, res) => {
  const summary = buildCustomerSummary(req.params.id);
  if (!summary) return res.status(404).json({ ok: false, error: 'customer summary not found' });
  return res.json(envelope(summary));
});
app.get('/api/quotes', async (_req, res) => {
  const data = ENABLE_SQL ? await quotesRepo.listView() : quotes;
  return res.json(envelope(data));
});
app.get('/api/quotes/:id', async (req, res) => {
  const quote = ENABLE_SQL ? await quotesRepo.detail(req.params.id) : findQuote(req.params.id);
  if (!quote) return res.status(404).json({ ok: false, error: 'quote item not found' });
  return res.json(envelope(buildQuoteDetail(quote)));
});
app.get('/api/invoices', async (_req, res) => {
  const data = ENABLE_SQL ? await invoicesRepo.listView() : invoices;
  return res.json(envelope(data));
});
app.get('/api/invoices/:id', async (req, res) => {
  const invoice = ENABLE_SQL ? await invoicesRepo.detail(req.params.id) : findInvoice(req.params.id);
  if (!invoice) return res.status(404).json({ ok: false, error: 'invoice item not found' });
  return res.json(envelope(buildInvoiceDetail(invoice)));
});
app.get('/api/payments', async (_req, res) => {
  const data = ENABLE_SQL ? await paymentsRepo.listView() : payments;
  return res.json(envelope(data));
});
app.get('/api/payments/:id', async (req, res) => {
  const payment = ENABLE_SQL ? await paymentsRepo.detail(req.params.id) : findPayment(req.params.id);
  if (!payment) return res.status(404).json({ ok: false, error: 'payment item not found' });
  return res.json(envelope(buildPaymentDetail(payment)));
});
app.get('/api/notifications', (_req, res) => res.json(envelope(activeNotifications())));
app.patch('/api/notifications/:id/read', (req, res) => {
  const notification = findNotification(req.params.id);
  if (!notification) return res.status(404).json({ ok: false, error: 'notification not found' });
  notification.read = Boolean(req.body?.read);
  if (notification.read && notification.state === 'Pending') notification.state = 'Seen';
  return res.json(envelope(notification));
});
app.patch('/api/notifications/:id/snooze', (req, res) => {
  const notification = findNotification(req.params.id);
  if (!notification) return res.status(404).json({ ok: false, error: 'notification not found' });
  notification.read = true;
  notification.state = 'Snoozed';
  notification.snoozedUntil = req.body?.until || 'later';
  notification.meta = `${notification.meta} • snoozed until ${notification.snoozedUntil}`;
  pushAudit({ title: 'Notification snoozed', detail: `${notification.title} snoozed until ${notification.snoozedUntil}.`, actor: 'Ops Desk', timestamp: stampNow(), recordType: 'system', recordId: notification.id, recordPath: '/notifications', customerId: null, status: 'Snoozed' });
  return res.json(envelope(notification));
});
app.patch('/api/notifications/:id/dismiss', (req, res) => {
  const notification = findNotification(req.params.id);
  if (!notification) return res.status(404).json({ ok: false, error: 'notification not found' });
  notification.dismissed = true;
  pushAudit({ title: 'Notification dismissed', detail: `${notification.title} removed from active inbox.`, actor: 'Ops Desk', timestamp: stampNow(), recordType: 'system', recordId: notification.id, recordPath: '/notifications', customerId: null, status: 'Dismissed' });
  return res.json(envelope(notification));
});
app.post('/api/quotes/:id/status', (req, res) => {
  const quote = findQuote(req.params.id);
  if (!quote) return res.status(404).json({ ok: false, error: 'quote item not found' });
  const nextStatus = req.body?.status;
  const allowed = ['Draft', 'Pending approval', 'Approved', 'Sent to customer', 'Converted'];
  if (!allowed.includes(nextStatus)) return res.status(400).json({ ok: false, error: 'unsupported quote status' });
  if (quote.status === 'Converted') return res.status(400).json({ ok: false, error: 'converted quotes are locked' });
  quote.status = nextStatus;
  quote.updated = stampNow();
  quote.nextAction = nextStatus === 'Approved' ? 'Mark as sent or convert to invoice' : nextStatus === 'Sent to customer' ? 'Convert to invoice after customer confirmation' : nextStatus === 'Pending approval' ? 'Manager review required before send' : 'Continue internal review';
  quote.workflow.push({ label: 'Status update', detail: `Quote moved to ${nextStatus}` });
  pushAudit({ title: 'Quote status changed', detail: `${quote.id} moved to ${nextStatus}.`, actor: quote.owner, timestamp: stampNow(), recordType: 'quote', recordId: quote.id, recordPath: recordPathFor('quote', quote.id), customerId: quote.customerId, status: nextStatus });
  return res.json(envelope({ quote: buildQuoteDetail(quote) }));
});
app.post('/api/quotes/:id/approve', (req, res) => {
  const quote = findQuote(req.params.id);
  if (!quote) return res.status(404).json({ ok: false, error: 'quote item not found' });
  quote.status = 'Approved';
  quote.updated = stampNow();
  quote.nextAction = 'Mark as sent or convert to invoice';
  quote.workflow.push({ label: 'Approved', detail: 'Approved from inbox or record action controls' });
  pushAudit({ title: 'Quote approved', detail: `${quote.id} approved for ${quote.customer}.`, actor: 'Sales Manager', timestamp: stampNow(), recordType: 'quote', recordId: quote.id, recordPath: recordPathFor('quote', quote.id), customerId: quote.customerId, status: 'Approved' });
  pushNotification({ id: `NT-${Date.now()}`, title: `Quote ${quote.id} approved`, meta: `${quote.customer} - Sales`, state: 'New', read: false, type: 'approval', dismissed: false, snoozedUntil: null });
  return res.json(envelope({ quote: buildQuoteDetail(quote) }));
});
app.post('/api/quotes/:id/convert', (req, res) => {
  const quote = findQuote(req.params.id);
  if (!quote) return res.status(404).json({ ok: false, error: 'quote item not found' });
  const existingInvoice = invoices.find((entry) => entry.source === quote.id);
  if (existingInvoice) return res.json(envelope({ quote: buildQuoteDetail(quote), invoice: buildInvoiceDetail(existingInvoice), reused: true }));
  if (!['Approved', 'Sent to customer'].includes(quote.status)) {
    return res.status(400).json({ ok: false, error: 'quote must be approved or sent before conversion' });
  }
  const nextId = 2200 + invoices.length + 1;
  const invoice = { id: `INV-${nextId}`, customerId: quote.customerId, customer: quote.customer, amount: quote.total, branch: quote.branch, status: 'Draft', due: 'Due in 30 days', source: quote.id, paymentStatus: 'Unpaid', tax: 'VAT standard', reminders: 'Not started', nextAction: 'Review invoice draft and issue to customer' };
  invoices.unshift(invoice);
  quote.status = 'Converted';
  quote.updated = stampNow();
  quote.nextAction = `Invoice ${invoice.id} ready for review`;
  quote.workflow.push({ label: 'Converted', detail: `Invoice ${invoice.id} created from this quote` });
  pushAudit({ title: 'Quote converted', detail: `${quote.id} converted to invoice ${invoice.id}.`, actor: quote.owner, timestamp: stampNow(), recordType: 'quote', recordId: quote.id, recordPath: recordPathFor('quote', quote.id), customerId: quote.customerId, status: 'Converted' });
  pushAudit({ title: 'Invoice created', detail: `${invoice.id} created from quote ${quote.id}.`, actor: quote.owner, timestamp: stampNow(), recordType: 'invoice', recordId: invoice.id, recordPath: recordPathFor('invoice', invoice.id), customerId: quote.customerId, status: 'Draft' });
  return res.json(envelope({ quote: buildQuoteDetail(quote), invoice: buildInvoiceDetail(invoice), reused: false }));
});
app.post('/api/invoices/:id/reminder', (req, res) => {
  const invoice = findInvoice(req.params.id);
  if (!invoice) return res.status(404).json({ ok: false, error: 'invoice item not found' });
  invoice.reminders = 'Reminder sent today';
  invoice.nextAction = 'Await customer payment response';
  pushAudit({ title: 'Reminder sent', detail: `Reminder sent for ${invoice.id}.`, actor: 'Finance Team', timestamp: stampNow(), recordType: 'invoice', recordId: invoice.id, recordPath: recordPathFor('invoice', invoice.id), customerId: invoice.customerId, status: invoice.status });
  pushNotification({ id: `NT-${Date.now()}`, title: `Reminder sent for ${invoice.id}`, meta: `${invoice.customer} - Finance`, state: 'Done', read: true, type: 'collection', dismissed: false, snoozedUntil: null });
  return res.json(envelope({ invoice: buildInvoiceDetail(invoice) }));
});
app.post('/api/payments/:id/resolve-proof', (req, res) => {
  const payment = findPayment(req.params.id);
  if (!payment) return res.status(404).json({ ok: false, error: 'payment item not found' });
  payment.proof = 'Attached and verified';
  payment.status = payment.appliedTo && payment.appliedTo !== 'To be assigned' ? 'Ready to allocate' : 'Unallocated';
  payment.nextAction = payment.status === 'Ready to allocate' ? `Allocate against ${payment.appliedTo}` : 'Allocate to open invoice';
  pushAudit({ title: 'Payment proof resolved', detail: `${payment.ref} proof verified and ready for next finance step.`, actor: 'Finance Team', timestamp: stampNow(), recordType: 'payment', recordId: payment.id, recordPath: recordPathFor('payment', payment.id), customerId: payment.customerId, status: payment.status });
  pushNotification({ id: `NT-${Date.now()}`, title: `Payment proof resolved`, meta: `${payment.ref} - Finance`, state: 'Done', read: true, type: 'payment', dismissed: false, snoozedUntil: null });
  return res.json(envelope({ payment: buildPaymentDetail(payment) }));
});
app.post('/api/payments/:id/allocate', (req, res) => {
  const payment = findPayment(req.params.id);
  if (!payment) return res.status(404).json({ ok: false, error: 'payment item not found' });
  const invoiceId = req.body?.invoiceId || invoices.find((entry) => entry.customerId === payment.customerId && entry.status !== 'Paid')?.id;
  if (!invoiceId) return res.status(400).json({ ok: false, error: 'no invoice available for allocation' });
  payment.appliedTo = invoiceId;
  payment.status = 'Allocated';
  payment.nextAction = 'Allocation complete';
  const invoice = findInvoice(invoiceId);
  if (invoice) {
    invoice.paymentStatus = 'Allocated receipt';
    invoice.status = invoice.status === 'Overdue' ? 'Collections in progress' : invoice.status;
    invoice.nextAction = `Payment ${payment.ref} allocated`;
    pushAudit({ title: 'Invoice updated from payment', detail: `${invoice.id} now reflects allocation from ${payment.ref}.`, actor: 'Finance Team', timestamp: stampNow(), recordType: 'invoice', recordId: invoice.id, recordPath: recordPathFor('invoice', invoice.id), customerId: invoice.customerId, status: invoice.status });
  }
  pushAudit({ title: 'Payment allocated', detail: `${payment.ref} allocated to ${invoiceId}.`, actor: 'Finance Team', timestamp: stampNow(), recordType: 'payment', recordId: payment.id, recordPath: recordPathFor('payment', payment.id), customerId: payment.customerId, status: 'Allocated' });
  pushNotification({ id: `NT-${Date.now()}`, title: `Payment ${payment.ref} allocated`, meta: `${invoiceId} - Finance`, state: 'Done', read: true, type: 'payment', dismissed: false, snoozedUntil: null });
  return res.json(envelope({ payment: buildPaymentDetail(payment) }));
});
function buildEmailDraft(kind, id) {
  if (kind === 'quote-send') {
    const quote = findQuote(id);
    if (!quote) return null;
    const customer = findCustomer(quote.customerId);
    return {
      kind,
      subject: `Quote ${quote.id} from Kryvexis OS`,
      to: customer?.contact || 'client@example.com',
      recordId: quote.id,
      customerName: quote.customer,
      intro: `Hi ${quote.customer},`,
      body: [
        `Please find quote ${quote.id} prepared for your review with a total value of ${quote.total}.`,
        `The quote is valid until ${quote.validity} and covers the requested items for the ${quote.branch} branch workflow.`,
        `Reply to this email if you would like us to proceed or adjust any line items before confirmation.`
      ],
      closing: `Regards,\n${quote.owner}\nKryvexis Solutions`
    };
  }
  if (kind === 'invoice-reminder') {
    const invoice = findInvoice(id);
    if (!invoice) return null;
    const customer = findCustomer(invoice.customerId);
    return {
      kind,
      subject: `Reminder: invoice ${invoice.id} is due`,
      to: customer?.contact || 'accounts@example.com',
      recordId: invoice.id,
      customerName: invoice.customer,
      intro: `Hi ${invoice.customer},`,
      body: [
        `This is a friendly reminder regarding invoice ${invoice.id} for ${invoice.amount}.`,
        `The invoice is currently marked as ${invoice.status.toLowerCase()} and the due status is ${invoice.due}.`,
        `If payment has already been made, please send proof of payment so our finance team can update the record immediately.`
      ],
      closing: `Regards,\nFinance Team\nKryvexis Solutions`
    };
  }
  if (kind === 'payment-proof') {
    const payment = findPayment(id);
    if (!payment) return null;
    const customer = findCustomer(payment.customerId);
    return {
      kind,
      subject: `Follow-up: payment ${payment.ref} proof required`,
      to: customer?.contact || 'finance@example.com',
      recordId: payment.id,
      customerName: payment.party,
      intro: `Hi ${payment.party},`,
      body: [
        `We have recorded payment ${payment.ref} for ${payment.amount} via ${payment.method}.`,
        `Our team still needs the supporting proof so we can complete allocation against ${payment.appliedTo}.`,
        `Please reply with the payment confirmation at your earliest convenience so we can close the finance action.`
      ],
      closing: `Regards,\nFinance Team\nKryvexis Solutions`
    };
  }
  return null;
}

app.get('/api/customers', async (_req, res) => {
  const data = ENABLE_SQL ? await customersRepo.listView() : customers;
  return res.json(envelope(data));
});
app.get('/api/customers/:id', async (req, res) => {
  const item = ENABLE_SQL ? await customersRepo.detail(req.params.id) : findCustomer(req.params.id);
  if (!item) return res.status(404).json({ ok: false, error: 'customers item not found' });
  return res.json(envelope(item));
});
app.get('/api/products', async (_req, res) => {
  const data = ENABLE_SQL ? await productsRepo.listView() : products;
  return res.json(envelope(data));
});
app.get('/api/products/:id', async (req, res) => {
  const item = ENABLE_SQL ? await productsRepo.detail(req.params.id) : products.find((entry) => entry.id === req.params.id);
  if (!item) return res.status(404).json({ ok: false, error: 'products item not found' });
  return res.json(envelope(item));
});
app.get('/api/suppliers', async (_req, res) => {
  const data = ENABLE_SQL ? await suppliersRepo.listView() : suppliers;
  return res.json(envelope(data));
});
app.get('/api/suppliers/:id', async (req, res) => {
  const item = ENABLE_SQL ? await suppliersRepo.detail(req.params.id) : suppliers.find((entry) => entry.id === req.params.id);
  if (!item) return res.status(404).json({ ok: false, error: 'suppliers item not found' });
  return res.json(envelope(item));
});
listRoute('purchase-orders', purchaseOrders);
app.get('/api/emails/:kind/:id', (req, res) => {
  const draft = buildEmailDraft(req.params.kind, req.params.id);
  if (!draft) return res.status(404).json({ ok: false, error: 'email draft not found' });
  return res.json(envelope(draft));
});
app.get('/api/reports', async (req, res) => {
  if (pool) await hydrateAutomationState();
  const role = String(req.query.role || 'admin');
  const branch = String(req.query.branch || 'all');
  return res.json(envelope(buildReportPayload(role, branch)));
});
app.get('/api/automation-settings', async (_req, res) => {
  if (pool) await hydrateAutomationState();
  return res.json(envelope(automationState.automationSettings));
});
app.post('/api/automation-settings', async (req, res) => {
  automationState.automationSettings = {
    ...automationState.automationSettings,
    ...req.body,
    managerRecipients: Array.isArray(req.body.managerRecipients) ? req.body.managerRecipients : automationState.automationSettings.managerRecipients,
    executiveRecipients: Array.isArray(req.body.executiveRecipients) ? req.body.executiveRecipients : automationState.automationSettings.executiveRecipients
  };
  await logAutomationEvent({ action: 'Automation settings updated', status: 'info', detail: 'Recipient rules or close cadence were updated.', actor: 'Antonie Meyer', date: isoDateOffset(0) });
  await persistAutomationState();
  return res.json(envelope(automationState.automationSettings));
});
app.post('/api/day-close/run', async (req, res) => {
  try {
    if (pool) await hydrateAutomationState();
    const result = await runDayClose({ trigger: req.body?.trigger || 'manual', sendEmail: Boolean(req.body?.sendEmail), date: req.body?.date || isoDateOffset(-1), force: Boolean(req.body?.force), actor: req.body?.actor || 'Antonie Meyer' });
    return res.json(envelope(result));
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'day close failed' });
  }
});
app.post('/api/day-close/send-summary', async (req, res) => {
  try {
    if (pool) await hydrateAutomationState();
    const dispatch = await sendLatestSummary({ resend: Boolean(req.body?.resend), actor: req.body?.actor || 'Antonie Meyer' });
    return res.json(envelope(dispatch));
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'email send failed' });
  }
});
app.get('/api/settings', async (_req, res) => {
  if (pool) await hydrateAutomationState();
  return res.json(envelope({ ...settings, automation: automationState.automationSettings }));
});
app.get('/api/roles', (_req, res) => res.json(envelope(roles)));


function branchIdByName(name) {
  const match = { Johannesburg: 'JHB', 'Cape Town': 'CPT', Durban: 'DBN' }[name];
  return match || null;
}

async function getTableColumns(tableName) {
  if (!pool) return new Set();
  const result = await pool.query(
    `select column_name from information_schema.columns where table_schema = 'public' and table_name = $1`,
    [tableName]
  );
  return new Set(result.rows.map((row) => row.column_name));
}

async function upsertSeedOrganization() {
  const columns = await getTableColumns('organizations');
  if (!columns.size) return;

  const values = { id: 'ORG-1' };
  if (columns.has('name')) values.name = 'Kryvexis';
  if (columns.has('legal_name')) values.legal_name = 'Kryvexis';
  if (columns.has('trading_name')) values.trading_name = 'Kryvexis';
  if (columns.has('country_code')) values.country_code = 'ZA';
  if (columns.has('currency_code')) values.currency_code = 'ZAR';

  const keys = Object.keys(values);
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
  const updates = keys
    .filter((key) => key !== 'id')
    .map((key) => `${key} = excluded.${key}`)
    .join(', ');

  await pool.query(
    `insert into organizations (${keys.join(', ')}) values (${placeholders}) on conflict (id) do update set ${updates || 'id = excluded.id'}`,
    keys.map((key) => values[key])
  );
}


async function insertCompatible(tableName, values, options = {}) {
  const columns = await getTableColumns(tableName);
  if (!columns.size) return;

  const filteredEntries = Object.entries(values).filter(([key, value]) => columns.has(key) && value !== undefined);
  if (!filteredEntries.length) return;

  const keys = filteredEntries.map(([key]) => key);
  const params = filteredEntries.map(([, value]) => value);
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
  const preferredConflictKeys = [options.conflictKey || 'id', ...(options.fallbackConflictKeys || ['key', 'email', 'sku', 'ref', 'name'])]
    .filter((key, index, arr) => key && arr.indexOf(key) === index);
  const conflictKey = preferredConflictKeys.find((key) => columns.has(key));

  if (!conflictKey) {
    await pool.query(
      `insert into ${tableName} (${keys.join(', ')}) values (${placeholders})`,
      params
    );
    return;
  }

  const updateKeys = options.update === false ? [] : keys.filter((key) => key !== conflictKey);
  const updates = updateKeys.length
    ? updateKeys.map((key) => `${key} = excluded.${key}`).join(', ')
    : `${conflictKey} = excluded.${conflictKey}`;

  await pool.query(
    `insert into ${tableName} (${keys.join(', ')}) values (${placeholders}) on conflict (${conflictKey}) do update set ${updates}`,
    params
  );
}

async function upsertSeedBranches() {
  const columns = await getTableColumns('branches');
  if (!columns.size) return;

  const branchSeeds = [
    { id: 'JHB', organization_id: 'ORG-1', code: 'JHB', name: 'Johannesburg', manager_name: 'Antonie Meyer', manager_email: 'kryvexissolutions@gmail.com', city: 'Johannesburg', is_active: true },
    { id: 'CPT', organization_id: 'ORG-1', code: 'CPT', name: 'Cape Town', manager_name: 'Alex Morgan', manager_email: 'capetown@kryvexis.local', city: 'Cape Town', is_active: true },
    { id: 'DBN', organization_id: 'ORG-1', code: 'DBN', name: 'Durban', manager_name: 'Tariq Naidoo', manager_email: 'durban@kryvexis.local', city: 'Durban', is_active: true }
  ];

  for (const branch of branchSeeds) {
    const values = Object.fromEntries(Object.entries(branch).filter(([key]) => columns.has(key)));
    const keys = Object.keys(values);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const updates = keys
      .filter((key) => key !== 'id')
      .map((key) => `${key} = excluded.${key}`)
      .join(', ');

    await pool.query(
      `insert into branches (${keys.join(', ')}) values (${placeholders}) on conflict (id) do update set ${updates || 'id = excluded.id'}`,
      keys.map((key) => values[key])
    );
  }
}

async function ensureCoreSqlSeed() {
  if (!pool) return;
  const customerColumns = await getTableColumns('customers');
  if (!customerColumns.size) return;

  const countResult = await pool.query('select count(*)::int as count from customers');
  if ((countResult.rows[0]?.count || 0) > 0) return;

  await upsertSeedOrganization();
  await upsertSeedBranches();

  for (const role of roles) {
    await insertCompatible('roles', {
      key: role.key,
      label: role.label,
      description: role.description,
      dashboards: JSON.stringify(role.dashboards)
    });
  }

  const customerHasRisk = customerColumns.has('risk');
  const customerHasRiskLevel = customerColumns.has('risk_level');
  const customerHasCreditTerms = customerColumns.has('credit_terms');
  const customerHasCreditTermsDays = customerColumns.has('credit_terms_days');

  for (const customer of customers) {
    await insertCompatible('customers', {
      id: customer.id,
      customer_code: customer.id,
      code: customer.id,
      name: customer.name,
      owner: customer.owner,
      branch_id: branchIdByName(customer.branch),
      status: customer.status,
      balance: moneyToNumber(customer.balance),
      risk: customerHasRisk ? customer.risk : undefined,
      risk_level: customerHasRiskLevel ? customer.risk : undefined,
      credit_terms: customerHasCreditTerms ? customer.creditTerms : undefined,
      credit_terms_days: customerHasCreditTermsDays ? parseRelativeDue(`Due in ${parseInt(customer.creditTerms, 10) || 0} days`) : undefined,
      price_list: customer.priceList,
      contact_email: customer.contact,
      phone: customer.phone,
      notes: customer.notes,
      next_action: customer.nextAction
    }, { fallbackConflictKeys: ['customer_code', 'code', 'name'] });

    const activityColumns = await getTableColumns('customer_activity');
    if (activityColumns.size && activityColumns.has('customer_id') && activityColumns.has('activity_text')) {
      for (const activity of customer.activity || []) {
        await pool.query('insert into customer_activity (customer_id, activity_text) values ($1, $2)', [customer.id, activity]);
      }
    }
  }

  for (const supplier of suppliers) {
    await insertCompatible('suppliers', {
      id: supplier.id,
      name: supplier.name,
      category: supplier.category,
      lead_time: supplier.leadTime,
      lead_time_days: parseInt(supplier.leadTime, 10) || undefined,
      status: supplier.status,
      contact_email: supplier.contact,
      next_action: supplier.nextAction
    });
  }

  for (const product of products) {
    await insertCompatible('products', {
      id: product.id,
      sku: product.sku,
      name: product.name,
      branch_id: branchIdByName(product.branch),
      status: product.status,
      stock: product.stock,
      reorder_at: product.reorderAt,
      price: moneyToNumber(product.price),
      cost: moneyToNumber(product.cost),
      supplier_id: suppliers.find((s) => s.name === product.supplier)?.id || suppliers.find((s) => s.id === product.supplier)?.id || null,
      barcode: product.barcode,
      variants: product.variants,
      movement_summary: product.movementSummary,
      next_action: product.nextAction
    });
  }

  for (const quote of quotes) {
    await insertCompatible('quotes', {
      id: quote.id,
      customer_id: quote.customerId,
      customer_name: quote.customer,
      owner: quote.owner,
      owner_name: quote.owner,
      branch_id: branchIdByName(quote.branch),
      value_total: moneyToNumber(quote.total),
      total: moneyToNumber(quote.total),
      status: quote.status,
      validity_date: quote.validity,
      trigger_reason: quote.trigger,
      updated_label: quote.updated,
      notes: quote.notes,
      next_action: quote.nextAction,
      subtotal: moneyToNumber(quote.subtotal),
      tax: moneyToNumber(quote.tax),
      margin_band: quote.marginBand,
      approval_owner: quote.approvalOwner
    });

    const quoteLineColumns = await getTableColumns('quote_lines');
    if (quoteLineColumns.size) {
      for (const line of quote.lines || []) {
        await insertCompatible('quote_lines', {
          id: line.id,
          quote_id: quote.id,
          product_id: null,
          sku: line.sku,
          description: line.description,
          qty: line.qty,
          unit_price: moneyToNumber(line.unitPrice),
          total: moneyToNumber(line.total),
          line_total: moneyToNumber(line.total)
        });
      }
    }

    const workflowColumns = await getTableColumns('quote_workflow_events');
    if (workflowColumns.size && workflowColumns.has('quote_id') && workflowColumns.has('label') && workflowColumns.has('detail')) {
      for (const event of quote.workflow || []) {
        await pool.query('insert into quote_workflow_events (quote_id, label, detail) values ($1,$2,$3)', [quote.id, event.label, event.detail]);
      }
    }
  }

  for (const invoice of invoices) {
    await insertCompatible('invoices', {
      id: invoice.id,
      customer_id: invoice.customerId,
      customer_name: invoice.customer,
      amount: moneyToNumber(invoice.amount),
      branch_id: branchIdByName(invoice.branch),
      status: invoice.status,
      due_label: invoice.due,
      due_date: null,
      source_quote_id: invoice.source,
      quote_id: invoice.source,
      payment_status: invoice.paymentStatus,
      tax_label: invoice.tax,
      reminders: invoice.reminders,
      next_action: invoice.nextAction,
      due_in_days: parseRelativeDue(invoice.due),
      subtotal: moneyToNumber(invoice.amount),
      tax: 0,
      total: moneyToNumber(invoice.amount)
    });
  }

  for (const payment of payments) {
    await insertCompatible('payments', {
      id: payment.id,
      customer_id: payment.customerId,
      party: payment.party,
      amount: moneyToNumber(payment.amount),
      branch_id: branchIdByName(payment.branch),
      status: payment.status,
      method: payment.method,
      ref: payment.ref,
      reference: payment.ref,
      proof: payment.proof,
      proof_status: payment.proof,
      applied_to: payment.appliedTo,
      invoice_id: payment.appliedTo?.startsWith('INV-') ? payment.appliedTo : null,
      next_action: payment.nextAction
    });
  }
}

function startScheduler() {
  if (process.env.ENABLE_DAY_CLOSE_SCHEDULER !== 'true') return;
  automationState.scheduler.enabled = true;
  persistAutomationState().catch((error) => console.error('Failed to persist scheduler flag', error));
  setInterval(async () => {
    const now = new Date();
    const hhmm = now.toTimeString().slice(0, 5);
    if (automationState.automationSettings.triggerMode !== 'scheduled-close') return;
    if (hhmm !== automationState.automationSettings.closeTime) return;
    const today = now.toISOString().slice(0, 10);
    if (automationState.scheduler.lastAutoRunDate === today) return;
    try {
      if (pool) await hydrateAutomationState();
      await runDayClose({ trigger: 'scheduled', sendEmail: true, date: today });
      automationState.scheduler.lastAutoRunDate = today;
      await persistAutomationState();
    } catch (error) {
      console.error('Scheduled day close failed', error);
    }
  }, 60000);
}

async function boot() {
  if (pool) {
    const applied = await runMigrations();
    await ensureCoreSqlSeed();
    await hydrateAutomationState();
    console.log('Kryvexis OS SQL automation enabled', applied.length ? { applied } : '');
  } else {
    console.log('Kryvexis OS using JSON automation state');
  }
  startScheduler();
  app.listen(port, () => console.log(`Kryvexis OS backend running on ${port}`));
}

boot().catch((error) => {
  console.error('Backend boot failed', error);
  process.exit(1);
});
