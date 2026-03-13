import { Link } from 'react-router-dom';

const items = [
  { title: 'Customers', subtitle: 'Accounts, credit posture, and next actions.', to: '/customers' },
  { title: 'Quotes', subtitle: 'Drafts, approvals, and quote-to-invoice flow.', to: '/quotes' },
  { title: 'Invoices', subtitle: 'Issued invoices, reminders, and collections.', to: '/invoices' },
  { title: 'Payments', subtitle: 'Receipts, proof checks, and allocations.', to: '/payments' }
];

export function SalesWorkspacePage() {
  return (
    <div className="module-page">
      <section className="module-shell">
        <div className="module-shell-head">
          <div>
            <span className="eyebrow">Sales workspace</span>
            <h2>Sales</h2>
            <p>Open the core sales blocks the way your mockup is structured — module first, records second.</p>
          </div>
          <div className="module-shell-stat">
            <strong>4</strong>
            <span>Core blocks</span>
          </div>
        </div>

        <div className="module-chip-row">
          {items.map((item) => <span key={item.title} className="module-chip">{item.title}</span>)}
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
