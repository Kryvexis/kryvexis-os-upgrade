import { Link } from 'react-router-dom';

const items = [
  { title: 'Suppliers', subtitle: 'Commercial partners, lead times, and contacts.', to: '/notifications' },
  { title: 'Purchase Orders', subtitle: 'PO queue, approvals, and issue-to-receipt flow.', to: '/notifications' },
  { title: 'Reorders', subtitle: 'Threshold-driven reorder candidates and follow-up.', to: '/products' },
  { title: 'Goods Received', subtitle: 'Inbound stock acknowledgement and receiving control.', to: '/products' },
  { title: 'Supplier Bills', subtitle: 'Bills matched against deliveries and PO references.', to: '/invoices' }
];

export function ProcurementWorkspacePage() {
  return (
    <div className="module-page">
      <section className="module-shell">
        <div className="module-shell-head">
          <div>
            <span className="eyebrow">Procurement workspace</span>
            <h2>Procurement</h2>
            <p>POs, suppliers, reorders, and goods received live under one procurement module instead of separate flat links.</p>
          </div>
          <div className="module-shell-stat">
            <strong>5</strong>
            <span>Control blocks</span>
          </div>
        </div>

        <div className="module-chip-row">
          <span className="module-chip">1 pending PO</span>
          <span className="module-chip">3 suppliers</span>
        </div>

        <div className="workspace-block-grid workspace-block-grid-five">
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
