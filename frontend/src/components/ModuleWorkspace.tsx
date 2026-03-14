import { Link } from 'react-router-dom';

type WorkspaceItem = {
  title: string;
  to: string;
  icon: string;
  wide?: boolean;
};

export function ModuleWorkspace({
  title,
  items,
  sidebarLabel
}: {
  title: string;
  items: WorkspaceItem[];
  sidebarLabel?: string;
}) {
  return (
    <div className="mockup-module-page-clean">
      <div className="mockup-module-grid">
        {items.map((item) => (
          <Link key={item.title} to={item.to} className={`mockup-module-tile ${item.wide ? 'wide' : ''}`.trim()}>
            <span className="mockup-module-icon">{item.icon}</span>
            <strong>{item.title}</strong>
          </Link>
        ))}
      </div>
      {sidebarLabel ? <div className="sr-only">{sidebarLabel}</div> : null}
    </div>
  );
}
