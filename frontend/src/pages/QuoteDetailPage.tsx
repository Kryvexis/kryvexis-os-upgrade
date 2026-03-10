import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { RecordTimeline } from '../components/RecordTimeline';
import { api } from '../lib/api';
import type { QuoteDetail, QuoteStatus } from '../types';

const statusActions: Partial<Record<QuoteStatus, { label: string; next: QuoteStatus }>> = {
  Draft: { label: 'Submit for approval', next: 'Pending approval' },
  'Pending approval': { label: 'Approve quote', next: 'Approved' },
  Approved: { label: 'Mark as sent', next: 'Sent to customer' }
};

export function QuoteDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<QuoteDetail | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');

  useEffect(() => {
    api.quote(id).then(setItem).catch((err: Error) => setError(err.message));
  }, [id]);

  const handleStatusAdvance = async () => {
    if (!item) return;
    const action = statusActions[item.status as QuoteStatus];
    if (!action) return;

    setBusy(true);
    setError('');
    setFlash('');
    try {
      const result = await api.updateQuoteStatus(item.id, action.next);
      setItem(result.quote);
      setFlash(`Quote moved to ${action.next}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update quote status.');
    } finally {
      setBusy(false);
    }
  };

  const handleConvert = async () => {
    if (!item) return;

    setBusy(true);
    setError('');
    setFlash('');
    try {
      const result = await api.convertQuote(item.id);
      setItem(result.quote);
      navigate(`/invoices/${result.invoice.id}`, {
        state: { flash: result.reused ? `Invoice ${result.invoice.id} already existed for this quote.` : `Invoice ${result.invoice.id} created from ${item.id}.` }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to convert quote to invoice.');
    } finally {
      setBusy(false);
    }
  };

  if (error && !item) return <div className="loading-state">{error}</div>;
  if (!item) return <div className="loading-state">Loading record...</div>;

  const action = statusActions[item.status as QuoteStatus];
  const canConvert = item.status === 'Approved' || item.status === 'Sent to customer' || item.status === 'Converted';

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

      <Card title="Phase B actions" subtitle="Advance the quote or convert it into the first invoice draft.">
        <div className="action-row">
          {action ? (
            <button className="solid-button" onClick={handleStatusAdvance} disabled={busy}>
              {busy ? 'Working...' : action.label}
            </button>
          ) : (
            <div className="inline-note">No further status step is available for this quote.</div>
          )}
          {canConvert ? (
            <button className="ghost-button" onClick={handleConvert} disabled={busy || item.status === 'Converted'}>
              {item.status === 'Converted' ? 'Already converted' : 'Convert to invoice'}
            </button>
          ) : (
            <div className="inline-note">Approve or send this quote before conversion.</div>
          )}
        </div>
        {flash ? <p className="success-note">{flash}</p> : null}
        {error ? <p className="error-note">{error}</p> : null}
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
        <Card title="Commercial totals" subtitle="Now ready for quote to invoice conversion.">
          <div className="detail-stack">
            <div><span>Subtotal</span><strong>{item.subtotal}</strong></div>
            <div><span>Tax</span><strong>{item.tax}</strong></div>
            <div><span>Grand total</span><strong>{item.total}</strong></div>
            <div><span>Conversion target</span><strong>{item.status === 'Converted' ? 'Invoice already created' : 'Invoice draft after approval'}</strong></div>
          </div>
        </Card>

        <Card title="Phase B outcome" subtitle="This quote can now advance into the invoice module.">
          <div className="detail-stack">
            <div><span>Current state</span><strong>{item.status}</strong></div>
            <div><span>Ready for print phase</span><strong>Quote and invoice print pages next</strong></div>
            <div><span>After that</span><strong>Auto-save PDF + reminders</strong></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
