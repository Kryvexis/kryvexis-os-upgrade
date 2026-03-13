import { NavLink, Outlet, useLocation } from 'react-router-dom';
import type { RoleKey } from '../types';

const moduleItems = [
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

function getPageTitle(pathname: string) {
  if (pathname.startsWith('/sales')) return 'Sales';
  if (pathname.startsWith('/inventory')) return 'Inventory';
  if (pathname.startsWith('/procurement')) return 'Procurement';
  if (pathname.startsWith('/accounting')) return 'Accounting';
  if (pathname.startsWith('/operations')) return 'Operations';
  if (pathname.startsWith('/notifications')) return 'Inbox';
  if (pathname.startsWith('/customers')) return 'Customers';
  if (pathname.startsWith('/quotes')) return 'Quotes';
  if (pathname.startsWith('/invoices')) return 'Invoices';
  if (pathname.startsWith('/products')) return 'Products';
  if (pathname.startsWith('/payments')) return 'Payments';
  if (pathname.startsWith('/roles')) return 'Roles';
  if (pathname.startsWith('/settings')) return 'Settings';
  return 'Dashboard';
}

function SidebarLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
      <span className="nav-dot" />
      <span>{label}</span>
    </NavLink>
  );
}

export function AppShell({ role, setRole, theme, setTheme }: {
  role: RoleKey;
  setRole: (role: RoleKey) => void;
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
}) {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-mark">K</span>
          <div>
            <strong>Kryvexis OS</strong>
            <p>{role === 'executive' ? 'Executive' : role[0].toUpperCase() + role.slice(1)} workspace</p>
          </div>
        </div>

        <div className="nav-group">
          <p className="nav-group-label">Core modules</p>
          <nav className="nav-list">{moduleItems.map(([to, label]) => <SidebarLink key={to} to={to} label={label} />)}</nav>
        </div>

        <div className="nav-group admin-nav-group">
          <p className="nav-group-label">Admin</p>
          <nav className="nav-list">{adminItems.map(([to, label]) => <SidebarLink key={to} to={to} label={label} />)}</nav>
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
        <header className="topbar shell-topbar">
          <div className="topbar-title-wrap">
            <button className="menu-pill" type="button" aria-label="Open module navigation">
              ≡
            </button>
            <div>
              <p className="eyebrow">One shell • one workflow language</p>
              <h1>{pageTitle}</h1>
            </div>
          </div>

          <div className="topbar-actions topbar-right-cluster">
            <button className="ghost-icon-button" type="button" aria-label="Quick action">
              ◔
            </button>
            <div className="user-chip-card">
              <div className="user-avatar">A</div>
              <div>
                <strong>Alex Morgan</strong>
                <p>{role === 'executive' ? 'Executive' : role[0].toUpperCase() + role.slice(1)}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="page-body"><Outlet /></section>

        <nav className="mobile-nav">
          {moduleItems.slice(0, 5).map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}>
              {label}
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
}
