import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { DataGrid, renderStatus } from '../components/DataGrid';
import { api } from '../lib/api';
import type { CreatePaymentPayload, Customer, Invoice, Payment } from '../types';

export function PaymentsPage() {
  const [items, setItems] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [form, setForm] = useState<CreatePaymentPayload>({ customerId: '', amount: '', method: 'EFT', proofAttached: true, autoAllocate: true });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const [paymentRows, customerRows, invoiceRows] = await Promise.all([api.payments(), api.customers(), api.invoices()]);
    setItems(paymentRows);
    setCustomers(customerRows);
    setInvoices(invoiceRows.filter((item) => item.status !== 'Paid'));
    setForm((current) => ({ ...current, customerId: current.customerId || customerRows[0]?.id || '' }));
  }

  useEffect(() => { load().catch(() => undefined); }, []);

  const queue = useMemo(() => ({
    pendingProof: items.filter((item) => item.status === 'Pending proof').length,
    unallocated: items.filter((item) => item.status === 'Unallocated').length,
    allocated: items.filter((item) => item.status === 'Allocated').length,
    value: items.reduce((sum, item) => sum + Number(String(item.amount).replace(/[^\d.-]/g, '')), 0)
  }), [items]);

  async function submitPayment() {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await api.createPayment(form);
      setMessage(`Payment ${result.payment.ref} captured.`);
      setForm({ customerId: customers[0]?.id || '', amount: '', method: 'EFT', proofAttached: true, autoAllocate: true, invoiceId: '' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to record payment');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-grid">
      <div className="kpi-grid compact-kpi-grid">
        <Card className="metric-card"><p className="eyebrow">Proof pending</p><strong>{queue.pendingProof}</strong><p>Audit-safe receipt capture still blocked</p></Card>
        <Card className="metric-card"><p className="eyebrow">Unallocated</p><strong>{queue.unallocated}</strong><p>Cash received, debtor clarity still delayed</p></Card>
        <Card className="metric-card"><p className="eyebrow">Allocated</p><strong>{queue.allocated}</strong><p>Payments fully matched</p></Card>
        <Card className="metric-card"><p className="eyebrow">Receipt flow</p><strong>R{queue.value.toLocaleString()}</strong><p>Total visible payment volume</p></Card>
      </div>

      <div className="split-grid reports-split">
        <Card title="Record payment" subtitle="Capture the receipt once and let the system carry the next action.">
          <div className="setting-list">
            <label className="stack-field"><span>Customer</span><select value={form.customerId} onChange={(e) => setForm((current) => ({ ...current, customerId: e.target.value }))}>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></label>
            <label className="stack-field"><span>Invoice target</span><select value={form.invoiceId || ''} onChange={(e) => setForm((current) => ({ ...current, invoiceId: e.target.value || undefined }))}><option value="">Allocate later</option>{invoices.filter((invoice) => !form.customerId || invoice.customerId === form.customerId).map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.id} • {invoice.customer}</option>)}</select></label>
            <div className="split-grid">
              <label className="stack-field"><span>Amount</span><input value={form.amount} onChange={(e) => setForm((current) => ({ ...current, amount: e.target.value }))} placeholder="R7,500" /></label>
              <label className="stack-field"><span>Method</span><select value={form.method} onChange={(e) => setForm((current) => ({ ...current, method: e.target.value }))}><option value="EFT">EFT</option><option value="Cash">Cash</option><option value="Card">Card</option></select></label>
            </div>
            <label className="stack-field"><span>Proof attached</span><select value={String(form.proofAttached)} onChange={(e) => setForm((current) => ({ ...current, proofAttached: e.target.value === 'true' }))}><option value="true">Yes</option><option value="false">No</option></select></label>
            <label className="stack-field"><span>Auto allocate</span><select value={String(form.autoAllocate)} onChange={(e) => setForm((current) => ({ ...current, autoAllocate: e.target.value === 'true' }))}><option value="true">Yes</option><option value="false">No</option></select></label>
          </div>
          <div className="toolbar-actions"><button className="solid-button" type="button" onClick={submitPayment} disabled={busy}>{busy ? 'Capturing…' : 'Record payment'}</button></div>
          {message ? <div className="banner-note">{message}</div> : null}
          {error ? <div className="banner-note error">{error}</div> : null}
        </Card>

        <Card title="Finance queue guidance" subtitle="The payment layer should remove noise from the debtor book, not add more of it.">
          <div className="notification-stack">
            <article className="mini-list-row"><div><strong>Pending proof</strong><p>Audit problem first. Allocation can wait until the receipt is safe.</p></div><div className="align-right"><strong>{queue.pendingProof}</strong><p>blocked</p></div></article>
            <article className="mini-list-row"><div><strong>Unallocated</strong><p>Cash is in, but customer balance is still unclear.</p></div><div className="align-right"><strong>{queue.unallocated}</strong><p>urgent</p></div></article>
            <article className="mini-list-row"><div><strong>Allocated</strong><p>What good looks like: one clean receipting trail.</p></div><div className="align-right"><strong>{queue.allocated}</strong><p>done</p></div></article>
          </div>
        </Card>
      </div>

      <Card title="Payments" subtitle="Receipts, proofs, allocation state, and payment handling foundations.">
        <DataGrid items={items} getHref={(item) => `/payments/${item.id}`} columns={[
          { key: 'ref', header: 'Payment', render: (item) => item.ref },
          { key: 'party', header: 'Party', render: (item) => item.party },
          { key: 'amount', header: 'Amount', render: (item) => item.amount },
          { key: 'status', header: 'Status', render: (item) => renderStatus(item.status) },
          { key: 'nextAction', header: 'Next action', render: (item) => item.nextAction }
        ]} />
      </Card>
    </div>
  );
}
