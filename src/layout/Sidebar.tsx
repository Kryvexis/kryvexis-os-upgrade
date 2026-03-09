import { NavLink } from 'react-router-dom';
import { type NavIconKey, sidebarNavigation } from './navigation';
import { usePreferences } from '../preferences/PreferencesProvider';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

function NavIcon({ icon }: { icon?: NavIconKey }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const
  };

  switch (icon) {
    case 'sales':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M4 18h16" />
          <path {...common} d="M7 18V9" />
          <path {...common} d="M12 18V6" />
          <path {...common} d="M17 18v-4" />
        </svg>
      );
    case 'inventory':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M4 8 12 4l8 4-8 4-8-4Z" />
          <path {...common} d="M4 8v8l8 4 8-4V8" />
          <path {...common} d="M12 12v8" />
        </svg>
      );
    case 'finance':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M5 8h14" />
          <path {...common} d="M7 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
          <path {...common} d="M9 13h6" />
          <path {...common} d="M9 17h3" />
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z" />
          <path {...common} d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1 1 0 0 1 0 1.4l-1.2 1.2a1 1 0 0 1-1.4 0l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1 1 0 0 1-1 1h-1.8a1 1 0 0 1-1-1v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a1 1 0 0 1-1.4 0l-1.2-1.2a1 1 0 0 1 0-1.4l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1 1 0 0 1-1-1v-1.8a1 1 0 0 1 1-1h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a1 1 0 0 1 0-1.4l1.2-1.2a1 1 0 0 1 1.4 0l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a1 1 0 0 1 1-1h1.8a1 1 0 0 1 1 1v.2a1 1 0 0 0 .7.9 1 1 0 0 0 1.1-.2l.1-.1a1 1 0 0 1 1.4 0l1.2 1.2a1 1 0 0 1 0 1.4l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a1 1 0 0 1 1 1v1.8a1 1 0 0 1-1 1h-.2a1 1 0 0 0-.9.7Z" />
        </svg>
      );
    case 'dashboard':
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M4 5h7v6H4z" />
          <path {...common} d="M13 5h7v4h-7z" />
          <path {...common} d="M13 11h7v8h-7z" />
          <path {...common} d="M4 13h7v6H4z" />
        </svg>
      );
  }
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { activeRole, branchName } = usePreferences();

  const visibleSections = sidebarNavigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.roles || item.roles.includes(activeRole))
    }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      <div className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar glass-panel ${isOpen ? 'mobile-open' : ''}`}>
        <div className="brand-block brand-block-vertical premium-brand-block rebuilt-brand-block">
          <div className="brand-image-wrap premium-brand-image-wrap rebuilt-brand-image-wrap">
            <img src="/kryvexis-brand.png" alt="Kryvexis brand" className="brand-image" />
          </div>
          <div className="brand-copy rebuilt-brand-copy">
            <p className="eyebrow">Kryvexis workspace</p>
            <h1>Kryvexis OS</h1>
            <p className="brand-subcopy">Phase 1 shell rebuilt around calmer navigation, cleaner workspaces, and a more premium operating feel.</p>
          </div>
        </div>

        <div className="branch-card muted-card compact-card premium-branch-card rebuilt-branch-card">
          <span className="eyebrow">Current context</span>
          <strong>{branchName}</strong>
          <p>{activeRole[0].toUpperCase() + activeRole.slice(1)} workspace active.</p>
        </div>

        {visibleSections.map((section) => (
          <nav key={section.label} className="nav-section premium-nav-section rebuilt-nav-section" aria-label={section.label}>
            <span className="nav-section-label">{section.label}</span>
            <div className="nav-links premium-nav-links rebuilt-nav-links">
              {section.items.map((item) => (
                <NavLink key={item.href} to={item.href} className={({ isActive }) => `nav-link rebuilt-nav-link ${isActive ? 'active' : ''}`}>
                  <span className="nav-icon-shell"><NavIcon icon={item.icon} /></span>
                  <span className="nav-link-copy rebuilt-nav-copy">
                    <strong>{item.label}</strong>
                    {item.description ? <span className="nav-link-detail">{item.description}</span> : null}
                  </span>
                  {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
                </NavLink>
              ))}
            </div>
          </nav>
        ))}
      </aside>
    </>
  );
}
