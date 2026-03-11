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
  const [flash, setFlash] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.invoice(id).then(setItem).catch((err: Error) => setError(err.message));
  }, [id]);

  useEffect(() => {
    const stateFlash = location.state && typeof location.state === 'object' && 'flash' in location.state
      ? String(location.state.flash)
      : '';
    if (stateFlash) setFlash(stateFlash);
  }, [location.state]);

  const handleReminder = async () => {
    if (!item) return;
    setBusy(true);
    setError('');
    setFlash('');
    try {
      const result = await api.sendInvoiceReminder(item.id);
      setItem(result.invoice);
      setFlash(`Reminder sent for ${item.id}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reminder.');
    } finally {
      setBusy(false);
    }
  };

  if (error && !item) return <div className="loading-state">{error}</div>;
  if (!item) return <div className="loading-state">Loading record...</div>;

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

      <Card title="Record actions" subtitle="Run finance follow-up directly from the invoice page.">
        <div className="action-row wrap-actions">
          <button className="solid-button" onClick={handleReminder} disabled={busy}>
            {busy ? 'Sending...' : 'Send reminder'}
          </button>
          <Link className="ghost-button" to={`/invoices/${item.id}/print`} target="_blank" rel="noreferrer">
            Print invoice
          </Link>
          {item.sourceQuoteId ? (
            <Link className="ghost-button" to={`/quotes/${item.sourceQuoteId}`}>
              Open source quote
            </Link>
          ) : null}
          <Link className="ghost-button" to={`/customers/${item.sourceCustomerId}`}>
            Open customer
          </Link>
        </div>
        {flash ? <p className="success-note">{flash}</p> : null}
        {error ? <p className="error-note">{error}</p> : null}
      </Card>

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

      <Card title="Invoice line items" subtitle="Mirrors the quote lines so customer print output stays consistent.">
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
