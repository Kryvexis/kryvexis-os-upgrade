import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { RecordTimeline } from '../components/RecordTimeline';
import { api } from '../lib/api';
import type { QuoteDetail } from '../types';

export function QuoteDetailPage() {
  const { id = '' } = useParams();
  const [item, setItem] = useState<QuoteDetail | null>(null);

  useEffect(() => {
    api.quote(id).then(setItem);
  }, [id]);

  if (!item) return <div className="loading-state">Loading record...</div>;

  return (
    <div className="record-layout">
      <Card className="record-hero">
        <div className="record-head">
          <div>
            <p className="eyebrow">Quote workflow</p>
            <h2>{item.id}</h2>
          </div>
          <Badge value={item.status} />
        </div>
        <div className="record-meta">
          <div><span>Customer</span><strong><Link to={`/customers/${item.sourceCustomerId}`}>{item.customer}</Link></strong></div>
          <div><span>Owner</span><strong>{item.owner}</strong></div>
          <div><span>Branch</span><strong>{item.branch}</strong></div>
          <div><span>Total</span><strong>{item.total}</strong></div>
          <div><span>Validity</span><strong>{item.validity}</strong></div>
        </div>
      </Card>

      <div className="kpi-grid compact-kpi-grid">
        <Card className="metric-card"><p className="eyebrow">Subtotal</p><strong>{item.subtotal}</strong><p>Line items before tax</p></Card>
        <Card className="metric-card"><p className="eyebrow">Tax</p><strong>{item.tax}</strong><p>Standard VAT treatment</p></Card>
        <Card className="metric-card"><p className="eyebrow">Margin band</p><strong>{item.marginBand}</strong><p>{item.trigger}</p></Card>
        <Card className="metric-card"><p className="eyebrow">Approval owner</p><strong>{item.approvalOwner}</strong><p>{item.nextAction}</p></Card>
      </div>

      <div className="split-grid">
        <Card title="Record context" subtitle="Status, owner, next action, and approval visibility.">
          <div className="detail-stack">
            <div><span>Approval trigger</span><strong>{item.trigger}</strong></div>
            <div><span>Updated</span><strong>{item.updated}</strong></div>
            <div><span>Next action</span><strong>{item.nextAction}</strong></div>
            <div><span>Notes</span><strong>{item.notes}</strong></div>
          </div>
        </Card>

        <Card title="Workflow history" subtitle="Draft, review, approval, and conversion steps.">
          <RecordTimeline items={item.workflow.map((event) => `${event.label}: ${event.detail}`)} />
        </Card>
      </div>

      <Card title="Quote line items" subtitle="The foundation for conversion, print templates, and later PDF output.">
        <div className="history-table-wrap">
          <table className="data-grid history-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {item.lines.map((line) => (
                <tr key={line.id}>
                  <td>{line.sku}</td>
                  <td>{line.description}</td>
                  <td>{line.qty}</td>
                  <td>{line.unitPrice}</td>
                  <td>{line.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="split-grid">
        <Card title="Commercial totals" subtitle="Ready for quote to invoice conversion in the next phase.">
          <div className="detail-stack">
            <div><span>Subtotal</span><strong>{item.subtotal}</strong></div>
            <div><span>Tax</span><strong>{item.tax}</strong></div>
            <div><span>Grand total</span><strong>{item.total}</strong></div>
            <div><span>Conversion target</span><strong>Invoice draft after approval</strong></div>
          </div>
        </Card>

        <Card title="Next build hook" subtitle="This quote structure is now ready for the next package.">
          <div className="detail-stack">
            <div><span>Next step</span><strong>Convert approved quote to invoice</strong></div>
            <div><span>After that</span><strong>Print-ready quote and invoice views</strong></div>
            <div><span>Then</span><strong>Auto-save PDF + reminders</strong></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
