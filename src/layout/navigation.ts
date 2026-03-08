export type RoleKey = 'admin' | 'sales' | 'warehouse' | 'finance' | 'procurement' | 'operations';

export type NavItem = {
  label: string;
  href: string;
  description?: string;
  badge?: string;
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
      { label: 'Customers', href: '/customers', description: 'Profiles and account health' },
      { label: 'Products', href: '/products', description: 'Catalog and stock insight' },
      { label: 'Quotes', href: '/quotes', description: 'Commercial pipeline' },
      { label: 'Invoices', href: '/invoices', description: 'Billing and collections' },
      { label: 'Purchase Orders', href: '/purchase-orders', description: 'Supplier purchasing' },
      { label: 'Approvals', href: '/approvals', badge: '5', description: 'Pending decisions' }
    ]
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', href: '/settings', description: 'Theme, role, profile, preferences' },
      { label: 'Admin', href: '/admin', description: 'Users, roles, templates, audit' }
    ]
  }
];

export const bottomNavigation: NavItem[] = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Customers', href: '/customers' },
  { label: 'Products', href: '/products' },
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
