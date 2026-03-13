import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import type { Notification, RoleKey } from '../types';

const coreModules = [
  ['/', 'Dashboard', 'dashboard'],
  ['/sales', 'Sales', 'sales'],
  ['/inventory', 'Inventory', 'inventory'],
  ['/procurement', 'Purchasing', 'purchasing'],
  ['/accounting', 'Accounting', 'accounting'],
  ['/operations', 'Operations', 'operations']
] as const;

const utilityModules = [
  ['/notifications', 'Notifications', 'notifications'],
  ['/roles', 'Roles', 'roles'],
  ['/settings', 'Settings', 'settings']
] as const;

const pageTitles: Array<[string, string]> = [
  ['/sales', 'Sales'],
  ['/inventory', 'Inventory'],
  ['/procurement', 'Purchasing'],
  ['/accounting', 'Accounting'],
  ['/operations', 'Operations'],
  ['/customers', 'Customers'],
  ['/quotes', 'Quotes'],
  ['/invoices', 'Invoices'],
  ['/products', 'Products'],
  ['/payments', 'Payments'],
  ['/notifications', 'Notifications'],
  ['/roles', 'Roles'],
  ['/settings', 'Settings']
];

function NavGlyph({ kind }: { kind: string }) {
  return <span className={`nav-glyph nav-glyph-${kind}`} aria-hidden="true" />;
}

export function AppShell({ role }: { role: RoleKey; setRole: (role: RoleKey) => void; theme: 'dark' | 'light' | 'system'; setTheme: (theme: 'dark' | 'light' | 'system') => void }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const activeLabel = pageTitles.find(([prefix]) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`))?.[1] ?? 'Dashboard';

  useEffect(() => {
    api.notifications().then(setNotifications).catch(() => setNotifications([]));
  }, [location.pathname]);

  useEffect(() => {
    setAlertsOpen(false);
    if (typeof window !== 'undefined' && window.innerWidth <= 860) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const unread = notifications.filter((item) => !item.read && !item.dismissed).length;
  const recentAlerts = notifications.filter((item) => !item.dismissed).slice(0, 5);

  return (
    <div className={`app-shell mockup-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <aside className="sidebar mockup-sidebar">
        <div className="brand-block mockup-brand-block">
          <span className="brand-cube" aria-hidden="true" />
          <div>
            <strong>Kryvexis OS</strong>
          </div>
        </div>

        <nav className="nav-list nav-list-icons mockup-nav-list">
          {coreModules.map(([to, label, icon]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link nav-link-icon mockup-nav-link ${isActive ? 'active' : ''}`}>
              <NavGlyph kind={icon} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-divider" />

        <nav className="nav-list nav-list-icons mockup-nav-list utility-nav-list">
          {utilityModules.map(([to, label, icon]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link nav-link-icon mockup-nav-link ${isActive ? 'active' : ''}`}>
              <NavGlyph kind={icon} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-area mockup-main-area">
        <header className="topbar topbar-shell mockup-topbar-shell">
          <div className="topbar-leading mockup-topbar-leading">
            <button className="menu-chip mockup-menu-chip" type="button" aria-label="Toggle navigation" onClick={() => setSidebarOpen((v) => !v)}>≡</button>
            <h1>{activeLabel}</h1>
          </div>

          <div className="topbar-actions topbar-user-row mockup-topbar-actions">
            <div className={`topbar-popover ${alertsOpen ? 'open' : ''}`}>
              <button className="icon-chip mockup-bell-chip" type="button" aria-label="Open notifications" onClick={() => setAlertsOpen((v) => !v)}>
                <span className="nav-glyph nav-glyph-notifications" aria-hidden="true" />
                {unread ? <span className="icon-badge">{unread}</span> : null}
              </button>
              {alertsOpen ? (
                <div className="popover-menu alerts-menu mockup-popover-menu">
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

            <div className="user-chip mockup-user-chip">
              <span className="user-avatar">A</span>
              <div>
                <strong>Alex Morgan</strong>
                <p>{role.charAt(0).toUpperCase() + role.slice(1)}</p>
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
