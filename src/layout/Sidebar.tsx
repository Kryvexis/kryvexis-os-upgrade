import { NavLink } from 'react-router-dom';
import { sidebarNavigation } from './navigation';
import { usePreferences } from '../preferences/PreferencesProvider';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

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
        <div className="brand-block brand-block-vertical premium-brand-block">
          <div className="brand-image-wrap premium-brand-image-wrap">
            <img src="/kryvexis-brand.png" alt="Kryvexis brand" className="brand-image" />
          </div>
          <div className="brand-copy">
            <p className="eyebrow">Premium business OS</p>
            <h1>Kryvexis OS</h1>
            <p className="brand-subcopy">Phase 1 brings the shell, commerce workspaces, settings, and mobile navigation together.</p>
          </div>
        </div>

        <div className="branch-card muted-card compact-card premium-branch-card">
          <span className="eyebrow">Current context</span>
          <strong>{branchName}</strong>
          <p>{activeRole[0].toUpperCase() + activeRole.slice(1)} workspace active.</p>
        </div>

        {visibleSections.map((section) => (
          <nav key={section.label} className="nav-section premium-nav-section">
            <span className="nav-section-label">{section.label}</span>
            <div className="nav-links premium-nav-links">
              {section.items.map((item) => (
                <NavLink key={item.href} to={item.href} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <div className="nav-link-copy">
                    <strong>{item.label}</strong>
                  </div>
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
