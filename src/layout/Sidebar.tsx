import { NavLink } from 'react-router-dom';
import { primaryNavigation, roleOptions } from './navigation';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      <div className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar glass-panel ${isOpen ? 'mobile-open' : ''}`}>
        <div className="brand-block">
          <div className="brand-mark">K</div>
          <div>
            <p className="eyebrow">Soft Business</p>
            <h1>Kryvexis OS</h1>
          </div>
        </div>

        <div className="branch-card muted-card">
          <span className="eyebrow">Active branch</span>
          <strong>Main Branch</strong>
          <p>Ready for modular rollout and workflow testing.</p>
        </div>

        <div className="branch-card muted-card compact-card">
          <span className="eyebrow">Role preview</span>
          <div className="role-stack">
            {roleOptions.map((role) => (
              <button key={role.label} className="role-pill" type="button">
                <span>{role.label}</span>
                <small>{role.description}</small>
              </button>
            ))}
          </div>
        </div>

        <nav className="nav-groups" aria-label="Primary navigation">
          {primaryNavigation.map((section) => (
            <div key={section.label} className="nav-section">
              <p className="nav-label">{section.label}</p>
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <div>
                    <span>{item.label}</span>
                    {item.description ? <small>{item.description}</small> : null}
                  </div>
                  {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
