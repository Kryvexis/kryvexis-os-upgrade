export type NavItem = {
  label: string;
  href: string;
  badge?: string;
  description?: string;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const primaryNavigation: NavSection[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Dashboard', href: '/dashboard', description: 'Overview and alerts' },
      { label: 'Sales', href: '/sales', description: 'Quotes, invoices, customers' },
      { label: 'Accounting', href: '/accounting', description: 'Payments, debtors, creditors' },
      { label: 'Inventory', href: '/inventory', description: 'Stock, products, movements' },
      { label: 'Procurement', href: '/procurement', description: 'Suppliers, PO, GRN' },
      { label: 'Operations', href: '/operations', badge: '5', description: 'Approvals and tasks' },
      { label: 'Reports', href: '/reports', description: 'Insight and forecasting' },
      { label: 'Admin', href: '/admin', description: 'Users, roles, system setup' }
    ]
  }
];

export const bottomNavigation: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Sales', href: '/sales' },
  { label: 'Inventory', href: '/inventory' },
  { label: 'Approvals', href: '/operations' },
  { label: 'Admin', href: '/admin' }
];

export const roleOptions = [
  { label: 'Admin', description: 'Full operating control' },
  { label: 'Sales Rep', description: 'Commercial workspace focus' },
  { label: 'Warehouse', description: 'Stock, transfers, receiving' },
  { label: 'Finance', description: 'Payments and creditors' }
] as const;
