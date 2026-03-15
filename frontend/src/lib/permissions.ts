
import type { RoleKey } from '../types';

export type ModuleKey =
  | 'dashboard'
  | 'sales'
  | 'customers'
  | 'quotes'
  | 'invoices'
  | 'payments'
  | 'inventory'
  | 'procurement'
  | 'accounting'
  | 'operations'
  | 'reports'
  | 'notifications'
  | 'roles'
  | 'settings'
  | 'workspace-admin'
  | 'action-center'
  | 'sales-pos';

export type RoleAccessPolicy = {
  navigation: ModuleKey[];
  quickActions: ModuleKey[];
  canViewFinance: boolean;
  canManageRoles: boolean;
  canManageWorkspace: boolean;
  canManageAutomation: boolean;
};

export const roleAccessPolicies: Record<RoleKey, RoleAccessPolicy> = {
  admin: {
    navigation: ['dashboard', 'sales', 'customers', 'quotes', 'invoices', 'payments', 'inventory', 'procurement', 'accounting', 'operations', 'reports', 'notifications', 'roles', 'settings', 'workspace-admin', 'action-center', 'sales-pos'],
    quickActions: ['quotes', 'invoices', 'payments', 'reports', 'sales-pos'],
    canViewFinance: true,
    canManageRoles: true,
    canManageWorkspace: true,
    canManageAutomation: true
  },
  manager: {
    navigation: ['dashboard', 'sales', 'customers', 'quotes', 'invoices', 'payments', 'inventory', 'procurement', 'reports', 'notifications', 'action-center', 'sales-pos'],
    quickActions: ['quotes', 'invoices', 'payments', 'reports', 'sales-pos'],
    canViewFinance: true,
    canManageRoles: false,
    canManageWorkspace: false,
    canManageAutomation: false
  },
  executive: {
    navigation: ['dashboard', 'reports', 'notifications', 'action-center'],
    quickActions: ['reports'],
    canViewFinance: true,
    canManageRoles: false,
    canManageWorkspace: false,
    canManageAutomation: false
  },
  sales: {
    navigation: ['dashboard', 'sales', 'customers', 'quotes', 'invoices', 'payments', 'notifications', 'sales-pos'],
    quickActions: ['quotes', 'invoices', 'payments', 'sales-pos'],
    canViewFinance: false,
    canManageRoles: false,
    canManageWorkspace: false,
    canManageAutomation: false
  },
  finance: {
    navigation: ['dashboard', 'accounting', 'invoices', 'payments', 'reports', 'notifications', 'action-center'],
    quickActions: ['payments', 'reports'],
    canViewFinance: true,
    canManageRoles: false,
    canManageWorkspace: false,
    canManageAutomation: false
  },
  warehouse: {
    navigation: ['dashboard', 'inventory', 'notifications'],
    quickActions: [],
    canViewFinance: false,
    canManageRoles: false,
    canManageWorkspace: false,
    canManageAutomation: false
  },
  procurement: {
    navigation: ['dashboard', 'inventory', 'procurement', 'notifications', 'action-center'],
    quickActions: [],
    canViewFinance: false,
    canManageRoles: false,
    canManageWorkspace: false,
    canManageAutomation: false
  },
  operations: {
    navigation: ['dashboard', 'operations', 'reports', 'notifications', 'action-center'],
    quickActions: ['reports'],
    canViewFinance: false,
    canManageRoles: false,
    canManageWorkspace: false,
    canManageAutomation: false
  }
};

export function getRoleAccess(role: RoleKey): RoleAccessPolicy {
  return roleAccessPolicies[role] ?? roleAccessPolicies.sales;
}

export function canAccessModule(role: RoleKey, moduleKey: ModuleKey): boolean {
  return getRoleAccess(role).navigation.includes(moduleKey);
}
