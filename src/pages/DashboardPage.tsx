import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';
import { StatCard } from '../components/StatCard';
import { SectionTabs } from '../components/SectionTabs';

const priorities = [
  '5 approvals waiting in Operations',
  '8 invoices overdue in Accounting',
  '12 items under reorder threshold',
  '3 supplier bills need matching'
];

const activity = [
  'Invoice INV-1042 marked paid by Finance',
  'Purchase Order PO-2031 partially received',
  'Stock transfer approved for Cape Town branch',
  'Customer Aether Group quote sent for approval'
];

export function DashboardPage() {
  return (
    <div className="page-stack">
      <SectionTabs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Customers', href: '/customers' },
          { label: 'Products', href: '/products' },
          { label: 'Approvals', href: '/approvals' },
          { label: 'Settings', href: '/settings' }
        ]}
      />

      <PageHeader
        title="Dashboard"
        description="A calm executive overview with room for notifications, approvals, financial control, and role-based daily focus."
        actions={<button className="soft-button primary">Open command center</button>}
      />

      <section className="stats-grid compact">
        <StatCard label="Revenue" value="R 482,300" detail="Month-to-date sales performance" />
        <StatCard label="Outstanding" value="R 91,240" detail="Debtors needing follow-up" />
        <StatCard label="Stock Risk" value="12 SKUs" detail="Low stock and transfer pressure" />
        <StatCard label="Approvals" value="5 pending" detail="Discounts, PO, and return requests" />
      </section>

      <section className="dashboard-grid">
        <PanelCard title="Priority queue">
          <ul className="clean-list">
            {priorities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </PanelCard>

        <PanelCard title="Recent activity">
          <ul className="clean-list">
            {activity.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </PanelCard>

        <PanelCard title="Next structure pass focus">
          <ul className="clean-list">
            <li>Real customer and product detail pages</li>
            <li>Purchase order receiving and matching flow</li>
            <li>Role-aware widget visibility</li>
            <li>Notifications center and activity timeline</li>
          </ul>
        </PanelCard>
      </section>
    </div>
  );
}
