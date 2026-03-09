import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { userMenuItems } from './navigation';
import { useTheme } from '../theme/ThemeProvider';
import { usePreferences } from '../preferences/PreferencesProvider';

const themeLabelMap = {
  light: 'Light',
  dark: 'Dark',
  system: 'System'
} as const;

const roleLabelMap = {
  admin: 'Admin',
  sales: 'Sales Rep',
  warehouse: 'Warehouse',
  finance: 'Finance',
  procurement: 'Procurement',
  operations: 'Operations'
} as const;

type TopbarProps = {
  subtitle: string;
  onMenuClick: () => void;
};

export function Topbar({ subtitle, onMenuClick }: TopbarProps) {
  const { theme, cycleTheme } = useTheme();
  const { activeRole, branchName } = usePreferences();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="topbar glass-panel rebuilt-topbar">
      <div className="topbar-title-row rebuilt-topbar-title-row">
        <button className="icon-button mobile-only" type="button" onClick={onMenuClick} aria-label="Open navigation menu">
          ☰
        </button>
        <div>
          <p className="eyebrow">Phase 1 · Shell and core commerce</p>
          <h2>{subtitle}</h2>
        </div>
      </div>

      <div className="topbar-actions rebuilt-topbar-actions">
        <label className="search-shell rebuilt-search-shell" aria-label="Search workspace">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input placeholder="Search customers, invoices, products, suppliers, approvals" />
        </label>
        <div className="desktop-only rebuilt-action-row">
          <button className="soft-button" type="button" onClick={cycleTheme} aria-label={`Change theme mode. Current mode ${themeLabelMap[theme]}`}>
            {themeLabelMap[theme]}
          </button>
          <NavLink className="soft-button" to="/notifications">Alerts</NavLink>
          <button className="soft-button primary" type="button">Create</button>
        </div>
        <div className="user-menu-wrap">
          <button className="user-menu-trigger rebuilt-user-trigger" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="Open user menu">
            <span className="avatar">A</span>
            <span className="desktop-only user-meta">
              <strong>Antonie Meyer</strong>
              <small>{roleLabelMap[activeRole]} · {branchName}</small>
            </span>
          </button>
          {menuOpen ? (
            <div className="user-menu glass-panel">
              <div className="user-menu-header">
                <strong>Signed in as Antonie Meyer</strong>
                <p>{roleLabelMap[activeRole]} workspace · {branchName}</p>
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
