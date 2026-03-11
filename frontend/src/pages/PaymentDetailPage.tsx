import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ActivityFeed } from '../components/ActivityFeed';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { Payment } from '../types';

export function PaymentDetailPage() {
  const { id = '' } = useParams();
  const [item, setItem] = useState<Payment | null>(null);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');
  const [busyAction, setBusyAction] = useState('');

  useEffect(() => {
    api.payment(id).then(setItem).catch((err: Error) => setError(err.message));
  }, [id]);

  const handleResolveProof = async () => {
    if (!item) return;
    setBusyAction('resolve');
    setError('');
    setFlash('');
    try {
      const result = await api.resolvePaymentProof(item.id);
      setItem(result.payment);
      setFlash(`Proof resolved for ${item.ref}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resolve payment proof.');
    } finally {
      setBusyAction('');
    }
  };

  const handleAllocate = async () => {
    if (!item) return;
    setBusyAction('allocate');
    setError('');
    setFlash('');
    try {
      const result = await api.allocatePayment(item.id, item.appliedTo !== 'To be assigned' ? item.appliedTo : undefined);
      setItem(result.payment);
      setFlash(`Payment ${item.ref} allocated to ${result.payment.appliedTo}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to allocate payment.');
    } finally {
      setBusyAction('');
    }
  };

  if (error && !item) return <div className="loading-state">{error}</div>;
  if (!item) return <div className="loading-state">Loading record...</div>;

  const canResolveProof = item.proof !== 'Attached and verified';
  const canAllocate = item.status !== 'Allocated';
  const linkedInvoice = item.linkedInvoiceId || (item.appliedTo.startsWith('INV-') ? item.appliedTo : null);

  return (
    <div className="record-layout">
      <Card className="record-hero">
        <div className="record-head">
          <div>
            <p className="eyebrow">Payment event</p>
            <h2>{item.ref}</h2>
          </div>
          <Badge value={item.status} />
        </div>
        <div className="record-meta">
          <div><span>Party</span><strong><Link to={`/customers/${item.customerId}`}>{item.party}</Link></strong></div>
          <div><span>Amount</span><strong>{item.amount}</strong></div>
          <div><span>Method</span><strong>{item.method}</strong></div>
          <div><span>Date</span><strong>{item.date}</strong></div>
          <div><span>Applied to</span><strong>{linkedInvoice ? <Link to={`/invoices/${linkedInvoice}`}>{linkedInvoice}</Link> : item.appliedTo}</strong></div>
        </div>
      </Card>

      <Card title="Record actions" subtitle="Resolve proof and allocation directly from this payment record.">
        <div className="action-row wrap-actions">
          {canResolveProof ? (
            <button className="solid-button" onClick={handleResolveProof} disabled={Boolean(busyAction)}>
              {busyAction === 'resolve' ? 'Resolving...' : 'Resolve proof'}
            </button>
          ) : (
            <div className="inline-note">Proof is already verified.</div>
          )}
          {canAllocate ? (
            <button className="ghost-button" onClick={handleAllocate} disabled={Boolean(busyAction)}>
              {busyAction === 'allocate' ? 'Allocating...' : 'Allocate payment'}
            </button>
          ) : (
            <div className="inline-note">Payment is already allocated.</div>
          )}
          <Link className="ghost-button" to={`/emails/payment-proof/${item.id}`}>
            Generate email
          </Link>
          <Link className="ghost-button" to={`/customers/${item.customerId}`}>
            Open customer
          </Link>
          {linkedInvoice ? (
            <Link className="ghost-button" to={`/invoices/${linkedInvoice}`}>
              Open invoice
            </Link>
          ) : null}
        </div>
        <div className="record-link-strip">
          <span className="record-chip muted-chip">Proof: {item.proof}</span>
          <span className="record-chip muted-chip">Next action: {item.nextAction}</span>
        </div>
        {flash ? <p className="success-note">{flash}</p> : null}
        {error ? <p className="error-note">{error}</p> : null}
      </Card>

      <div className="split-grid">
        <Card title="Record context" subtitle="Status, proof, and next action visibility.">
          <div className="detail-stack">
            <div><span>Proof</span><strong>{item.proof}</strong></div>
            <div><span>Next action</span><strong>{item.nextAction}</strong></div>
            <div><span>Allocation target</span><strong>{item.appliedTo}</strong></div>
          </div>
        </Card>
        <Card title="Audit trail" subtitle="Operational context for finance follow-through.">
          <ActivityFeed items={item.activityLog || []} />
        </Card>
      </div>
    </div>
  );
}
