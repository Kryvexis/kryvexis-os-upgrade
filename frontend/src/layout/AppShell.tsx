import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import type { RoleKey } from '../types';

const coreModules = [
  ['/', 'Dashboard'],
  ['/sales', 'Sales'],
  ['/inventory', 'Inventory'],
  ['/procurement', 'Procurement'],
  ['/accounting', 'Accounting'],
  ['/operations', 'Operations'],
  ['/notifications', 'Inbox']
] as const;

const adminItems = [
  ['/roles', 'Roles'],
  ['/settings', 'Settings']
] as const;

const roleLabels: Record<RoleKey, string> = {
  admin: 'Admin',
  sales: 'Sales',
  finance: 'Finance',
  warehouse: 'Warehouse',
  procurement: 'Procurement',
  operations: 'Operations',
  executive: 'Executive'
};

const pageTitles: Array<[string, string]> = [
  ['/sales', 'Sales'],
  ['/inventory', 'Inventory'],
  ['/procurement', 'Procurement'],
  ['/accounting', 'Accounting'],
  ['/operations', 'Operations'],
  ['/customers', 'Customers'],
  ['/quotes', 'Quotes'],
  ['/invoices', 'Invoices'],
  ['/products', 'Products'],
  ['/payments', 'Payments'],
  ['/notifications', 'Inbox'],
  ['/roles', 'Roles'],
  ['/settings', 'Settings']
];

export function AppShell({ role, setRole, theme, setTheme }: { role: RoleKey; setRole: (role: RoleKey) => void; theme: 'dark' | 'light' | 'system'; setTheme: (theme: 'dark' | 'light' | 'system') => void; }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const activeLabel = pageTitles.find(([prefix]) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`))?.[1] ?? 'Dashboard';

  function toggleNav() {
    if (typeof window !== 'undefined' && window.innerWidth <= 860) {
      setSidebarOpen((v) => !v);
    } else {
      setSidebarCollapsed((v) => !v);
    }
  }

  function closeMobileNav() {
    setSidebarOpen(false);
  }

  const shellClass = ['app-shell', sidebarCollapsed ? 'sidebar-collapsed' : '', sidebarOpen ? 'sidebar-open' : ''].filter(Boolean).join(' ');

  return (
    <div className={shellClass}>
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-mark">K</span>
          <div>
            <strong>Kryvexis OS</strong>
            <p>{roleLabels[role]} workspace</p>
          </div>
        </div>

        <div className="nav-section">
          <span className="eyebrow nav-section-label">Core modules</span>
          <nav className="nav-list">
            {coreModules.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={closeMobileNav} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span className="nav-link-dot" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="nav-section admin-nav-section">
          <span className="eyebrow nav-section-label">Admin</span>
          <nav className="nav-list">
            {adminItems.map(([to, label]) => (
              <NavLink key={to} to={to} onClick={closeMobileNav} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span className="nav-link-dot" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-foot">
          <label className="stack-field">
            <span>Role view</span>
            <select value={role} onChange={(e) => setRole(e.target.value as RoleKey)}>
              <option value="admin">Admin</option>
              <option value="sales">Sales</option>
              <option value="finance">Finance</option>
              <option value="warehouse">Warehouse</option>
              <option value="procurement">Procurement</option>
              <option value="operations">Operations</option>
              <option value="executive">Executive</option>
            </select>
          </label>

          <label className="stack-field">
            <span>Theme</span>
            <select value={theme} onChange={(e) => setTheme(e.target.value as 'dark' | 'light' | 'system')}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </label>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar topbar-shell">
          <div className="topbar-leading">
            <button className="menu-chip" type="button" aria-label="Toggle navigation" onClick={toggleNav}>≡</button>
            <div>
              <p className="eyebrow">One shell • one workflow language</p>
              <h1>{activeLabel}</h1>
            </div>
          </div>

          <div className="topbar-actions topbar-user-row">
            <button className="icon-chip" type="button" aria-label="Notifications">◔</button>
            <div className="user-chip">
              <span className="user-avatar">A</span>
              <div>
                <strong>Alex Morgan</strong>
                <p>{roleLabels[role]}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="page-body"><Outlet /></section>

        <nav className="mobile-nav">
          {coreModules.slice(0, 5).map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}>
              {label}
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
}
