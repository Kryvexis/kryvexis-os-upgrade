export type RoleKey = 'admin' | 'sales' | 'warehouse' | 'finance' | 'procurement' | 'operations';

export type NavItem = {
  label: string;
  href: string;
  description?: string;
  badge?: string;
  roles?: RoleKey[];
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const roleOptions: Array<{ key: RoleKey; label: string; description: string }> = [
  { key: 'admin', label: 'Admin', description: 'Full operating control' },
  { key: 'sales', label: 'Sales Rep', description: 'Quotes, customers, invoices' },
  { key: 'warehouse', label: 'Warehouse', description: 'Stock, transfers, receiving' },
  { key: 'finance', label: 'Finance', description: 'Payments, debtors, creditors' },
  { key: 'procurement', label: 'Procurement', description: 'Suppliers and purchase orders' },
  { key: 'operations', label: 'Operations', description: 'Tasks, approvals, deliveries' }
];

export const sidebarNavigation: NavSection[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Dashboard', href: '/dashboard', description: 'Overview and alerts' },
      { label: 'Notifications', href: '/notifications', description: 'Approvals, alerts, and activity', badge: '12' },
      { label: 'Customers', href: '/customers', description: 'Profiles and account health', roles: ['admin', 'sales', 'finance'] },
      { label: 'Products', href: '/products', description: 'Catalog and stock insight', roles: ['admin', 'warehouse', 'procurement', 'operations'] },
      { label: 'Quotes', href: '/quotes', description: 'Commercial pipeline', roles: ['admin', 'sales'] },
      { label: 'Invoices', href: '/invoices', description: 'Billing and collections', roles: ['admin', 'sales', 'finance'] },
      { label: 'Purchase Orders', href: '/purchase-orders', description: 'Supplier purchasing', roles: ['admin', 'procurement', 'warehouse'] },
      { label: 'Approvals', href: '/approvals', badge: '5', description: 'Pending decisions' }
    ]
  },
  {
    label: 'Domains',
    items: [
      { label: 'Sales', href: '/sales', description: 'Quotes, invoices, orders, pricing', roles: ['admin', 'sales'] },
      { label: 'Accounting', href: '/accounting', description: 'Debtors, creditors, payments', roles: ['admin', 'finance'] },
      { label: 'Inventory', href: '/inventory', description: 'Stock, movements, transfers', roles: ['admin', 'warehouse', 'operations'] },
      { label: 'Procurement', href: '/procurement', description: 'Suppliers, POs, bills', roles: ['admin', 'procurement'] },
      { label: 'Operations', href: '/operations', description: 'Tasks, deliveries, returns', roles: ['admin', 'operations', 'warehouse'] },
      { label: 'Reports', href: '/reports', description: 'Reporting and forecasting' }
    ]
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', href: '/settings', description: 'Theme, role, profile, preferences' },
      { label: 'Admin', href: '/admin', description: 'Users, roles, templates, audit', roles: ['admin'] }
    ]
  }
];

export const bottomNavigation: NavItem[] = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Alerts', href: '/notifications' },
  { label: 'Customers', href: '/customers' },
  { label: 'Approvals', href: '/approvals' },
  { label: 'Settings', href: '/settings' }
];

export const userMenuItems = [
  { label: 'My Profile', href: '/settings?tab=profile' },
  { label: 'Role & Access', href: '/settings?tab=roles' },
  { label: 'Appearance', href: '/settings?tab=appearance' },
  { label: 'Notifications', href: '/settings?tab=notifications' },
  { label: 'Sign out', href: '#' }
] as const;
