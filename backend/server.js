import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const roles = [
  { key: 'admin', label: 'Admin', description: 'Full platform visibility, settings, templates, automation rules, user management, audit access.', dashboards: ['system activity', 'approvals', 'branch health', 'audit highlights'] },
  { key: 'sales', label: 'Sales', description: 'Customers, quotes, invoices, statements, selected reports.', dashboards: ['quotes awaiting action', 'invoices due', 'customer balances', 'personal targets'] },
  { key: 'finance', label: 'Finance', description: 'Payments, debtors, creditors, statements, expenses, cash up.', dashboards: ['debtor aging', 'receipts today', 'overdue accounts', 'cash-up alerts'] },
  { key: 'warehouse', label: 'Warehouse', description: 'Stock, movements, transfers, low stock, goods received.', dashboards: ['low stock', 'pending transfers', 'awaiting receipt', 'delivery queue'] },
  { key: 'procurement', label: 'Procurement', description: 'Suppliers, purchase orders, reorders, supplier bills.', dashboards: ['reorder candidates', 'pending POs', 'late suppliers', 'unmatched supplier bills'] },
  { key: 'operations', label: 'Operations', description: 'Deliveries, returns, tasks, approvals, operational dashboards.', dashboards: ['open deliveries', 'returns pending', 'tasks due', 'dispatch exceptions'] },
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

const topClients = [
  { customerId: 'CUS-001', name: 'Acme Retail Group', revenue: 'R78,240', invoices: 6, averageOrderValue: 'R13,040', overdueBalance: 'R5,040', trend: 'Growing this month' },
  { customerId: 'CUS-003', name: 'Urban Build Supply', revenue: 'R63,580', invoices: 3, averageOrderValue: 'R21,193', overdueBalance: 'R12,000', trend: 'Large deal pending' },
  { customerId: 'CUS-002', name: 'Northline Foods', revenue: 'R41,920', invoices: 5, averageOrderValue: 'R8,384', overdueBalance: 'R0', trend: 'Healthy collections' }
];

const baseCustomerSummaries = {
  'CUS-001': {
    customerId: 'CUS-001', totalSpend: 'R78,240', invoiceCount: 6, averageOrderValue: 'R13,040', overdueBalance: 'R5,040', lastPurchaseDate: '2026-03-09', lastPaymentDate: 'Today 10:42', collectionStatus: '1 overdue invoice needs follow-up',
    topProducts: [
      { sku: 'SKU-1001', name: 'Kryvexis Label Printer', quantity: 18, revenue: 'R44,982' },
      { sku: 'SKU-1021', name: 'Thermal Roll Box', quantity: 56, revenue: 'R21,280' },
      { sku: 'SKU-1033', name: 'Warehouse Scanner Dock', quantity: 9, revenue: 'R11,610' }
    ],
    purchaseHistory: [
      { id: 'PH-1', date: '2026-03-10', type: 'payment', reference: 'PAY-7701', amount: 'R7,400', status: 'Allocated', note: 'Part-payment allocated to INV-2201' },
      { id: 'PH-2', date: '2026-03-09', type: 'invoice', reference: 'INV-2201', amount: 'R12,440', status: 'Overdue', note: 'Reminder sent and follow-up queued' },
      { id: 'PH-3', date: '2026-03-08', type: 'quote', reference: 'Q-1042', amount: 'R18,960', status: 'Sent to customer', note: 'Bundle pricing applied and customer opened the quote' }
    ]
  },
  'CUS-002': {
    customerId: 'CUS-002', totalSpend: 'R41,920', invoiceCount: 5, averageOrderValue: 'R8,384', overdueBalance: 'R0', lastPurchaseDate: '2026-03-10', lastPaymentDate: 'Today 09:17', collectionStatus: 'Awaiting proof for cash receipt',
    topProducts: [
      { sku: 'SKU-1021', name: 'Thermal Roll Box', quantity: 84, revenue: 'R31,920' },
      { sku: 'SKU-1033', name: 'Warehouse Scanner Dock', quantity: 8, revenue: 'R10,000' }
    ],
    purchaseHistory: [
      { id: 'PH-6', date: '2026-03-10', type: 'payment', reference: 'PAY-7693', amount: 'R4,980', status: 'Pending proof', note: 'Cash received but proof still outstanding' }
    ]
  },
  'CUS-003': {
    customerId: 'CUS-003', totalSpend: 'R63,580', invoiceCount: 3, averageOrderValue: 'R21,193', overdueBalance: 'R12,000', lastPurchaseDate: '2026-03-09', lastPaymentDate: 'Yesterday 16:10', collectionStatus: 'Receipt received but not yet allocated',
    topProducts: [
      { sku: 'SKU-1001', name: 'Kryvexis Label Printer', quantity: 12, revenue: 'R29,988' },
      { sku: 'SKU-1021', name: 'Thermal Roll Box', quantity: 45, revenue: 'R17,100' },
      { sku: 'SKU-1033', name: 'Warehouse Scanner Dock', quantity: 12, revenue: 'R15,480' }
    ],
    purchaseHistory: [
      { id: 'PH-9', date: '2026-03-10', type: 'quote', reference: 'Q-1045', amount: 'R62,500', status: 'Pending approval', note: 'Waiting on manager approval before customer send' }
    ]
  }
};

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

let auditLog = [
  { id: 'AUD-1', title: 'Quote drafted', detail: 'Q-1045 prepared for Urban Build Supply with protected margin review.', actor: 'Alex Morgan', timestamp: 'Today 08:12', recordType: 'quote', recordId: 'Q-1045', recordPath: '/quotes/Q-1045', customerId: 'CUS-003', status: 'Drafted' },
  { id: 'AUD-2', title: 'Quote sent to customer', detail: 'Q-1042 delivered to Acme Retail Group and tracked in audit.', actor: 'Rina Patel', timestamp: 'Today 09:06', recordType: 'quote', recordId: 'Q-1042', recordPath: '/quotes/Q-1042', customerId: 'CUS-001', status: 'Sent to customer' },
  { id: 'AUD-3', title: 'Invoice overdue follow-up', detail: 'INV-2201 remains overdue and is queued for collections follow-up.', actor: 'Finance Bot', timestamp: 'Today 10:10', recordType: 'invoice', recordId: 'INV-2201', recordPath: '/invoices/INV-2201', customerId: 'CUS-001', status: 'Overdue' },
  { id: 'AUD-4', title: 'Payment proof requested', detail: 'PAY-7693 still needs proof before final allocation.', actor: 'Finance Team', timestamp: 'Today 10:18', recordType: 'payment', recordId: 'PAY-7693', recordPath: '/payments/PAY-7693', customerId: 'CUS-002', status: 'Pending proof' },
  { id: 'AUD-5', title: 'Receipt awaiting allocation', detail: 'PAY-7688 received for Urban Build Supply and is waiting for invoice allocation.', actor: 'Finance Team', timestamp: 'Today 10:24', recordType: 'payment', recordId: 'PAY-7688', recordPath: '/payments/PAY-7688', customerId: 'CUS-003', status: 'Unallocated' },
  { id: 'AUD-6', title: 'Dashboard theme changed', detail: 'System theme preference updated to system mode.', actor: 'Admin', timestamp: 'Yesterday 16:00', recordType: 'system', recordId: 'settings', recordPath: '/settings', customerId: null, status: 'Applied' }
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

  return {
    ...base,
    openQuotes,
    recentInvoices,
    recentPayments,
    overdueInvoices,
    openBalance,
    accountHealth: health,
    linkedActivity
  };
}

function listRoute(path, collection) {
  app.get(`/api/${path}`, (_req, res) => res.json(envelope(collection)));
  app.get(`/api/${path}/:id`, (req, res) => {
    const item = collection.find((entry) => entry.id === req.params.id || entry.ref === req.params.id || entry.sku === req.params.id);
    if (!item) return res.status(404).json({ ok: false, error: `${path} item not found` });
    return res.json(envelope(item));
  });
}

app.get('/', (_req, res) => res.json({ ok: true, service: 'kryvexis-os-api', status: 'running', phase: 'HL' }));
app.get('/health', (_req, res) => res.json({ status: 'ok', phase: 'HL', service: 'kryvexis-os-api' }));
app.get('/api/bootstrap', (_req, res) => res.json(envelope({ roles, themeOptions: settings.themes, support: { email: settings.supportEmail, whatsapp: settings.whatsapp } })));
app.get('/api/dashboard', (req, res) => {
  const role = req.query.role || 'admin';
  res.json(envelope(buildDashboard(role)));
});
app.get('/api/customers/:id/summary', (req, res) => {
  const summary = buildCustomerSummary(req.params.id);
  if (!summary) return res.status(404).json({ ok: false, error: 'customer summary not found' });
  return res.json(envelope(summary));
});
app.get('/api/quotes', (_req, res) => res.json(envelope(quotes)));
app.get('/api/quotes/:id', (req, res) => {
  const quote = findQuote(req.params.id);
  if (!quote) return res.status(404).json({ ok: false, error: 'quote item not found' });
  return res.json(envelope(buildQuoteDetail(quote)));
});
app.get('/api/invoices', (_req, res) => res.json(envelope(invoices)));
app.get('/api/invoices/:id', (req, res) => {
  const invoice = findInvoice(req.params.id);
  if (!invoice) return res.status(404).json({ ok: false, error: 'invoice item not found' });
  return res.json(envelope(buildInvoiceDetail(invoice)));
});
app.get('/api/payments', (_req, res) => res.json(envelope(payments)));
app.get('/api/payments/:id', (req, res) => {
  const payment = findPayment(req.params.id);
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
      closing: `Regards,
${quote.owner}
Kryvexis Solutions`
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
      closing: `Regards,
Finance Team
Kryvexis Solutions`
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
      closing: `Regards,
Finance Team
Kryvexis Solutions`
    };
  }

  return null;
}

listRoute('customers', customers);
listRoute('products', products);
listRoute('suppliers', suppliers);
listRoute('purchase-orders', purchaseOrders);

app.get('/api/emails/:kind/:id', (req, res) => {
  const draft = buildEmailDraft(req.params.kind, req.params.id);
  if (!draft) return res.status(404).json({ ok: false, error: 'email draft not found' });
  return res.json(envelope(draft));
});

app.get('/api/settings', (_req, res) => res.json(envelope(settings)));
app.get('/api/roles', (_req, res) => res.json(envelope(roles)));

app.listen(port, () => console.log(`Kryvexis OS Phase HL backend running on ${port}`));
