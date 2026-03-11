import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ActivityFeed } from '../components/ActivityFeed';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { RecordTimeline } from '../components/RecordTimeline';
import { api } from '../lib/api';
import type { QuoteDetail, QuoteStatus } from '../types';

const statusActions: Partial<Record<QuoteStatus, { label: string; next: QuoteStatus }>> = {
  Draft: { label: 'Submit for approval', next: 'Pending approval' },
  Approved: { label: 'Mark as sent', next: 'Sent to customer' }
};

export function QuoteDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<QuoteDetail | null>(null);
  const [busyAction, setBusyAction] = useState('');
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');

  useEffect(() => {
    api.quote(id).then(setItem).catch((err: Error) => setError(err.message));
  }, [id]);

  const runAction = async (actionKey: string, runner: () => Promise<void>) => {
    setBusyAction(actionKey);
    setError('');
    setFlash('');
    try {
      await runner();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete quote action.');
    } finally {
      setBusyAction('');
    }
  };

  const handleStatusAdvance = async () => {
    if (!item) return;
    const action = statusActions[item.status as QuoteStatus];
    if (!action) return;

    await runAction('status', async () => {
      const result = await api.updateQuoteStatus(item.id, action.next);
      setItem(result.quote);
      setFlash(`Quote moved to ${action.next}.`);
    });
  };

  const handleApprove = async () => {
    if (!item || item.status !== 'Pending approval') return;

    await runAction('approve', async () => {
      const result = await api.approveQuote(item.id);
      setItem(result.quote);
      setFlash(`Quote ${item.id} approved.`);
    });
  };

  const handleConvert = async () => {
    if (!item) return;

    await runAction('convert', async () => {
      const result = await api.convertQuote(item.id);
      setItem(result.quote);
      navigate(`/invoices/${result.invoice.id}`, {
        state: { flash: result.reused ? `Invoice ${result.invoice.id} already existed for this quote.` : `Invoice ${result.invoice.id} created from ${item.id}.` }
      });
    });
  };

  if (error && !item) return <div className="loading-state">{error}</div>;
  if (!item) return <div className="loading-state">Loading record...</div>;

  const action = statusActions[item.status as QuoteStatus];
  const canApprove = item.status === 'Pending approval';
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

      <Card title="Record actions" subtitle="Run quote workflow directly from the record page.">
        <div className="action-row wrap-actions">
          {action ? (
            <button className="solid-button" onClick={handleStatusAdvance} disabled={Boolean(busyAction)}>
              {busyAction === 'status' ? 'Working...' : action.label}
            </button>
          ) : (
            <div className="inline-note">No further status step is available for this quote.</div>
          )}
          {canApprove ? (
            <button className="ghost-button" onClick={handleApprove} disabled={Boolean(busyAction)}>
              {busyAction === 'approve' ? 'Approving...' : 'Approve quote'}
            </button>
          ) : null}
          {canConvert ? (
            <button className="ghost-button" onClick={handleConvert} disabled={Boolean(busyAction) || item.status === 'Converted'}>
              {busyAction === 'convert' ? 'Converting...' : item.status === 'Converted' ? 'Already converted' : 'Convert to invoice'}
            </button>
          ) : (
            <div className="inline-note">Approve or send this quote before conversion.</div>
          )}
          <Link className="ghost-button" to={`/emails/quote-send/${item.id}`}>
            Generate email
          </Link>
          <Link className="ghost-button" to={`/quotes/${item.id}/print`} target="_blank" rel="noreferrer">
            Print quote
          </Link>
        </div>
        <div className="record-link-strip">
          <Link className="record-chip" to={`/customers/${item.sourceCustomerId}`}>Customer account</Link>
          <span className="record-chip muted-chip">Approval owner: {item.approvalOwner}</span>
          <span className="record-chip muted-chip">Margin: {item.marginBand}</span>
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

      <Card title="Audit trail" subtitle="Enterprise-style traceability for quote actions and linked customer activity.">
        <ActivityFeed items={item.activityLog} />
      </Card>

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
    </div>
  );
}
