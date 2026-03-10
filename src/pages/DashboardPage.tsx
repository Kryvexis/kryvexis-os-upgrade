import { ActivityTimeline } from '../components/ActivityTimeline';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';
import { SectionTabs } from '../components/SectionTabs';
import { StatCard } from '../components/StatCard';
import { usePreferences } from '../preferences/PreferencesProvider';

const priorities = [
  '5 approvals waiting in Operations',
  '8 invoices overdue in Accounting',
  '12 items under reorder threshold',
  '3 supplier bills need matching'
];

const activity = [
  { id: '1', actor: 'Finance', action: 'marked paid', target: 'INV-1042', time: '11 min ago' },
  { id: '2', actor: 'Warehouse', action: 'partially received', target: 'PO-2031', time: '24 min ago' },
  { id: '3', actor: 'Operations', action: 'approved transfer', target: 'Cape Town branch replenishment', time: '52 min ago' },
  { id: '4', actor: 'Sales', action: 'submitted approval for', target: 'Aether Group quote', time: '1 hr ago' }
];

const roleContent = {
  admin: {
    cards: [
      ['Revenue', 'R 482,300', 'Month-to-date sales performance'],
      ['Outstanding', 'R 91,240', 'Debtors needing follow-up'],
      ['Stock Risk', '12 SKUs', 'Low stock and transfer pressure'],
      ['Approvals', '5 pending', 'Discounts, PO, and return requests']
    ],
    focus: 'Cross-functional control across sales, finance, stock, and approvals.'
  },
  sales: {
    cards: [
      ['Quotes', '18 open', 'Pipeline still in motion'],
      ['Invoices', '8 open', 'Awaiting customer payment'],
      ['Customers', '248', 'Active accounts in portfolio'],
      ['Approvals', '2 waiting', 'Discount and credit requests']
    ],
    focus: 'Customer-facing pipeline and collections follow-up.'
  },
  warehouse: {
    cards: [
      ['Low stock', '12 SKUs', 'Urgent replenishment pressure'],
      ['Transfers', '4 open', 'Pending branch movement'],
      ['Receiving', '3 today', 'GRNs to capture'],
      ['Returns', '2 open', 'Operational return tasks']
    ],
    focus: 'Stock movement, receiving, and branch execution.'
  },
  finance: {
    cards: [
      ['Debtors', 'R 91,240', 'Open balances'],
      ['Creditors', 'R 43,800', 'Supplier bills pending'],
      ['Statements', '32 due', 'Month-end statement run'],
      ['Approvals', '3 waiting', 'Cash and PO checks']
    ],
    focus: 'Financial control, payments, and debtor follow-up.'
  },
  procurement: {
    cards: [
      ['Open POs', '14', 'Awaiting supplier response'],
      ['Supplier bills', '6', 'Need bill matching'],
      ['Reorders', '12', 'Triggered by stock rules'],
      ['Approvals', '2 waiting', 'Buying limits and pricing']
    ],
    focus: 'Supplier purchasing, PO tracking, and bill matching.'
  },
  operations: {
    cards: [
      ['Tasks', '18', 'Execution items in flight'],
      ['Deliveries', '6', 'Due today'],
      ['Returns', '2', 'Awaiting resolution'],
      ['Approvals', '5', 'Need action today']
    ],
    focus: 'Daily execution and service delivery control.'
  }
} as const;

export function DashboardPage() {
  const { activeRole } = usePreferences();
  const roleView = roleContent[activeRole];

  return (
    <div className="page-stack">
      <SectionTabs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Notifications', href: '/notifications' },
          { label: 'Customers', href: '/customers' },
          { label: 'Products', href: '/products' },
          { label: 'Settings', href: '/settings' }
        ]}
      />

      <PageHeader
        title="Dashboard"
        description={`A calm executive overview for ${roleView.focus}`}
        actions={<button className="soft-button primary">Open command center</button>}
      />

      <section className="stats-grid compact">
        {roleView.cards.map(([label, value, detail]) => (
          <StatCard key={label} label={label} value={value} detail={detail} />
        ))}
      </section>

      <section className="dashboard-grid">
        <PanelCard title="Priority queue">
          <ul className="clean-list">
            {priorities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </PanelCard>

        <ActivityTimeline title="Recent activity" items={activity} />

        <PanelCard title="Detail pages shipped in this pass">
          <ul className="clean-list">
            <li>Customer profile detail route</li>
            <li>Product detail route with movement history</li>
            <li>Purchase order detail route with receiving lens</li>
            <li>Notifications center and role-aware dashboard cards</li>
          </ul>
        </PanelCard>
      </section>
    </div>
  );
}
