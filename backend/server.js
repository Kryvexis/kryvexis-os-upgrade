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

const quotes = [
  {
    id: 'Q-1045',
    customerId: 'CUS-003',
    customer: 'Urban Build Supply',
    owner: 'Alex Morgan',
    value: 'R62,500',
    status: 'Pending approval',
    validity: '2026-03-17',
    branch: 'Durban',
    trigger: 'High-value threshold',
    updated: '22 min ago',
    notes: 'Requires sales manager approval before sending.',
    nextAction: 'Finance review at 09:00 tomorrow',
    subtotal: 'R54,347.83',
    tax: 'R8,152.17',
    total: 'R62,500',
    marginBand: 'Protected margin',
    approvalOwner: 'Sales Manager',
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
    id: 'Q-1042',
    customerId: 'CUS-001',
    customer: 'Acme Retail Group',
    owner: 'Rina Patel',
    value: 'R18,960',
    status: 'Sent to customer',
    validity: '2026-03-15',
    branch: 'Johannesburg',
    trigger: 'None',
    updated: '1 hour ago',
    notes: 'Bundle pricing applied.',
    nextAction: 'Await customer response',
    subtotal: 'R16,486.96',
    tax: 'R2,473.04',
    total: 'R18,960',
    marginBand: 'Standard margin',
    approvalOwner: 'Not required',
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
    id: 'Q-1039',
    customerId: 'CUS-002',
    customer: 'Northline Foods',
    owner: 'Alex Morgan',
    value: 'R9,880',
    status: 'Draft',
    validity: '2026-03-20',
    branch: 'Cape Town',
    trigger: 'Margin review',
    updated: 'Today 08:42',
    notes: 'Need final confirmation on line quantities.',
    nextAction: 'Finish internal note check',
    subtotal: 'R8,591.30',
    tax: 'R1,288.70',
    total: 'R9,880',
    marginBand: 'Review required',
    approvalOwner: 'Sales Lead',
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

const notifications = [
  { id: 'NT-1', title: 'Quote approval required', meta: 'Q-1045 - Sales', state: 'Pending', read: false, type: 'approval' },
  { id: 'NT-2', title: 'Invoice INV-2201 overdue', meta: 'Acme Retail Group - Finance', state: 'Urgent', read: false, type: 'collection' },
  { id: 'NT-3', title: 'Low stock threshold reached', meta: 'Thermal Roll Box - Procurement', state: 'Alert', read: true, type: 'stock' },
  { id: 'NT-4', title: 'Payment proof missing', meta: 'PAY-7693 - Finance', state: 'Action', read: false, type: 'payment' }
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

const customerSummaries = {
  'CUS-001': {
    customerId: 'CUS-001',
    totalSpend: 'R78,240',
    invoiceCount: 6,
    averageOrderValue: 'R13,040',
    overdueBalance: 'R5,040',
    lastPurchaseDate: '2026-03-09',
    lastPaymentDate: 'Today 10:42',
    collectionStatus: '1 overdue invoice needs follow-up',
    topProducts: [
      { sku: 'SKU-1001', name: 'Kryvexis Label Printer', quantity: 18, revenue: 'R44,982' },
      { sku: 'SKU-1021', name: 'Thermal Roll Box', quantity: 56, revenue: 'R21,280' },
      { sku: 'SKU-1033', name: 'Warehouse Scanner Dock', quantity: 9, revenue: 'R11,610' }
    ],
    openQuotes: quotes.filter((item) => item.customerId === 'CUS-001' && item.status !== 'Converted'),
    recentInvoices: invoices.filter((item) => item.customerId === 'CUS-001').slice(0, 3),
    recentPayments: payments.filter((item) => item.customerId === 'CUS-001').slice(0, 3),
    purchaseHistory: [
      { id: 'PH-1', date: '2026-03-10', type: 'payment', reference: 'PAY-7701', amount: 'R7,400', status: 'Allocated', note: 'Part-payment allocated to INV-2201' },
      { id: 'PH-2', date: '2026-03-09', type: 'invoice', reference: 'INV-2201', amount: 'R12,440', status: 'Overdue', note: 'Reminder sent and follow-up queued' },
      { id: 'PH-3', date: '2026-03-08', type: 'quote', reference: 'Q-1042', amount: 'R18,960', status: 'Sent to customer', note: 'Bundle pricing applied and customer opened the quote' },
      { id: 'PH-4', date: '2026-03-04', type: 'payment', reference: 'PAY-7679', amount: 'R15,640', status: 'Allocated', note: 'Full settlement on INV-2186' },
      { id: 'PH-5', date: '2026-03-03', type: 'invoice', reference: 'INV-2186', amount: 'R15,640', status: 'Paid', note: 'Converted from prior quote cycle' }
    ]
  },
  'CUS-002': {
    customerId: 'CUS-002',
    totalSpend: 'R41,920',
    invoiceCount: 5,
    averageOrderValue: 'R8,384',
    overdueBalance: 'R0',
    lastPurchaseDate: '2026-03-10',
    lastPaymentDate: 'Today 09:17',
    collectionStatus: 'Awaiting proof for cash receipt',
    topProducts: [
      { sku: 'SKU-1021', name: 'Thermal Roll Box', quantity: 84, revenue: 'R31,920' },
      { sku: 'SKU-1033', name: 'Warehouse Scanner Dock', quantity: 8, revenue: 'R10,000' }
    ],
    openQuotes: quotes.filter((item) => item.customerId === 'CUS-002'),
    recentInvoices: invoices.filter((item) => item.customerId === 'CUS-002').slice(0, 3),
    recentPayments: payments.filter((item) => item.customerId === 'CUS-002').slice(0, 3),
    purchaseHistory: [
      { id: 'PH-6', date: '2026-03-10', type: 'payment', reference: 'PAY-7693', amount: 'R4,980', status: 'Pending proof', note: 'Cash received but proof still outstanding' },
      { id: 'PH-7', date: '2026-03-10', type: 'invoice', reference: 'INV-2196', amount: 'R4,980', status: 'Issued', note: 'Reminder scheduled at due date' },
      { id: 'PH-8', date: '2026-03-10', type: 'quote', reference: 'Q-1039', amount: 'R9,880', status: 'Draft', note: 'Quantities under internal review' }
    ]
  },
  'CUS-003': {
    customerId: 'CUS-003',
    totalSpend: 'R63,580',
    invoiceCount: 3,
    averageOrderValue: 'R21,193',
    overdueBalance: 'R12,000',
    lastPurchaseDate: '2026-03-09',
    lastPaymentDate: 'Yesterday 16:10',
    collectionStatus: 'Receipt received but not yet allocated',
    topProducts: [
      { sku: 'SKU-1001', name: 'Kryvexis Label Printer', quantity: 12, revenue: 'R29,988' },
      { sku: 'SKU-1021', name: 'Thermal Roll Box', quantity: 45, revenue: 'R17,100' },
      { sku: 'SKU-1033', name: 'Warehouse Scanner Dock', quantity: 12, revenue: 'R15,480' }
    ],
    openQuotes: quotes.filter((item) => item.customerId === 'CUS-003'),
    recentInvoices: invoices.filter((item) => item.customerId === 'CUS-003').slice(0, 3),
    recentPayments: payments.filter((item) => item.customerId === 'CUS-003').slice(0, 3),
    purchaseHistory: [
      { id: 'PH-9', date: '2026-03-10', type: 'quote', reference: 'Q-1045', amount: 'R62,500', status: 'Pending approval', note: 'Waiting on manager approval before customer send' },
      { id: 'PH-10', date: '2026-03-09', type: 'invoice', reference: 'INV-2192', amount: 'R28,600', status: 'Awaiting allocation', note: 'Payment proof received and allocation pending' },
      { id: 'PH-11', date: '2026-03-09', type: 'payment', reference: 'PAY-7688', amount: 'R12,000', status: 'Unallocated', note: 'Needs application against open invoice' }
    ]
  }
};

const dashboardByRole = {
  admin: { kpis: [
      { label: 'System activity', value: '342', detail: 'Events in the last 24h' },
      { label: 'Pending approvals', value: '6', detail: 'Quotes and exceptions' },
      { label: 'Branch health', value: '92%', detail: 'Operational completion score' },
      { label: 'Unread notifications', value: '11', detail: 'Across all roles' }
    ], panels: [
      { title: 'Approvals queue', items: ['Q-1045 high-value quote', 'Payment exception PAY-7693', 'Role change request for Cape Town'] },
      { title: 'Audit highlights', items: ['Theme changed to system', 'Invoice template updated', 'Branch settings edited'] }
    ] },
  sales: { kpis: [
      { label: 'Quotes awaiting action', value: '9', detail: '3 need approval' },
      { label: 'Invoices due', value: 'R45,230', detail: '12 active invoices' },
      { label: 'Customer balances', value: 'R98,120', detail: 'Across key accounts' },
      { label: 'Personal target', value: '74%', detail: 'Month-to-date progress' }
    ], panels: [
      { title: 'Follow-up focus', items: ['Call Acme Retail Group', 'Send revised quote to Northline', 'Approve Urban Build pricing note'] },
      { title: 'Recent communications', items: ['Invoice reminder sent', 'Quote viewed by customer', 'Statement export completed'] }
    ] },
  finance: { kpis: [
      { label: 'Debtor aging', value: 'R184,900', detail: '31+ days: R42,300' },
      { label: 'Receipts today', value: 'R18,400', detail: '3 collections booked' },
      { label: 'Overdue accounts', value: '12', detail: '5 need escalation' },
      { label: 'Cash-up alerts', value: '1', detail: 'Cape Town variance pending' }
    ], panels: [
      { title: 'Collection actions', items: ['INV-2201 follow-up', 'Allocate PAY-7688', 'Send first reminder batch'] },
      { title: 'Approvals and exceptions', items: ['Unallocated EFT review', 'Missing proof on PAY-7693', 'Tax override awaiting confirmation'] }
    ] }
};

function envelope(data, extra = {}) {
  return { ok: true, ...extra, data };
}

function findQuote(id) {
  return quotes.find((entry) => entry.id === id);
}

function findInvoice(id) {
  return invoices.find((entry) => entry.id === id);
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
    workflow
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

app.get('/', (_req, res) => res.json({ ok: true, service: 'kryvexis-os-api', status: 'running', phase: '1B' }));
app.get('/health', (_req, res) => res.json({ status: 'ok', phase: '1B', service: 'kryvexis-os-api' }));
app.get('/api/bootstrap', (_req, res) => res.json(envelope({ roles, themeOptions: settings.themes, support: { email: settings.supportEmail, whatsapp: settings.whatsapp } })));
app.get('/api/dashboard', (req, res) => {
  const role = req.query.role || 'admin';
  const dashboard = dashboardByRole[role] || dashboardByRole.admin;
  res.json(envelope({ role, ...dashboard, highlights: notifications.slice(0, 3), recentCustomers: customers.slice(0, 3), lowStockProducts: products.filter((item) => item.stock <= item.reorderAt), topClients }));
});
app.get('/api/customers/:id/summary', (req, res) => {
  const summary = customerSummaries[req.params.id];
  if (!summary) return res.status(404).json({ ok: false, error: 'customer summary not found' });
  return res.json(envelope(summary));
});
app.get('/api/invoices/:id', (req, res) => {
  const invoice = findInvoice(req.params.id);
  if (!invoice) return res.status(404).json({ ok: false, error: 'invoice item not found' });
  return res.json(envelope(buildInvoiceDetail(invoice)));
});
app.post('/api/quotes/:id/status', (req, res) => {
  const quote = findQuote(req.params.id);
  if (!quote) return res.status(404).json({ ok: false, error: 'quote item not found' });

  const nextStatus = req.body?.status;
  const allowed = ['Draft', 'Pending approval', 'Approved', 'Sent to customer', 'Converted'];
  if (!allowed.includes(nextStatus)) {
    return res.status(400).json({ ok: false, error: 'unsupported quote status' });
  }

  if (quote.status === 'Converted') {
    return res.status(400).json({ ok: false, error: 'converted quotes are locked' });
  }

  quote.status = nextStatus;
  quote.updated = 'Just now';
  quote.nextAction = nextStatus === 'Approved'
    ? 'Mark as sent or convert to invoice'
    : nextStatus === 'Sent to customer'
      ? 'Convert to invoice after customer confirmation'
      : nextStatus === 'Pending approval'
        ? 'Manager review required before send'
        : 'Continue internal review';

  quote.workflow.push({
    label: 'Status update',
    detail: `Quote moved to ${nextStatus}`
  });

  return res.json(envelope({ quote }));
});
app.post('/api/quotes/:id/convert', (req, res) => {
  const quote = findQuote(req.params.id);
  if (!quote) return res.status(404).json({ ok: false, error: 'quote item not found' });

  const existingInvoice = invoices.find((entry) => entry.source === quote.id);
  if (existingInvoice) {
    return res.json(envelope({ quote, invoice: buildInvoiceDetail(existingInvoice), reused: true }));
  }

  if (!['Approved', 'Sent to customer'].includes(quote.status)) {
    return res.status(400).json({ ok: false, error: 'quote must be approved or sent before conversion' });
  }

  const nextId = 2200 + invoices.length + 1;
  const invoice = {
    id: `INV-${nextId}`,
    customerId: quote.customerId,
    customer: quote.customer,
    amount: quote.total,
    branch: quote.branch,
    status: 'Draft',
    due: 'Due in 30 days',
    source: quote.id,
    paymentStatus: 'Unpaid',
    tax: 'VAT standard',
    reminders: 'Not started',
    nextAction: 'Review invoice draft and issue to customer'
  };

  invoices.unshift(invoice);
  quote.status = 'Converted';
  quote.updated = 'Just now';
  quote.nextAction = `Invoice ${invoice.id} ready for review`;
  quote.workflow.push({ label: 'Converted', detail: `Invoice ${invoice.id} created from this quote` });

  const summary = customerSummaries[quote.customerId];
  if (summary) {
    summary.openQuotes = summary.openQuotes.filter((item) => item.id !== quote.id);
    summary.recentInvoices = [invoice, ...summary.recentInvoices].slice(0, 3);
    summary.purchaseHistory = [
      {
        id: `PH-${Date.now()}`,
        date: '2026-03-10',
        type: 'invoice',
        reference: invoice.id,
        amount: invoice.amount,
        status: invoice.status,
        note: `Invoice created from ${quote.id}`
      },
      ...summary.purchaseHistory
    ].slice(0, 6);
  }

  return res.json(envelope({ quote, invoice: buildInvoiceDetail(invoice), reused: false }));
});

listRoute('customers', customers);
listRoute('products', products);
listRoute('quotes', quotes);
app.get('/api/invoices', (_req, res) => res.json(envelope(invoices)));
listRoute('payments', payments);
listRoute('notifications', notifications);
app.get('/api/settings', (_req, res) => res.json(envelope(settings)));
app.get('/api/roles', (_req, res) => res.json(envelope(roles)));

app.listen(port, () => console.log(`Kryvexis OS Phase 1B backend running on ${port}`));
