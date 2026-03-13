import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Notification, RoleKey } from '../types';

const coreModules = [
  ['/', 'Dashboard', '◔'],
  ['/sales', 'Sales', '⌁'],
  ['/inventory', 'Inventory', '◫'],
  ['/procurement', 'Purchasing', '◎'],
  ['/accounting', 'Accounting', '◌'],
  ['/operations', 'Operations', '↗']
] as const;

const utilityItems = [
  ['/notifications', 'Notifications', '✦'],
  ['/roles', 'Roles', '⌘'],
  ['/settings', 'Settings', '⚙']
] as const;

const quickActions = [
  { label: 'Open POS', to: '/pos' },
  { label: 'Customers', to: '/customers' },
  { label: 'Quotes', to: '/quotes' },
  { label: 'Invoices', to: '/invoices' },
  { label: 'Payments', to: '/payments' }
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
  ['/procurement', 'Purchasing'],
  ['/accounting', 'Accounting'],
  ['/operations', 'Operations'],
  ['/pos', 'POS'],
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const activeLabel = pageTitles.find(([prefix]) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`))?.[1] ?? 'Dashboard';

  useEffect(() => {
    api.notifications().then(setNotifications).catch(() => setNotifications([]));
  }, [location.pathname]);

  useEffect(() => {
    setAlertsOpen(false);
    setQuickOpen(false);
    setUserMenuOpen(false);
    if (typeof window !== 'undefined' && window.innerWidth <= 860) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  function toggleNav() {
    if (typeof window !== 'undefined' && window.innerWidth <= 860) {
      setSidebarOpen((v) => !v);
      return;
    }
    setSidebarCollapsed((v) => !v);
  }

  const shellClass = ['app-shell', sidebarCollapsed ? 'sidebar-collapsed' : '', sidebarOpen ? 'sidebar-open' : ''].filter(Boolean).join(' ');
  const unread = notifications.filter((item) => !item.read && !item.dismissed).length;
  const recentAlerts = notifications.filter((item) => !item.dismissed).slice(0, 5);
  const breadcrumb = useMemo(() => {
    const section = pageTitles.find(([prefix]) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`))?.[1] ?? 'Dashboard';
    return section === 'Dashboard' ? 'Executive view' : `Module / ${section}`;
  }, [location.pathname]);

  return (
    <div className={shellClass}>
      {sidebarOpen ? <button className="sidebar-overlay" type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} /> : null}

      <aside className="sidebar">
        <div className="brand-block brand-block-tight">
          <span className="brand-mark">K</span>
          <div>
            <strong>Kryvexis OS</strong>
            <p>{roleLabels[role]} workspace</p>
          </div>
        </div>

        <div className="nav-section">
          <nav className="nav-list nav-list-icons">
            {coreModules.map(([to, label, icon]) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link nav-link-icon ${isActive ? 'active' : ''}`}>
                <span className="nav-link-icon-mark">{icon}</span>
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="nav-section utility-nav-section">
          <nav className="nav-list nav-list-icons">
            {utilityItems.map(([to, label, icon]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `nav-link nav-link-icon ${isActive ? 'active' : ''}`}>
                <span className="nav-link-icon-mark">{icon}</span>
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar topbar-shell enhanced-topbar-shell">
          <div className="topbar-leading">
            <button className="menu-chip interactive-menu-chip" type="button" aria-label={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'} onClick={toggleNav} title={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}>
              {sidebarCollapsed || sidebarOpen ? '→' : '≡'}
            </button>
            <div>
              <p className="eyebrow">One shell • one workflow language</p>
              <h1>{activeLabel}</h1>
              <span className="topbar-breadcrumb">{breadcrumb}</span>
            </div>
          </div>

          <div className="topbar-actions topbar-user-row enhanced-topbar-actions">
            <div className={`topbar-popover ${quickOpen ? 'open' : ''}`}>
              <button className="ghost-button topbar-action-button" type="button" onClick={() => setQuickOpen((v) => !v)}>＋ Quick actions</button>
              {quickOpen ? (
                <div className="popover-menu quick-actions-menu">
                  {quickActions.map((action) => (
                    <Link key={action.label} to={action.to} className="popover-link">{action.label}</Link>
                  ))}
                </div>
              ) : null}
            </div>

            <div className={`topbar-popover ${alertsOpen ? 'open' : ''}`}>
              <button className="icon-chip topbar-bell-button" type="button" aria-label="Open inbox" onClick={() => setAlertsOpen((v) => !v)}>
                ✦
                {unread ? <span className="icon-badge">{unread}</span> : null}
              </button>
              {alertsOpen ? (
                <div className="popover-menu alerts-menu">
                  <div className="popover-menu-head">
                    <strong>Inbox</strong>
                    <Link to="/notifications" className="action-link">Open all</Link>
                  </div>
                  <div className="alerts-menu-list">
                    {recentAlerts.map((item) => (
                      <Link key={item.id} to="/notifications" className="alert-preview-row">
                        <strong>{item.title}</strong>
                        <p>{item.meta}</p>
                      </Link>
                    ))}
                    {!recentAlerts.length ? <div className="alert-preview-row empty">No active alerts</div> : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className={`topbar-popover user-menu-anchor ${userMenuOpen ? 'open' : ''}`} ref={userMenuRef}>
              <button className="user-chip enhanced-user-chip interactive-user-chip" type="button" onClick={() => setUserMenuOpen((v) => !v)} aria-label="Open user menu">
                <span className="user-avatar">A</span>
                <div>
                  <strong>Alex Morgan</strong>
                  <p>{roleLabels[role]}</p>
                </div>
                <span className="user-chip-caret">▾</span>
              </button>
              {userMenuOpen ? (
                <div className="popover-menu user-menu-panel">
                  <div className="popover-menu-head user-menu-head">
                    <div>
                      <strong>Quick settings</strong>
                      <p>Adjust your workspace without leaving the screen.</p>
                    </div>
                  </div>
                  <div className="quick-settings-stack">
                    <label className="stack-field compact-stack-field">
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

                    <label className="stack-field compact-stack-field">
                      <span>Theme</span>
                      <select value={theme} onChange={(e) => setTheme(e.target.value as 'dark' | 'light' | 'system')}>
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="system">System</option>
                      </select>
                    </label>

                    <div className="user-menu-links">
                      <Link to="/pos" className="popover-link">Open POS</Link>
                      <Link to="/settings" className="popover-link">System settings</Link>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <section className="page-body"><Outlet /></section>

        <nav className="mobile-nav">
          {[...coreModules, ['/notifications', 'Inbox', '✦'] as const].slice(0, 6).map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}>
              {label}
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
}
