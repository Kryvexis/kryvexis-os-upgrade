import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';
import { StatCard } from '../components/StatCard';
import { ThemeShowcaseCard } from '../components/ThemeShowcaseCard';

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
      <PageHeader
        title="Dashboard"
        description="A calm business overview across revenue, stock, purchasing, operational workload, and role-specific mobile access."
        actions={<button className="soft-button primary">Open command palette</button>}
      />

      <section className="stats-grid">
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

        <ThemeShowcaseCard />
      </section>
    </div>
  );
}
