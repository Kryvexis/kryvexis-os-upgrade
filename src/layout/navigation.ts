export type RoleKey = 'admin' | 'sales' | 'warehouse' | 'finance' | 'procurement' | 'operations';
export type NavIconKey = 'dashboard' | 'sales' | 'inventory' | 'finance' | 'settings' | 'alerts';

export type NavItem = {
  label: string;
  href: string;
  description?: string;
  badge?: string;
  roles?: RoleKey[];
  icon?: NavIconKey;
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
    label: 'Main navigation',
    items: [
      { label: 'Dashboard', href: '/dashboard', description: 'Overview, alerts, and branch performance', icon: 'dashboard' },
      { label: 'Sales', href: '/sales', description: 'Customers, quotes, invoices, and pipeline', roles: ['admin', 'sales', 'finance'], icon: 'sales' },
      { label: 'Inventory', href: '/inventory', description: 'Products, stock, procurement, and receiving', roles: ['admin', 'warehouse', 'procurement', 'operations'], icon: 'inventory' },
      { label: 'Finance', href: '/accounting', description: 'Invoices, payments, approvals, and controls', roles: ['admin', 'finance', 'sales'], icon: 'finance' },
      { label: 'Settings', href: '/settings', description: 'Appearance, roles, templates, and preferences', icon: 'settings' }
    ]
  }
];

export const bottomNavigation: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: 'dashboard' },
  { label: 'Sales', href: '/sales', icon: 'sales' },
  { label: 'Stock', href: '/inventory', icon: 'inventory' },
  { label: 'Finance', href: '/accounting', icon: 'finance' },
  { label: 'Settings', href: '/settings', icon: 'settings' }
];

export const userMenuItems = [
  { label: 'My Profile', href: '/settings?tab=profile' },
  { label: 'Role & Access', href: '/settings?tab=roles' },
  { label: 'Appearance', href: '/settings?tab=appearance' },
  { label: 'Notifications', href: '/settings?tab=notifications' },
  { label: 'Sign out', href: '#' }
] as const;
