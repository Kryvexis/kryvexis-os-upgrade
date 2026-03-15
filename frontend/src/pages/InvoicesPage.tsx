import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { DataGrid, renderStatus } from '../components/DataGrid';
import { api } from '../lib/api';
import type { CreateInvoicePayload, Customer, Invoice, Quote } from '../types';

export function InvoicesPage() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [form, setForm] = useState<CreateInvoicePayload>({ customerId: '', sourceQuoteId: '', dueDays: 30 });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const [invoiceRows, customerRows, quoteRows] = await Promise.all([api.invoices(), api.customers(), api.quotes()]);
    setItems(invoiceRows);
    setCustomers(customerRows);
    setQuotes(quoteRows.filter((item) => item.status === 'Approved' || item.status === 'Sent to customer'));
    setForm((current) => ({ ...current, customerId: current.customerId || customerRows[0]?.id || '' }));
  }

  useEffect(() => { load().catch(() => undefined); }, []);

  const stats = useMemo(() => ({
    open: items.filter((item) => item.status !== 'Paid').length,
    overdue: items.filter((item) => /overdue|collections/i.test(item.status)).length,
    awaiting: items.filter((item) => item.status === 'Awaiting allocation').length,
    value: items.reduce((sum, item) => sum + Number(String(item.amount).replace(/[^\d.-]/g, '')), 0)
  }), [items]);

  async function submitInvoice() {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await api.createInvoice(form);
      setMessage(`Invoice ${result.invoice.id} created.`);
      setForm({ customerId: customers[0]?.id || '', sourceQuoteId: '', dueDays: 30, amount: '' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create invoice');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-grid">
      <div className="kpi-grid compact-kpi-grid">
        <Card className="metric-card"><p className="eyebrow">Open invoices</p><strong>{stats.open}</strong><p>Still collecting or awaiting allocation</p></Card>
        <Card className="metric-card"><p className="eyebrow">Overdue</p><strong>{stats.overdue}</strong><p>Needs direct collections work</p></Card>
        <Card className="metric-card"><p className="eyebrow">Awaiting allocation</p><strong>{stats.awaiting}</strong><p>Receipts not fully matched</p></Card>
        <Card className="metric-card"><p className="eyebrow">Invoice book</p><strong>R{stats.value.toLocaleString()}</strong><p>Total visible invoice value</p></Card>
      </div>

      <div className="split-grid reports-split">
        <Card title="Create invoice" subtitle="Issue from a quote or create manually when you need to move faster.">
          <div className="setting-list">
            <label className="stack-field"><span>Customer</span><select value={form.customerId} onChange={(e) => setForm((current) => ({ ...current, customerId: e.target.value }))}>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></label>
            <label className="stack-field"><span>Source quote</span><select value={form.sourceQuoteId || ''} onChange={(e) => setForm((current) => ({ ...current, sourceQuoteId: e.target.value || undefined }))}><option value="">Manual invoice</option>{quotes.map((quote) => <option key={quote.id} value={quote.id}>{quote.id} • {quote.customer}</option>)}</select></label>
            {!form.sourceQuoteId ? <label className="stack-field"><span>Manual amount</span><input value={form.amount || ''} onChange={(e) => setForm((current) => ({ ...current, amount: e.target.value }))} placeholder="R12,500" /></label> : null}
            <label className="stack-field"><span>Due days</span><input type="number" min={1} value={form.dueDays || 30} onChange={(e) => setForm((current) => ({ ...current, dueDays: Number(e.target.value || 30) }))} /></label>
          </div>
          <div className="toolbar-actions"><button className="solid-button" type="button" onClick={submitInvoice} disabled={busy}>{busy ? 'Issuing…' : 'Create invoice'}</button></div>
          {message ? <div className="banner-note">{message}</div> : null}
          {error ? <div className="banner-note error">{error}</div> : null}
        </Card>

        <Card title="Collections posture" subtitle="Invoices should tell finance what to do next, not just exist as rows.">
          <div className="notification-stack">
            <article className="mini-list-row"><div><strong>Overdue invoices</strong><p>Move these into statement and call flow first.</p></div><div className="align-right"><strong>{stats.overdue}</strong><p>urgent</p></div></article>
            <article className="mini-list-row"><div><strong>Awaiting allocation</strong><p>Receipts exist but debtor clarity is still broken.</p></div><div className="align-right"><strong>{stats.awaiting}</strong><p>attention</p></div></article>
            <article className="mini-list-row"><div><strong>Open book</strong><p>The full receivables surface still needing action.</p></div><div className="align-right"><strong>{stats.open}</strong><p>open</p></div></article>
          </div>
        </Card>
      </div>

      <Card title="Invoices" subtitle="Tax treatment, reminder state, and collections visibility.">
        <DataGrid items={items} getHref={(item) => `/invoices/${item.id}`} columns={[
          { key: 'id', header: 'Invoice', render: (item) => item.id },
          { key: 'customer', header: 'Customer', render: (item) => item.customer },
          { key: 'amount', header: 'Amount', render: (item) => item.amount },
          { key: 'status', header: 'Status', render: (item) => renderStatus(item.status) },
          { key: 'paymentStatus', header: 'Payment state', render: (item) => item.paymentStatus }
        ]} />
      </Card>
    </div>
  );
}
