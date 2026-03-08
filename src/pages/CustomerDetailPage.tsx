import { NavLink } from 'react-router-dom';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { DetailHero } from '../components/DetailHero';
import { InfoGrid } from '../components/InfoGrid';
import { PanelCard } from '../components/PanelCard';
import { TableShell } from '../components/TableShell';

export function CustomerDetailPage() {
  return (
    <div className="page-stack">
      <DetailHero
        eyebrow="Customer profile"
        title="Aether Group"
        description="Commercial summary for sales, collections, and service follow-up in one record."
        actions={<><button className="soft-button">Issue statement</button><button className="soft-button primary">Create quote</button></>}
        metrics={[
          { label: 'Open balance', value: 'R 24,500', detail: '2 invoices outstanding' },
          { label: 'Last order', value: '5 Mar 2026', detail: 'Access points restock' },
          { label: 'Days to pay', value: '18 days', detail: 'Within target range' },
          { label: 'Risk', value: 'Low', detail: 'No active credit holds' }
        ]}
      />
      <div className="content-split detail-layout">
        <div className="page-stack">
          <InfoGrid
            title="Customer overview"
            items={[
              { label: 'Primary contact', value: 'Nadia Hart' },
              { label: 'Phone', value: '+27 11 555 0192' },
              { label: 'Billing terms', value: '30 days' },
              { label: 'Credit limit', value: 'R 80,000' },
              { label: 'Branch', value: 'Main Branch' },
              { label: 'Account owner', value: 'Antonie Meyer' }
            ]}
          />
          <TableShell
            title="Recent commercial activity"
            description="Quotes, invoices, and collections tied to this customer."
            columns={[
              { key: 'document', label: 'Document' },
              { key: 'type', label: 'Type' },
              { key: 'amount', label: 'Amount' },
              { key: 'status', label: 'Status' }
            ]}
            rows={[
              { id: '1', document: 'QT-1008', type: 'Quote', amount: 'R 18,200', status: 'Awaiting approval' },
              { id: '2', document: 'INV-1042', type: 'Invoice', amount: 'R 12,480', status: 'Paid' },
              { id: '3', document: 'INV-1049', type: 'Invoice', amount: 'R 12,020', status: 'Open' }
            ]}
            actions={<NavLink className="soft-button" to="/customers">Back to customers</NavLink>}
          />
        </div>
        <ActivityTimeline
          items={[
            { id: '1', actor: 'Sales', action: 'sent quote to', target: 'Aether Group', time: 'Today · 09:42' },
            { id: '2', actor: 'Finance', action: 'followed up on', target: 'INV-1049', time: 'Yesterday · 16:18' },
            { id: '3', actor: 'Operations', action: 'scheduled delivery for', target: 'March replenishment', time: 'Yesterday · 11:02' }
          ]}
        />
      </div>
    </div>
  );
}
