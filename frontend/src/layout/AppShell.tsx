import { NavLink, Outlet, useLocation } from 'react-router-dom';
import type { RoleKey } from '../types';

const coreNav = [
  ['/', 'Dashboard'],
  ['/sales', 'Sales'],
  ['/inventory', 'Inventory'],
  ['/procurement', 'Procurement'],
  ['/accounting', 'Accounting'],
  ['/operations', 'Operations'],
  ['/notifications', 'Inbox']
] as const;

const adminNav = [
  ['/roles', 'Roles'],
  ['/settings', 'Settings']
] as const;

const activeRouteLabels = [
  ...coreNav,
  ...adminNav,
  ['/customers', 'Sales'],
  ['/quotes', 'Sales'],
  ['/invoices', 'Sales'],
  ['/payments', 'Sales'],
  ['/products', 'Inventory']
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

function NavGroup({ title, items }: { title: string; items: readonly (readonly [string, string])[] }) {
  return (
    <div className="sidebar-group">
      <p className="sidebar-group-label">{title}</p>
      <div className="nav-list">
        {items.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-dot" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export function AppShell({ role, setRole, theme, setTheme }: { role: RoleKey; setRole: (role: RoleKey) => void; theme: 'dark' | 'light' | 'system'; setTheme: (theme: 'dark' | 'light' | 'system') => void; }) {
  const location = useLocation();
  const activeLabel = activeRouteLabels.find(([to]) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to))?.[1] ?? 'Workspace';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-mark">K</span>
          <div>
            <strong>Kryvexis OS</strong>
            <p>{roleLabels[role]} workspace</p>
          </div>
        </div>

        <NavGroup title="Core modules" items={coreNav} />
        <NavGroup title="Admin" items={adminNav} />

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
            <button className="menu-chip" type="button" aria-label="Open navigation">≡</button>
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
          {[...coreNav].slice(0, 5).map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}>
              {label}
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
}
