import { NavLink } from 'react-router-dom';

export function SectionTabs({ items }: { items: Array<{ label: string; href: string }> }) {
  return (
    <nav className="section-tabs" aria-label="Section tabs">
      {items.map((item) => (
        <NavLink key={item.href} to={item.href} className={({ isActive }) => `section-tab ${isActive ? 'active' : ''}`}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
