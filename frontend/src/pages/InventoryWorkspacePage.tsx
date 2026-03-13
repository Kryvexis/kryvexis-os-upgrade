import { Link } from 'react-router-dom';

const items = [
  { title: 'Products', subtitle: 'SKU records, pricing anchors, and item detail.', to: '/products' },
  { title: 'Stock', subtitle: 'On-hand levels, thresholds, and coverage.', to: '/products' },
  { title: 'Movements', subtitle: 'Recent movement summaries and internal flow.', to: '/products' },
  { title: 'Transfers', subtitle: 'Inter-branch stock handoff visibility.', to: '/products' },
  { title: 'Low stock', subtitle: 'Threshold breaches and reorder pressure.', to: '/products' }
];

export function InventoryWorkspacePage() {
  return (
    <div className="module-page">
      <section className="module-shell">
        <div className="module-shell-head">
          <div>
            <span className="eyebrow">Inventory workspace</span>
            <h2>Inventory</h2>
            <p>The inventory module opens as a workspace first, then drills into product-level records.</p>
          </div>
          <div className="module-shell-stat">
            <strong>5</strong>
            <span>Control blocks</span>
          </div>
        </div>

        <div className="module-chip-row">
          <span className="module-chip">1 low stock</span>
          <span className="module-chip">2 healthy SKUs</span>
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
