import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import type { Notification, RoleKey } from '../types';

type ThemeMode = 'dark' | 'light' | 'system';

const navItems: Array<{ to: string; label: string; icon: string }> = [
  { to: '/', label: 'Dashboard', icon: '◔' },
  { to: '/customers', label: 'Customers', icon: '◧' },
  { to: '/sales', label: 'Sales', icon: '◫' },
  { to: '/procurement', label: 'Purchasing', icon: '▿' },
  { to: '/accounting', label: 'Accounting', icon: '◎' },
  { to: '/operations', label: 'Operations', icon: '↗' },
  { to: '/reports', label: 'Reports', icon: '▣' }
];

const utilityItems: Array<{ to: string; label: string; icon: string }> = [
  { to: '/notifications', label: 'Notifications', icon: '◉' },
  { to: '/roles', label: 'Roles', icon: '⌘' },
  { to: '/settings', label: 'Settings', icon: '⚙' }
];

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
  ['/settings', 'Settings']
];

export function AppShell({
  role,
  setRole,
  theme,
  setTheme
}: {
  role: RoleKey;
  setRole: (role: RoleKey) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}) {
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.filter((item) => !item.read && !item.dismissed).length;
  const title = useMemo(() => {
    const match = pageTitles.find(([prefix]) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`));
    return match?.[1] ?? 'Dashboard';
  }, [location.pathname]);

  useEffect(() => {
    api.notifications().then(setNotifications).catch(() => setNotifications([]));
  }, [location.pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setUserOpen(false);
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className={`mock-shell ${sidebarOpen ? 'mock-shell-sidebar-open' : ''}`}>
      <aside className="mock-sidebar">
        <div className="mock-brand">
          <span className="mock-brand-mark" />
          <strong>Kryvexis OS</strong>
        </div>

        <nav className="mock-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `mock-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="mock-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mock-sidebar-divider" />

        <nav className="mock-sidebar-nav mock-sidebar-nav-secondary">
          {utilityItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `mock-nav-link ${isActive ? 'active' : ''}`}>
              <span className="mock-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.to === '/notifications' && unreadCount > 0 ? <em className="mock-notification-badge">{unreadCount}</em> : null}
            </NavLink>
          ))}
        </nav>
      </aside>

      {sidebarOpen ? <button className="mock-sidebar-overlay" type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} /> : null}

      <main className="mock-main">
        <header className="mock-topbar">
          <div className="mock-topbar-left">
            <button className="mock-menu-button" type="button" onClick={() => setSidebarOpen((value) => !value)} aria-label="Toggle menu">
              ≡
            </button>
            <strong>{title}</strong>
          </div>

          <div className="mock-topbar-right" ref={dropdownRef}>
            <Link to="/notifications" className="mock-icon-button" aria-label="Notifications">
              🔔
              {unreadCount > 0 ? <span className="mock-icon-dot" /> : null}
            </Link>
            <button className="mock-user-chip" type="button" onClick={() => setUserOpen((value) => !value)}>
              <span className="mock-avatar">A</span>
              <div>
                <strong>Antonie Meyer</strong>
                <span>{roleLabels[role]}</span>
              </div>
            </button>

            {userOpen ? (
              <div className="mock-user-menu">
                <label>
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
                <label>
                  <span>Theme</span>
                  <select value={theme} onChange={(event) => setTheme(event.target.value as ThemeMode)}>
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </select>
                </label>
              </div>
            ) : null}
          </div>
        </header>

        <section className="mock-page-wrap">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
