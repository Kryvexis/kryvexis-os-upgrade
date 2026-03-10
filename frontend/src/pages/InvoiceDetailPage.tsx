import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { RecordTimeline } from '../components/RecordTimeline';
import { api } from '../lib/api';
import type { InvoiceDetail } from '../types';

export function InvoiceDetailPage() {
  const { id = '' } = useParams();
  const location = useLocation();
  const [item, setItem] = useState<InvoiceDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.invoice(id).then(setItem).catch((err: Error) => setError(err.message));
  }, [id]);

  if (error && !item) return <div className="loading-state">{error}</div>;
  if (!item) return <div className="loading-state">Loading record...</div>;

  const flash = location.state && typeof location.state === 'object' && 'flash' in location.state
    ? String(location.state.flash)
    : '';

  return (
    <div className="record-layout">
      <Card className="record-hero">
        <div className="record-head">
          <div>
            <p className="eyebrow">Invoice control</p>
            <h2>{item.id}</h2>
          </div>
          <Badge value={item.status} />
        </div>
        <div className="record-meta">
          <div><span>Customer</span><strong><Link to={`/customers/${item.sourceCustomerId}`}>{item.customer}</Link></strong></div>
          <div><span>Amount</span><strong>{item.amount}</strong></div>
          <div><span>Branch</span><strong>{item.branch}</strong></div>
          <div><span>Due</span><strong>{item.due}</strong></div>
          <div><span>Source</span><strong>{item.sourceQuoteId ? <Link to={`/quotes/${item.sourceQuoteId}`}>{item.source}</Link> : item.source}</strong></div>
        </div>
      </Card>

      {flash ? (
        <Card>
          <p className="success-note invoice-flash">{flash}</p>
        </Card>
      ) : null}

      <div className="kpi-grid compact-kpi-grid">
        <Card className="metric-card"><p className="eyebrow">Subtotal</p><strong>{item.subtotal}</strong><p>Net amount before tax.</p></Card>
        <Card className="metric-card"><p className="eyebrow">Total</p><strong>{item.total}</strong><p>Invoice draft value.</p></Card>
        <Card className="metric-card"><p className="eyebrow">Payment state</p><strong>{item.paymentStatus}</strong><p>{item.reminders}</p></Card>
        <Card className="metric-card"><p className="eyebrow">Issued on</p><strong>{item.issuedOn}</strong><p>{item.nextAction}</p></Card>
      </div>

      <div className="split-grid">
        <Card title="Record context" subtitle="Source quote linkage and finance-ready visibility.">
          <div className="detail-stack">
            <div><span>Payment state</span><strong>{item.paymentStatus}</strong></div>
            <div><span>Tax</span><strong>{item.tax}</strong></div>
            <div><span>Reminders</span><strong>{item.reminders}</strong></div>
            <div><span>Next action</span><strong>{item.nextAction}</strong></div>
          </div>
        </Card>
        <Card title="Activity and collaboration" subtitle="Audit trail from source quote into invoice creation.">
          <RecordTimeline items={item.workflow.map((event) => `${event.label}: ${event.detail}`)} />
        </Card>
      </div>

      <Card title="Invoice line items" subtitle="Mirrors the quote lines so print-ready work in the next phase stays consistent.">
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
    </div>
  );
}
