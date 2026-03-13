import { Link } from 'react-router-dom';

const items = [
  { title: 'Tasks', subtitle: 'Day-to-day work queue and ownership.', to: '/notifications' },
  { title: 'Approvals', subtitle: 'Review gates and approval control.', to: '/notifications' },
  { title: 'Deliveries', subtitle: 'Operational movement to customers.', to: '/payments' },
  { title: 'Returns', subtitle: 'Returned goods and corrective flow.', to: '/products' }
];

export function OperationsWorkspacePage() {
  return (
    <div className="module-page">
      <section className="module-shell">
        <div className="module-shell-head">
          <div>
            <span className="eyebrow">Operations workspace</span>
            <h2>Operations</h2>
            <p>Tasks, approvals, deliveries, and returns grouped into a cleaner operational control surface.</p>
          </div>
          <div className="module-shell-stat">
            <strong>4</strong>
            <span>Control blocks</span>
          </div>
        </div>
        <div className="workspace-block-grid workspace-block-grid-four">
          {items.map((item) => (
            <Link key={item.title} to={item.to} className="workspace-block">
              <span className="workspace-block-icon" />
              <strong>{item.title}</strong>
              <p>{item.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
