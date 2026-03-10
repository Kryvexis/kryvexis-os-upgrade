import { NavLink, Outlet } from 'react-router-dom';
import { navSections } from '../data/mock';

export function AppShell() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">K</div>
          <div>
            <strong>Kryvexis OS</strong>
            <p>Soft Business Control Room</p>
          </div>
        </div>
        {navSections.map((section) => (
          <div key={section.title} className="nav-section">
            <p className="nav-label">{section.title}</p>
            {section.items.map((item) => (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </aside>
      <div className="main-frame">
        <header className="topbar">
          <div>
            <p className="eyebrow">Branch-aware workspace</p>
            <h2>Johannesburg Primary Branch</h2>
          </div>
          <div className="topbar-actions">
            <div className="search-chip">Search records, actions, customers…</div>
            <div className="user-chip">AM</div>
          </div>
        </header>
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
