import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { userMenuItems } from './navigation';
import { useTheme } from '../theme/ThemeProvider';

const themeLabelMap = {
  light: 'Light',
  dark: 'Dark',
  system: 'System'
} as const;

type TopbarProps = {
  subtitle: string;
  onMenuClick: () => void;
};

export function Topbar({ subtitle, onMenuClick }: TopbarProps) {
  const { theme, cycleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="topbar glass-panel">
      <div className="topbar-title-row">
        <button className="icon-button mobile-only" type="button" onClick={onMenuClick} aria-label="Open navigation menu">
          ☰
        </button>
        <div>
          <p className="eyebrow">Business Operating System</p>
          <h2>{subtitle}</h2>
        </div>
      </div>

      <div className="topbar-actions">
        <label className="search-shell" aria-label="Search workspace">
          <span>⌘K</span>
          <input placeholder="Search customers, invoices, stock, actions..." />
        </label>
        <button className="soft-button desktop-only" type="button" onClick={cycleTheme} aria-label={`Change theme mode. Current mode ${themeLabelMap[theme]}`}>
          Theme: {themeLabelMap[theme]}
        </button>
        <button className="soft-button desktop-only" type="button">Notifications</button>
        <button className="soft-button primary desktop-only" type="button">Quick Create</button>
        <div className="user-menu-wrap">
          <button className="user-menu-trigger" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="Open user menu">
            <span className="avatar">A</span>
            <span className="desktop-only user-meta">
              <strong>Antonie Meyer</strong>
              <small>Admin · Main Branch</small>
            </span>
          </button>
          {menuOpen ? (
            <div className="user-menu glass-panel">
              <div className="user-menu-header">
                <strong>Signed in as Antonie Meyer</strong>
                <p>Kryvexis OS workspace controls</p>
              </div>
              <div className="user-menu-links">
                {userMenuItems.map((item) => (
                  item.href === '#' ? (
                    <button key={item.label} className="menu-link danger" type="button">{item.label}</button>
                  ) : (
                    <NavLink key={item.label} to={item.href} className="menu-link" onClick={() => setMenuOpen(false)}>
                      {item.label}
                    </NavLink>
                  )
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
