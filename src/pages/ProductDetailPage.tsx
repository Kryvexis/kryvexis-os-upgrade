import { NavLink } from 'react-router-dom';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { DetailHero } from '../components/DetailHero';
import { InfoGrid } from '../components/InfoGrid';
import { TableShell } from '../components/TableShell';

export function ProductDetailPage() {
  return (
    <div className="page-stack">
      <DetailHero
        eyebrow="Product detail"
        title="KX-200 Access Point"
        description="Stock control, supplier linkage, and movement history for a single product."
        actions={<><button className="soft-button">Adjust stock</button><button className="soft-button primary">Transfer stock</button></>}
        metrics={[
          { label: 'On hand', value: '19', detail: 'Across active branches' },
          { label: 'Reserved', value: '6', detail: 'Sales orders allocated' },
          { label: 'Incoming', value: '24', detail: 'PO-2034 expected' },
          { label: 'Reorder point', value: '25', detail: 'Below threshold' }
        ]}
      />
      <div className="content-split detail-layout">
        <div className="page-stack">
          <InfoGrid
            title="Product control"
            items={[
              { label: 'SKU', value: 'KX-200' },
              { label: 'Barcode', value: '6009801234009' },
              { label: 'Default supplier', value: 'Nexa Supply' },
              { label: 'Sell price', value: 'R 1,499' },
              { label: 'Cost price', value: 'R 980' },
              { label: 'Low stock flag', value: 'Enabled' }
            ]}
          />
          <TableShell
            title="Stock movements"
            description="Recent stock events connected to the product detail page."
            columns={[
              { key: 'reference', label: 'Reference' },
              { key: 'type', label: 'Type' },
              { key: 'qty', label: 'Qty' },
              { key: 'location', label: 'Location' }
            ]}
            rows={[
              { id: '1', reference: 'TR-881', type: 'Transfer out', qty: '-6', location: 'Main → Cape Town' },
              { id: '2', reference: 'GRN-412', type: 'Goods received', qty: '+12', location: 'Main Branch' },
              { id: '3', reference: 'SO-1229', type: 'Sales allocation', qty: '-4', location: 'Main Branch' }
            ]}
            actions={<NavLink className="soft-button" to="/products">Back to products</NavLink>}
          />
        </div>
        <ActivityTimeline
          items={[
            { id: '1', actor: 'Warehouse', action: 'updated bin location for', target: 'KX-200', time: 'Today · 10:15' },
            { id: '2', actor: 'Procurement', action: 'reissued supplier quote for', target: 'Nexa Supply', time: 'Yesterday · 14:34' },
            { id: '3', actor: 'Sales', action: 'reserved stock for', target: 'QT-1008', time: 'Yesterday · 09:12' }
          ]}
        />
      </div>
    </div>
  );
}
