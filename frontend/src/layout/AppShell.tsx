import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import type { Notification, RoleKey } from '../types';

const primaryNav = [
  ['/', 'Dashboard', '◔'],
  ['/customers', 'Customers', '◫'],
  ['/sales', 'Sales', '▣'],
  ['/procurement', 'Purchasing', '◌'],
  ['/accounting', 'Accounting', '◎'],
  ['/operations', 'Operations', '↗'],
  ['/reports', 'Reports', '▤']
] as const;

const utilityNav = [
  ['/notifications', 'Notifications', '✦'],
  ['/roles', 'Roles', '⌘'],
  ['/settings', 'Settings', '⚙']
] as const;

const roleLabels: Record<RoleKey, string> = {
  admin: 'Admin',
  manager: 'Manager',
  sales: 'Sales',
  finance: 'Finance',
  warehouse: 'Warehouse',
  procurement: 'Procurement',
  operations: 'Operations',
  executive: 'Executive'
};

const pageTitles: Array<[string, string]> = [
  ['/customers', 'Customers'],
  ['/sales', 'Sales'],
  ['/inventory', 'Inventory'],
  ['/procurement', 'Purchasing'],
  ['/accounting', 'Accounting'],
  ['/operations', 'Operations'],
  ['/reports', 'Reports'],
  ['/notifications', 'Notifications'],
  ['/roles', 'Roles'],
  ['/settings', 'Settings'],
  ['/quotes', 'Quotes'],
  ['/invoices', 'Invoices'],
  ['/payments', 'Payments'],
  ['/products', 'Products']
];

export function AppShell({
  role,
  setRole,
  theme,
  setTheme
}: {
  role: RoleKey;
  setRole: (role: RoleKey) => void;
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
}) {
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    api.notifications().then(setNotifications).catch(() => setNotifications([]));
  }, [location.pathname]);

  useEffect(() => {
    setUserMenuOpen(false);
    if (typeof window !== 'undefined' && window.innerWidth <= 860) setSidebarOpen(false);
  }, [location.pathname]);

  const unread = notifications.filter((item) => !item.read && !item.dismissed).length;
  const activeLabel = useMemo(() => {
    return pageTitles.find(([prefix]) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`))?.[1] ?? 'Dashboard';
  }, [location.pathname]);

  function toggleNav() {
    if (typeof window !== 'undefined' && window.innerWidth <= 860) {
      setSidebarOpen((value) => !value);
    } else {
      setSidebarCollapsed((value) => !value);
    }
  }

  return (
    <div className={`app-shell mockup-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`.trim()}>
      <aside className="sidebar mockup-sidebar">
        <div className="mockup-brand">
          <span className="mockup-brand-mark" />
          <strong>Kryvexis OS</strong>
        </div>

        <nav className="mockup-nav">
          {primaryNav.map(([to, label, icon]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `mockup-nav-link ${isActive ? 'active' : ''}`}>
              <span className="mockup-nav-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mockup-sidebar-divider" />

        <nav className="mockup-nav mockup-nav-utility">
          {utilityNav.map(([to, label, icon]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `mockup-nav-link ${isActive ? 'active' : ''}`}>
              <span className="mockup-nav-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-area mockup-main">
        <header className="mockup-topbar">
          <div className="mockup-topbar-left">
            <button type="button" className="menu-chip mockup-menu" aria-label="Toggle navigation" onClick={toggleNav}>☰</button>
            <strong>{activeLabel}</strong>
          </div>

          <div className="mockup-topbar-right">
            <Link to="/notifications" className="mockup-bell" aria-label="Notifications">
              🔔
              {unread ? <span className="mockup-bell-badge">{unread}</span> : null}
            </Link>

            <div className={`mockup-user-wrap ${userMenuOpen ? 'open' : ''}`}>
              <button type="button" className="mockup-user-chip" onClick={() => setUserMenuOpen((value) => !value)}>
                <span className="mockup-user-avatar">A</span>
                <span className="mockup-user-copy">
                  <strong>Antonie Meyer</strong>
                  <small>{roleLabels[role]}</small>
                </span>
              </button>

              {userMenuOpen ? (
                <div className="mockup-user-menu">
                  <label className="mockup-menu-field">
                    <span>Role view</span>
                    <select value={role} onChange={(event) => setRole(event.target.value as RoleKey)}>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="executive">Executive</option>
                      <option value="sales">Sales</option>
                      <option value="finance">Finance</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="procurement">Procurement</option>
                      <option value="operations">Operations</option>
                    </select>
                  </label>
                  <label className="mockup-menu-field">
                    <span>Theme</span>
                    <select value={theme} onChange={(event) => setTheme(event.target.value as 'dark' | 'light' | 'system')}>
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="system">System</option>
                    </select>
                  </label>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <section className="page-body mockup-page-body">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
