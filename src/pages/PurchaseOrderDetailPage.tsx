import { NavLink } from 'react-router-dom';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { DetailHero } from '../components/DetailHero';
import { InfoGrid } from '../components/InfoGrid';
import { TableShell } from '../components/TableShell';

export function PurchaseOrderDetailPage() {
  return (
    <div className="page-stack">
      <DetailHero
        eyebrow="Purchase order"
        title="PO-2034 · Nexa Supply"
        description="Supplier purchasing record with receiving progress, bill matching, and approval history."
        actions={<><button className="soft-button">Add supplier bill</button><button className="soft-button primary">Receive goods</button></>}
        metrics={[
          { label: 'PO total', value: 'R 18,900', detail: 'Awaiting supplier release' },
          { label: 'Received', value: '0%', detail: 'No goods received yet' },
          { label: 'Bill match', value: 'Pending', detail: 'Supplier bill not matched' },
          { label: 'Approval', value: 'Waiting', detail: 'Finance + procurement' }
        ]}
      />
      <div className="content-split detail-layout">
        <div className="page-stack">
          <InfoGrid
            title="Procurement overview"
            items={[
              { label: 'Supplier', value: 'Nexa Supply' },
              { label: 'Buyer', value: 'Maya Jacobs' },
              { label: 'Branch', value: 'Main Branch' },
              { label: 'Requested date', value: '8 Mar 2026' },
              { label: 'Expected date', value: '11 Mar 2026' },
              { label: 'Payment terms', value: 'COD' }
            ]}
          />
          <TableShell
            title="Line items"
            description="Ordered vs received view ready for GRN and bill matching logic."
            columns={[
              { key: 'item', label: 'Item' },
              { key: 'ordered', label: 'Ordered' },
              { key: 'received', label: 'Received' },
              { key: 'status', label: 'Status' }
            ]}
            rows={[
              { id: '1', item: 'KX-200 Access Point', ordered: '12', received: '0', status: 'Awaiting supplier' },
              { id: '2', item: 'KX-500 Switch', ordered: '6', received: '0', status: 'Awaiting supplier' }
            ]}
            actions={<NavLink className="soft-button" to="/purchase-orders">Back to purchase orders</NavLink>}
          />
        </div>
        <ActivityTimeline
          items={[
            { id: '1', actor: 'Procurement', action: 'submitted', target: 'PO-2034 for approval', time: 'Today · 08:48' },
            { id: '2', actor: 'Finance', action: 'requested cost confirmation on', target: 'KX-200 line item', time: 'Today · 09:02' },
            { id: '3', actor: 'System', action: 'flagged missing supplier bill for', target: 'PO-2034', time: 'Today · 09:30' }
          ]}
        />
      </div>
    </div>
  );
}
