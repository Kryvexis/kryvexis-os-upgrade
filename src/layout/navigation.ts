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
    label: 'Core',
    items: [
      { label: 'Dashboard', href: '/dashboard', description: 'Overview, alerts, and branch performance' },
      { label: 'Sales', href: '/sales', description: 'Customers, quotes, invoices, and pipeline', roles: ['admin', 'sales', 'finance'] },
      { label: 'Inventory', href: '/inventory', description: 'Products, stock, procurement, and receiving', roles: ['admin', 'warehouse', 'procurement', 'operations'] },
      { label: 'Finance', href: '/accounting', description: 'Invoices, payments, approvals, and controls', roles: ['admin', 'finance', 'sales'] },
      { label: 'Settings', href: '/settings', description: 'Appearance, roles, templates, and preferences' }
    ]
  }
];

export const bottomNavigation: NavItem[] = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Sales', href: '/sales' },
  { label: 'Stock', href: '/inventory' },
  { label: 'Finance', href: '/accounting' },
  { label: 'Settings', href: '/settings' }
];

export const userMenuItems = [
  { label: 'My Profile', href: '/settings?tab=profile' },
  { label: 'Role & Access', href: '/settings?tab=roles' },
  { label: 'Appearance', href: '/settings?tab=appearance' },
  { label: 'Notifications', href: '/settings?tab=notifications' },
  { label: 'Sign out', href: '#' }
] as const;
