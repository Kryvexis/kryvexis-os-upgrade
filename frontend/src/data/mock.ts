export type KPI = { label: string; value: string; detail: string; tone?: 'danger' | 'warning' | 'accent' | 'success' };
export type Customer = { id: string; name: string; branch: string; balance: string; status: string; risk: string; lastAction: string };
export type Invoice = { id: string; customer: string; amount: string; due: string; status: string; branch: string };
export type Quote = { id: string; customer: string; value: string; owner: string; status: string; updated: string };
export type Product = { sku: string; name: string; stock: number; reorderAt: number; price: string; branch: string };
export type Payment = { ref: string; party: string; amount: string; method: string; status: string; date: string };

export const navSections = [
  { title: 'Workspace', items: [
    { label: 'Dashboard', path: '/' },
    { label: 'Customers', path: '/customers' },
    { label: 'Quotes', path: '/quotes' },
    { label: 'Invoices', path: '/invoices' },
    { label: 'Products', path: '/products' },
    { label: 'Payments', path: '/payments' }
  ]},
  { title: 'Control', items: [
    { label: 'Notifications', path: '/notifications' },
    { label: 'Settings', path: '/settings' }
  ]}
];

export const dashboardKpis: KPI[] = [
  { label: 'Open Invoices', value: 'R45,230', detail: '12 overdue across 3 branches', tone: 'danger' },
  { label: 'Pending Approvals', value: '6', detail: 'Quotes and payment exceptions', tone: 'warning' },
  { label: 'Low Stock Alerts', value: '8', detail: 'Immediate reorder candidates', tone: 'accent' },
  { label: 'Collections Today', value: 'R18,400', detail: '74% toward daily target', tone: 'success' }
];

export const customers: Customer[] = [
  { id: 'CUS-001', name: 'Acme Retail Group', branch: 'Johannesburg', balance: 'R27,400', status: 'Needs follow-up', risk: 'Medium', lastAction: 'Statement sent 2h ago' },
  { id: 'CUS-002', name: 'Northline Foods', branch: 'Cape Town', balance: 'R8,920', status: 'Healthy', risk: 'Low', lastAction: 'Invoice paid today' },
  { id: 'CUS-003', name: 'Urban Build Supply', branch: 'Durban', balance: 'R14,250', status: 'Awaiting quote approval', risk: 'Medium', lastAction: 'Quote edited this morning' },
  { id: 'CUS-004', name: 'Midas Office Tech', branch: 'Pretoria', balance: 'R3,100', status: 'On terms', risk: 'Low', lastAction: 'Call logged yesterday' }
];

export const quotes: Quote[] = [
  { id: 'Q-1045', customer: 'Urban Build Supply', value: 'R62,500', owner: 'Alex Morgan', status: 'Pending approval', updated: '22 min ago' },
  { id: 'Q-1042', customer: 'Acme Retail Group', value: 'R18,960', owner: 'Rina Patel', status: 'Sent to customer', updated: '1 hour ago' },
  { id: 'Q-1038', customer: 'Northline Foods', value: 'R9,850', owner: 'Alex Morgan', status: 'Draft', updated: 'Today 08:14' }
];

export const invoices: Invoice[] = [
  { id: 'INV-2201', customer: 'Acme Retail Group', amount: 'R12,440', due: 'Due today', status: 'Overdue', branch: 'Johannesburg' },
  { id: 'INV-2196', customer: 'Northline Foods', amount: 'R4,980', due: 'Due in 2 days', status: 'Issued', branch: 'Cape Town' },
  { id: 'INV-2193', customer: 'Urban Build Supply', amount: 'R14,960', due: 'Paid', status: 'Paid', branch: 'Durban' },
  { id: 'INV-2188', customer: 'Midas Office Tech', amount: 'R6,420', due: 'Due in 6 days', status: 'Issued', branch: 'Pretoria' }
];

export const products: Product[] = [
  { sku: 'SKU-1001', name: 'Kryvexis Label Printer', stock: 14, reorderAt: 10, price: 'R2,499', branch: 'Johannesburg' },
  { sku: 'SKU-1021', name: 'Thermal Roll Box', stock: 8, reorderAt: 12, price: 'R380', branch: 'Cape Town' },
  { sku: 'SKU-1080', name: 'Mobile Scanner', stock: 5, reorderAt: 6, price: 'R1,995', branch: 'Durban' },
  { sku: 'SKU-1120', name: 'Stock Shelf Tag Set', stock: 22, reorderAt: 8, price: 'R540', branch: 'Pretoria' }
];

export const payments: Payment[] = [
  { ref: 'PAY-7701', party: 'Acme Retail Group', amount: 'R7,400', method: 'EFT', status: 'Allocated', date: 'Today 10:42' },
  { ref: 'PAY-7693', party: 'Northline Foods', amount: 'R4,980', method: 'Cash', status: 'Pending proof', date: 'Today 09:17' },
  { ref: 'PAY-7688', party: 'Urban Build Supply', amount: 'R3,500', method: 'EFT', status: 'Unallocated', date: 'Yesterday' }
];

export const notifications = [
  { title: 'Quote approval required', meta: 'Q-1045 • Sales', state: 'Pending' },
  { title: 'Invoice INV-2201 overdue', meta: 'Acme Retail Group • Finance', state: 'Urgent' },
  { title: 'Low stock threshold reached', meta: 'Thermal Roll Box • Procurement', state: 'Alert' },
  { title: 'Customer statement sent', meta: 'Northline Foods • Automation', state: 'Done' }
];

export const taskList = [
  { task: 'Review monthly report', due: 'Today', owner: 'Alex Morgan', state: 'In progress' },
  { task: 'Follow up with Acme Retail Group', due: 'Today', owner: 'Rina Patel', state: 'Open' },
  { task: 'Approve purchase exception', due: 'Tomorrow', owner: 'Finance Lead', state: 'Pending' },
  { task: 'Restock warehouse scanners', due: 'Friday', owner: 'Warehouse', state: 'Queued' }
];
