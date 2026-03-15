import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { Customer, Product } from '../types';

type PosMode = 'quick-sale' | 'quote' | 'invoice' | 'account-sale';
type CartLine = {
  sku: string;
  name: string;
  qty: number;
  unitPrice: string;
};

const modeCopy: Record<PosMode, { title: string; subtitle: string; cta: string }> = {
  'quick-sale': {
    title: 'Quick sale',
    subtitle: 'Ring up a walk-in customer, capture payment, and close the sale fast.',
    cta: 'Complete quick sale'
  },
  quote: {
    title: 'Quote',
    subtitle: 'Turn the basket into a quote for a customer who wants time or approval.',
    cta: 'Save as quote'
  },
  invoice: {
    title: 'Invoice',
    subtitle: 'Create an invoice directly from the sales desk for an account customer.',
    cta: 'Create invoice'
  },
  'account-sale': {
    title: 'Account sale',
    subtitle: 'Issue the invoice and immediately capture a payment if it lands at the counter.',
    cta: 'Invoice and record payment'
  }
};

function moneyFromString(value: string) {
  return Number(String(value || '').replace(/[^\d.-]/g, '')) || 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 2 })
    .format(value)
    .replace('ZAR', 'R')
    .replace(/\u00a0/g, ' ');
}

export function PosPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [mode, setMode] = useState<PosMode>('quick-sale');
  const [paymentMethod, setPaymentMethod] = useState('EFT');
  const [barcode, setBarcode] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.customers(), api.products()])
      .then(([customerRows, productRows]) => {
        setCustomers(customerRows);
        setProducts(productRows);
        setCustomerId(customerRows[0]?.id || '');
      })
      .catch(() => {
        setCustomers([]);
        setProducts([]);
      });
  }, []);

  const availableProducts = useMemo(() => {
    return products.filter((product) => !barcode.trim() || product.barcode?.includes(barcode.trim()) || product.sku.toLowerCase().includes(barcode.trim().toLowerCase()) || product.name.toLowerCase().includes(barcode.trim().toLowerCase()));
  }, [products, barcode]);

  const selectedCustomer = customers.find((item) => item.id === customerId);
  const subtotal = cart.reduce((sum, line) => sum + line.qty * moneyFromString(line.unitPrice), 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;
  const totalQty = cart.reduce((sum, line) => sum + line.qty, 0);

  function addProduct(product: Product) {
    setCart((current) => {
      const existing = current.find((line) => line.sku === product.sku);
      if (existing) {
        return current.map((line) => line.sku === product.sku ? { ...line, qty: line.qty + 1 } : line);
      }
      return [...current, { sku: product.sku, name: product.name, qty: 1, unitPrice: product.price }];
    });
    setBarcode('');
  }

  function updateQty(sku: string, qty: number) {
    if (qty <= 0) {
      setCart((current) => current.filter((line) => line.sku !== sku));
      return;
    }
    setCart((current) => current.map((line) => line.sku === sku ? { ...line, qty } : line));
  }

  async function checkout() {
    if (!cart.length) {
      setError('Add at least one product to the cart.');
      return;
    }
    if (!customerId) {
      setError('Select a customer first.');
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'quote') {
        const quote = await api.createQuote({
          customerId,
          owner: 'Sales Desk',
          status: 'Draft',
          notes: 'Created from POS / Sales Desk',
          lines: cart.map((line) => ({ sku: line.sku, description: line.name, qty: line.qty, unitPrice: line.unitPrice }))
        });
        setMessage(`Quote ${quote.quote.id} created from the sales desk.`);
      } else {
        const invoice = await api.createInvoice({
          customerId,
          dueDays: mode === 'quick-sale' ? 0 : 30,
          amount: formatCurrency(total)
        });
        if (mode === 'quick-sale' || mode === 'account-sale') {
          await api.createPayment({
            customerId,
            invoiceId: invoice.invoice.id,
            amount: formatCurrency(total),
            method: paymentMethod,
            proofAttached: true,
            autoAllocate: true
          });
          setMessage(`Invoice ${invoice.invoice.id} created and payment captured.`);
        } else {
          setMessage(`Invoice ${invoice.invoice.id} created from the sales desk.`);
        }
      }
      setCart([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'POS action failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-grid pos-page-grid">
      <section className="action-center-hero action-center-hero-v2 pos-hero-card">
        <div>
          <p className="eyebrow">Sales Desk / POS Core</p>
          <h2>Ring the sale, turn it into a quote, or push it straight into invoicing.</h2>
          <p className="muted">One selling surface for walk-ins, account customers, and fast branch counter flow.</p>
        </div>
        <div className="action-center-stats action-center-stats-v2">
          <article className="action-center-stat-card">
            <span>Cart lines</span>
            <strong>{cart.length}</strong>
            <p>{totalQty} units in the basket</p>
          </article>
          <article className="action-center-stat-card">
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
            <p>VAT {formatCurrency(vat)}</p>
          </article>
          <article className="action-center-stat-card action-center-heat-card">
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
            <p>{selectedCustomer?.name || 'Choose a customer'} • {modeCopy[mode].title}</p>
          </article>
        </div>
      </section>

      <div className="split-grid reports-split pos-main-grid">
        <Card title="Build the basket" subtitle="Search by barcode, SKU, or product name and add items fast.">
          <div className="setting-list">
            <label className="stack-field">
              <span>Sell mode</span>
              <select value={mode} onChange={(event) => setMode(event.target.value as PosMode)}>
                <option value="quick-sale">Quick sale</option>
                <option value="quote">Quote</option>
                <option value="invoice">Invoice</option>
                <option value="account-sale">Account sale</option>
              </select>
            </label>
            <label className="stack-field">
              <span>Customer</span>
              <select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
              </select>
            </label>
            {(mode === 'quick-sale' || mode === 'account-sale') ? (
              <label className="stack-field">
                <span>Payment method</span>
                <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                  <option value="EFT">EFT</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                </select>
              </label>
            ) : null}
            <label className="stack-field">
              <span>Barcode / SKU / product</span>
              <input value={barcode} onChange={(event) => setBarcode(event.target.value)} placeholder="Scan barcode or search product" />
            </label>
          </div>

          <div className="notification-stack pos-product-list">
            {availableProducts.slice(0, 8).map((product) => (
              <button key={product.id} type="button" className="mini-list-row pos-product-row" onClick={() => addProduct(product)}>
                <div>
                  <strong>{product.name}</strong>
                  <p>{product.sku} • {product.branch} • stock {product.stock}</p>
                </div>
                <div className="align-right">
                  <strong>{product.price}</strong>
                  <p>Add</p>
                </div>
              </button>
            ))}
            {!availableProducts.length ? <div className="mini-list-row"><div><strong>No products found</strong><p>Try a different barcode or SKU.</p></div></div> : null}
          </div>
        </Card>

        <Card title={modeCopy[mode].title} subtitle={modeCopy[mode].subtitle}>
          <div className="notification-stack pos-cart-list">
            {cart.map((line) => (
              <article key={line.sku} className="mini-list-row">
                <div>
                  <strong>{line.name}</strong>
                  <p>{line.sku} • {line.unitPrice}</p>
                </div>
                <div className="align-right pos-qty-block">
                  <div className="pos-qty-controls">
                    <button type="button" className="ghost-button" onClick={() => updateQty(line.sku, line.qty - 1)}>−</button>
                    <strong>{line.qty}</strong>
                    <button type="button" className="ghost-button" onClick={() => updateQty(line.sku, line.qty + 1)}>+</button>
                  </div>
                  <p>{formatCurrency(line.qty * moneyFromString(line.unitPrice))}</p>
                </div>
              </article>
            ))}
            {!cart.length ? <p className="muted">Nothing in the basket yet.</p> : null}
          </div>

          <div className="setting-list pos-summary-block">
            <div><span>Customer</span><strong>{selectedCustomer?.name || 'None selected'}</strong></div>
            <div><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
            <div><span>VAT</span><strong>{formatCurrency(vat)}</strong></div>
            <div><span>Total</span><strong>{formatCurrency(total)}</strong></div>
          </div>

          <div className="toolbar-actions">
            <button className="ghost-button" type="button" onClick={() => setCart([])} disabled={!cart.length || busy}>Clear basket</button>
            <button className="solid-button" type="button" onClick={checkout} disabled={busy || !cart.length}>{busy ? 'Processing…' : modeCopy[mode].cta}</button>
          </div>
          {message ? <div className="banner-note">{message}</div> : null}
          {error ? <div className="banner-note error">{error}</div> : null}
        </Card>
      </div>

      <div className="split-grid reports-split">
        <Card title="Why this matters" subtitle="The POS is not separate from the OS — it feeds the same transactional core.">
          <div className="notification-stack">
            <article className="mini-list-row"><div><strong>Quick sale</strong><p>Create the invoice and payment together when the sale closes at the counter.</p></div></article>
            <article className="mini-list-row"><div><strong>Quote mode</strong><p>Turn a basket into a governed quote when the customer needs time, approval, or revised terms.</p></div></article>
            <article className="mini-list-row"><div><strong>Invoice mode</strong><p>Issue an invoice directly for account customers without losing the sales-desk speed.</p></div></article>
          </div>
        </Card>
        <Card title="Next POS layer" subtitle="This package is the sales-desk core. The next POS phase can deepen checkout hardware and receipts.">
          <div className="notification-stack">
            <article className="mini-list-row"><div><strong>Next add-ons</strong><p>Barcode hardware capture, receipt templates, cashier shifts, discounts, and returns.</p></div></article>
            <article className="mini-list-row"><div><strong>Already connected</strong><p>Quotes, invoices, and payments flow into the same reporting and action surfaces.</p></div></article>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default PosPage;
