import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { DataGrid, renderStatus } from '../components/DataGrid';
import { api } from '../lib/api';
import type { CreateQuotePayload, Customer, Product, Quote } from '../types';

const emptyForm: CreateQuotePayload = { customerId: '', owner: 'Sales Desk', status: 'Draft', notes: '', lines: [{ sku: '', description: '', qty: 1, unitPrice: '' }] };

export function QuotesPage() {
  const [items, setItems] = useState<Quote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<CreateQuotePayload>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const [quotes, customerRows, productRows] = await Promise.all([api.quotes(), api.customers(), api.products()]);
    setItems(quotes);
    setCustomers(customerRows);
    setProducts(productRows as unknown as Product[]);
    setForm((current) => ({ ...current, customerId: current.customerId || customerRows[0]?.id || '' }));
  }

  useEffect(() => { load().catch(() => undefined); }, []);

  const pipeline = useMemo(() => ({
    draft: items.filter((item) => item.status === 'Draft').length,
    approvals: items.filter((item) => item.status === 'Pending approval').length,
    convertible: items.filter((item) => item.status === 'Approved' || item.status === 'Sent to customer').length,
    value: items.reduce((sum, item) => sum + Number(String(item.value).replace(/[^\d.-]/g, '')), 0)
  }), [items]);

  async function submitQuote() {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        ...form,
        lines: form.lines.filter((line) => line.sku || line.description)
      };
      const result = await api.createQuote(payload);
      setMessage(`Quote ${result.quote.id} created.`);
      setForm({ ...emptyForm, customerId: customers[0]?.id || '' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create quote');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-grid">
      <div className="kpi-grid compact-kpi-grid">
        <Card className="metric-card"><p className="eyebrow">Draft quotes</p><strong>{pipeline.draft}</strong><p>Still being prepared</p></Card>
        <Card className="metric-card"><p className="eyebrow">Approval queue</p><strong>{pipeline.approvals}</strong><p>Manager attention needed</p></Card>
        <Card className="metric-card"><p className="eyebrow">Ready to convert</p><strong>{pipeline.convertible}</strong><p>Approved or sent quotes</p></Card>
        <Card className="metric-card"><p className="eyebrow">Pipeline value</p><strong>R{pipeline.value.toLocaleString()}</strong><p>Total visible quote value</p></Card>
      </div>

      <div className="split-grid reports-split">
        <Card title="Create quote" subtitle="Start the real quote-to-invoice pipeline from one calm card.">
          <div className="setting-list">
            <label className="stack-field"><span>Customer</span><select value={form.customerId} onChange={(e) => setForm((current) => ({ ...current, customerId: e.target.value }))}>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></label>
            <label className="stack-field"><span>Owner</span><input value={form.owner || ''} onChange={(e) => setForm((current) => ({ ...current, owner: e.target.value }))} /></label>
            <label className="stack-field"><span>Status</span><select value={form.status} onChange={(e) => setForm((current) => ({ ...current, status: e.target.value as CreateQuotePayload['status'] }))}><option value="Draft">Draft</option><option value="Pending approval">Pending approval</option></select></label>
            <label className="stack-field"><span>SKU</span><select value={form.lines[0]?.sku || ''} onChange={(e) => {
              const product = products.find((item) => item.sku === e.target.value);
              setForm((current) => ({ ...current, lines: [{ ...current.lines[0], sku: e.target.value, description: product?.name || '', unitPrice: product?.price || '' }] }));
            }}><option value="">Select SKU</option>{products.map((product) => <option key={product.sku} value={product.sku}>{product.sku} • {product.name}</option>)}</select></label>
            <div className="split-grid">
              <label className="stack-field"><span>Qty</span><input type="number" min={1} value={form.lines[0]?.qty || 1} onChange={(e) => setForm((current) => ({ ...current, lines: [{ ...current.lines[0], qty: Number(e.target.value || 1) }] }))} /></label>
              <label className="stack-field"><span>Unit price</span><input value={form.lines[0]?.unitPrice || ''} onChange={(e) => setForm((current) => ({ ...current, lines: [{ ...current.lines[0], unitPrice: e.target.value }] }))} /></label>
            </div>
            <label className="stack-field"><span>Notes</span><textarea value={form.notes || ''} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} rows={3} /></label>
          </div>
          <div className="toolbar-actions">
            <button className="solid-button" type="button" onClick={submitQuote} disabled={busy}>{busy ? 'Creating…' : 'Create quote'}</button>
          </div>
          {message ? <div className="banner-note">{message}</div> : null}
          {error ? <div className="banner-note error">{error}</div> : null}
        </Card>

        <Card title="Pipeline guidance" subtitle="Use quotes to create governed commercial flow, not more disconnected records.">
          <div className="notification-stack">
            <article className="mini-list-row"><div><strong>Draft</strong><p>Build the commercial package clearly before it touches approval.</p></div><div className="align-right"><strong>{pipeline.draft}</strong><p>open</p></div></article>
            <article className="mini-list-row"><div><strong>Approval queue</strong><p>High-value or margin-sensitive quotes should stop here, not later.</p></div><div className="align-right"><strong>{pipeline.approvals}</strong><p>waiting</p></div></article>
            <article className="mini-list-row"><div><strong>Convertible</strong><p>The fastest path to invoicing once the customer is ready.</p></div><div className="align-right"><strong>{pipeline.convertible}</strong><p>ready</p></div></article>
          </div>
        </Card>
      </div>

      <Card title="Quotes" subtitle="Validity, approval triggers, owners, and conversion-oriented follow-up.">
        <DataGrid
          items={items}
          getHref={(item) => `/quotes/${item.id}`}
          columns={[
            { key: 'id', header: 'Quote', render: (item) => item.id },
            { key: 'customer', header: 'Customer', render: (item) => item.customer },
            { key: 'value', header: 'Value', render: (item) => item.value },
            { key: 'status', header: 'Status', render: (item) => renderStatus(item.status) },
            { key: 'updated', header: 'Updated', render: (item) => item.updated },
            { key: 'nextAction', header: 'Next action', render: (item) => item.nextAction }
          ]}
        />
      </Card>
    </div>
  );
}
