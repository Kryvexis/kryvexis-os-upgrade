import { ActivityTimeline } from '../components/ActivityTimeline';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';
import { StatCard } from '../components/StatCard';

const alerts = [
  'PO-2034 is still waiting for approval before supplier release.',
  '12 SKUs are below reorder threshold across Main and Cape Town.',
  'INV-1049 is overdue and needs finance follow-up.',
  'Supplier bill SB-412 has a quantity mismatch against GRN.'
];

const activity = [
  { id: '1', actor: 'Finance', action: 'cleared payment for', target: 'INV-1042', time: '8 min ago' },
  { id: '2', actor: 'Warehouse', action: 'received goods for', target: 'PO-2031', time: '24 min ago' },
  { id: '3', actor: 'Operations', action: 'approved return request', target: 'CN-221', time: '45 min ago' },
  { id: '4', actor: 'Sales', action: 'submitted discount approval for', target: 'QT-1010', time: '1 hr ago' }
];

export function NotificationsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Notifications"
        description="A real app control center for approvals, operational alerts, and workspace activity."
        actions={<button className="soft-button primary">Mark all reviewed</button>}
      />
      <section className="stats-grid compact">
        <StatCard label="Unread" value="12" detail="High-signal items needing attention" />
        <StatCard label="Approvals" value="5" detail="Waiting for decision" />
        <StatCard label="Stock alerts" value="12 SKUs" detail="Below reorder threshold" />
        <StatCard label="Finance alerts" value="8" detail="Open debtors and mismatches" />
      </section>
      <div className="content-split">
        <PanelCard title="Priority alerts">
          <ul className="clean-list">
            {alerts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </PanelCard>
        <ActivityTimeline items={activity} />
      </div>
    </div>
  );
}
