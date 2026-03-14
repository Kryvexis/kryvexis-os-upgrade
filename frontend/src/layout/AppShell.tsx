import '../styles/ui-lock.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import type { Notification, RoleKey } from '../types';

const coreModules = [
  ['/', 'Dashboard', '◔'],
  ['/sales', 'Sales', '⌁'],
  ['/inventory', 'Inventory', '◫'],
  ['/procurement', 'Purchasing', '◎'],
  ['/accounting', 'Accounting', '◌'],
  ['/operations', 'Operations', '↗'],
  ['/reports', 'Reports', '▣']
] as const;

const adminItems = [
  ['/roles', 'Roles', '⌘'],
  ['/settings', 'Settings', '⚙']
] as const;

const roleLabels: Record<RoleKey, string> = {
  admin: 'Admin',
  sales: 'Sales',
  finance: 'Finance',
  warehouse: 'Warehouse',
  procurement: 'Procurement',
  operations: 'Operations',
  manager: 'Manager',
  executive: 'Executive'
};

const pageTitles: Array<[string, string]> = [
  ['/sales', 'Sales'],
  ['/inventory', 'Inventory'],
  ['/procurement', 'Purchasing'],
  ['/accounting', 'Accounting'],
  ['/operations', 'Operations'],
  ['/reports', 'Reports'],
  ['/customers', 'Customers'],
  ['/quotes', 'Quotes'],
  ['/invoices', 'Invoices'],
  ['/products', 'Products'],
  ['/payments', 'Payments'],
  ['/notifications', 'Notifications'],
  ['/roles', 'Roles'],
  ['/settings', 'Settings']
];

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'K';
}

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    api.notifications().then(setNotifications).catch(() => setNotifications([]));
  }, [location.pathname]);

  useEffect(() => {
    setAlertsOpen(false);
    setUserOpen(false);
    if (typeof window !== 'undefined' && window.innerWidth <= 860) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function toggleNav() {
    if (typeof window !== 'undefined' && window.innerWidth <= 860) {
      setSidebarOpen((value) => !value);
    } else {
      setSidebarCollapsed((value) => !value);
    }
  }

  const shellClass = ['app-shell', sidebarCollapsed ? 'sidebar-collapsed' : '', sidebarOpen ? 'sidebar-open' : '']
    .filter(Boolean)
    .join(' ');
  const unread = notifications.filter((item) => !item.read && !item.dismissed).length;
  const recentAlerts = notifications.filter((item) => !item.dismissed).slice(0, 4);
  const activeLabel = pageTitles.find(([prefix]) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`))?.[1] ?? 'Dashboard';
  const isDashboard = location.pathname === '/';
  const breadcrumb = useMemo(() => {
    if (isDashboard) return 'Dashboard';
    return `Module / ${activeLabel}`;
  }, [activeLabel, isDashboard]);

  const userName = 'Antonie Meyer';

  return (
    <div className={shellClass}>
      {sidebarOpen ? <button className="sidebar-overlay" type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} /> : null}

      <aside className="sidebar mockup-sidebar">
        <Link to="/" className="brand-block mockup-brand-block">
          <span className="brand-mark brand-mark-cube" />
          <div>
            <strong>Kryvexis OS</strong>
          </div>
        </Link>

        <nav className="nav-list nav-list-icons mockup-nav-list">
          {coreModules.map(([to, label, icon]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link nav-link-icon mockup-nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-link-icon-mark">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-divider" />

        <nav className="nav-list nav-list-icons mockup-nav-list admin-mini-nav">
          <NavLink to="/notifications" className={({ isActive }) => `nav-link nav-link-icon mockup-nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link-icon-mark">✦</span>
            <span>Notifications</span>
          </NavLink>
          {adminItems.map(([to, label, icon]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link nav-link-icon mockup-nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-link-icon-mark">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-area mockup-main-area">
        <header className="topbar topbar-shell mockup-topbar-shell">
          <div className="topbar-leading mockup-topbar-leading">
            <button className="menu-chip mockup-menu-chip" type="button" aria-label="Toggle navigation" onClick={toggleNav}>☰</button>
            <div>
              <h1 className="mockup-page-title">{activeLabel}</h1>
              <span className="topbar-breadcrumb mockup-breadcrumb">{breadcrumb}</span>
            </div>
          </div>

          <div className="topbar-actions topbar-user-row mockup-topbar-actions">
            <div className={`topbar-popover ${alertsOpen ? 'open' : ''}`}>
              <button className="icon-chip mockup-icon-chip" type="button" aria-label="Open notifications" onClick={() => setAlertsOpen((value) => !value)}>
                ✦
                {unread ? <span className="icon-badge">{unread}</span> : null}
              </button>
              {alertsOpen ? (
                <div className="popover-menu alerts-menu mockup-popover">
                  <div className="popover-menu-head">
                    <strong>Notifications</strong>
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

            <div className="topbar-popover" ref={userMenuRef}>
              <button className="user-chip mockup-user-chip" type="button" onClick={() => setUserOpen((value) => !value)}>
                <span className="user-avatar">{initials(userName)}</span>
                <div>
                  <strong>{userName}</strong>
                  <p>{roleLabels[role]}</p>
                </div>
              </button>
              {userOpen ? (
                <div className="popover-menu user-menu-popover mockup-popover">
                  <div className="user-menu-section">
                    <span className="eyebrow">Quick settings</span>
                    <label className="stack-field compact-field">
                      <span>Role</span>
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
                    <label className="stack-field compact-field">
                      <span>Theme</span>
                      <select value={theme} onChange={(event) => setTheme(event.target.value as 'dark' | 'light' | 'system')}>
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="system">System</option>
                      </select>
                    </label>
                  </div>
                  <div className="user-menu-links">
                    <Link to="/pos" className="popover-link">Open POS</Link>
                    <Link to="/settings" className="popover-link">Settings</Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <section className="page-body mockup-page-body"><Outlet /></section>

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
