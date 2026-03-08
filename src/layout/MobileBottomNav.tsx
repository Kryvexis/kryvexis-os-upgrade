import { NavLink } from 'react-router-dom';
import { bottomNavigation } from './navigation';

export function MobileBottomNav() {
  return (
    <nav className="mobile-bottom-nav glass-panel" aria-label="Mobile navigation">
      {bottomNavigation.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
        >
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
