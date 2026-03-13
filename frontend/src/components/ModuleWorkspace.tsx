import { Link } from 'react-router-dom';

type WorkspaceIcon =
  | 'customers'
  | 'quotes'
  | 'invoices'
  | 'payments'
  | 'products'
  | 'stock'
  | 'movements'
  | 'transfers'
  | 'low-stock'
  | 'debtors'
  | 'creditors'
  | 'statements'
  | 'expenses'
  | 'cash-up'
  | 'suppliers'
  | 'purchase-orders'
  | 'reorders'
  | 'goods-received'
  | 'tasks'
  | 'approvals'
  | 'deliveries'
  | 'returns';

type WorkspaceItem = {
  title: string;
  to: string;
  icon: WorkspaceIcon;
  emphasis?: 'normal' | 'wide';
};

function TileIcon({ icon }: { icon: WorkspaceIcon }) {
  const className = `tile-symbol tile-symbol-${icon}`;
  return <span className={className} aria-hidden="true" />;
}

export function ModuleWorkspace({
  title,
  items,
  footerLabel,
  footerValue
}: {
  title: string;
  items: WorkspaceItem[];
  footerLabel?: string;
  footerValue?: string;
}) {
  return (
    <div className="mockup-workspace-page">
      <section className="mockup-workspace-panel">
        <div className={`mockup-workspace-grid mockup-workspace-grid-${items.length}`}>
          {items.map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className={`mockup-workspace-tile ${item.emphasis === 'wide' ? 'wide' : ''}`.trim()}
            >
              <div className="mockup-workspace-icon-wrap">
                <TileIcon icon={item.icon} />
              </div>
              <strong>{item.title}</strong>
            </Link>
          ))}
        </div>

        {footerLabel || footerValue ? (
          <div className="mockup-workspace-footer-bar">
            <div className="mockup-workspace-footer-icon tile-symbol tile-symbol-low-stock" aria-hidden="true" />
            <strong>{footerLabel}</strong>
            <span>{footerValue}</span>
          </div>
        ) : null}
      </section>
    </div>
  );
}
