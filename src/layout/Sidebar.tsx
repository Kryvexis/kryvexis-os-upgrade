import { NavLink } from 'react-router-dom';
import { roleOptions, sidebarNavigation } from './navigation';
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
        <div className="brand-block brand-block-vertical">
          <div className="brand-image-wrap">
            <img src="/kryvexis-brand.png" alt="Kryvexis brand" className="brand-image" />
          </div>
          <div className="brand-copy">
            <p className="eyebrow">Soft Business</p>
            <h1>Kryvexis OS</h1>
          </div>
        </div>

        <div className="branch-card muted-card">
          <span className="eyebrow">Active branch</span>
          <strong>{branchName}</strong>
          <p>Ready for modular rollout and workflow testing.</p>
        </div>

        <div className="branch-card muted-card compact-card">
          <span className="eyebrow">Role preview</span>
          <div className="role-list">
            {roleOptions.map((role) => (
              <div key={role.key} className={`role-item ${activeRole === role.key ? 'active' : ''}`}>
                <strong>{role.label}</strong>
                <p>{role.description}</p>
              </div>
            ))}
          </div>
        </div>

        {visibleSections.map((section) => (
          <nav key={section.label} className="nav-section">
            <span className="nav-section-label">{section.label}</span>
            <div className="nav-links">
              {section.items.map((item) => (
                <NavLink key={item.href} to={item.href} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <div>
                    <strong>{item.label}</strong>
                    {item.description ? <p>{item.description}</p> : null}
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
