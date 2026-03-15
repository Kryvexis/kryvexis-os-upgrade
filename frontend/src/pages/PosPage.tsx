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

function money(value: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 2 })
    .format(value)
    .replace('ZAR', 'R')
    .replace(/\u00a0/g, ' ');
}

function parseMoney(value: string) {
  return Number(String(value || '').replace(/[^\d.-]/g, '')) || 0;
}

export function PosPage() {
  const [mode, setMode] = useState<PosMode>('quick-sale');
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.products(), api.customers()])
      .then(([productRows, customerRows]) => {
        setProducts(productRows);
        setCustomers(customerRows);
        setSelectedCustomerId(customerRows[0]?.id || '');
      })
      .catch(() => {
        setProducts([]);
        setCustomers([]);
      });
  }, []);

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products.slice(0, 12);
    return products.filter((item) => {
      const haystack = `${item.name} ${item.sku} ${item.barcode}`.toLowerCase();
      return haystack.includes(needle);
    }).slice(0, 20);
  }, [products, query]);

  const subtotal = useMemo(() => cart.reduce((sum, line) => sum + parseMoney(line.unitPrice) * line.qty, 0), [cart]);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  function addLine(product: Product) {
    setCart((current) => {
      const existing = current.find((item) => item.sku === product.sku);
      if (existing) {
        return current.map((item) => item.sku === product.sku ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...current, { sku: product.sku, name: product.name, qty: 1, unitPrice: product.price }];
    });
  }

  function updateQty(sku: string, qty: number) {
    setCart((current) => current
      .map((item) => item.sku === sku ? { ...item, qty: Math.max(1, qty) } : item)
      .filter((item) => item.qty > 0));
  }

  async function submit() {
    if (!cart.length) {
      setError('Add at least one item to the basket first.');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'quote') {
        const result = await api.createQuote({
          customerId: selectedCustomerId,
          owner: 'POS Desk',
          status: 'Draft',
          notes: 'Created from Sales Desk / POS.',
          lines: cart.map((line) => ({ sku: line.sku, description: line.name, qty: line.qty, unitPrice: line.unitPrice }))
        });
        setMessage(`Quote ${result.quote.id} created from POS.`);
      } else {
        const invoice = await api.createInvoice({
          customerId: selectedCustomerId,
          amount: money(total),
          dueDays: mode === 'account-sale' ? 30 : 0
        });
        if (mode === 'quick-sale' || mode === 'invoice') {
          const payment = await api.createPayment({
            customerId: selectedCustomerId,
            invoiceId: invoice.invoice.id,
            amount: money(total),
            method: paymentMethod,
            proofAttached: true,
            autoAllocate: true
          });
          setMessage(`Invoice ${invoice.invoice.id} and payment ${payment.payment.ref} captured.`);
        } else {
          setMessage(`Account invoice ${invoice.invoice.id} created.`);
        }
      }
      setCart([]);
      setQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'POS action failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-grid pos-page">
      <Card title="Sales Desk / POS" subtitle="Quick sale, quote, invoice, and account sale from one branch-aware selling surface.">
        <div className="pos-mode-row">
          {([
            ['quick-sale', 'Quick sale'],
            ['quote', 'Quote'],
            ['invoice', 'Invoice'],
            ['account-sale', 'Account sale']
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`ghost-button ${mode === value ? 'active-pos-mode' : ''}`}
              onClick={() => setMode(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>

      {message ? <div className="banner-note">{message}</div> : null}
      {error ? <div className="banner-note error">{error}</div> : null}

      <div className="split-grid reports-split">
        <Card title="Product finder" subtitle="Search by barcode, SKU, or product name.">
          <div className="setting-list">
            <label className="stack-field">
              <span>Search product</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Scan barcode or type SKU / name" />
            </label>
          </div>
          <div className="pos-product-list">
            {filteredProducts.map((product) => (
              <button key={product.id} type="button" className="pos-product-card" onClick={() => addLine(product)}>
                <strong>{product.name}</strong>
                <p>{product.sku} • {product.branch}</p>
                <span>{product.price}</span>
              </button>
            ))}
            {!filteredProducts.length ? <p className="muted">No matching products found.</p> : null}
          </div>
        </Card>

        <Card title="Basket" subtitle="Convert the same basket into a quote, invoice, or cash/card/EFT sale.">
          <div className="setting-list">
            <label className="stack-field">
              <span>Customer</span>
              <select value={selectedCustomerId} onChange={(event) => setSelectedCustomerId(event.target.value)}>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
              </select>
            </label>
            <label className="stack-field">
              <span>Payment method</span>
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
                <option value="EFT">EFT</option>
              </select>
            </label>
          </div>

          <div className="pos-cart-list">
            {cart.map((line) => (
              <div key={line.sku} className="pos-cart-row">
                <div>
                  <strong>{line.name}</strong>
                  <p>{line.sku}</p>
                </div>
                <div className="pos-cart-controls">
                  <input type="number" min={1} value={line.qty} onChange={(event) => updateQty(line.sku, Number(event.target.value || 1))} />
                  <span>{line.unitPrice}</span>
                </div>
              </div>
            ))}
            {!cart.length ? <p className="muted">No items in the basket yet.</p> : null}
          </div>

          <div className="pos-summary">
            <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
            <div><span>VAT</span><strong>{money(vat)}</strong></div>
            <div className="pos-total"><span>Total</span><strong>{money(total)}</strong></div>
          </div>

          <div className="toolbar-actions">
            <button type="button" className="ghost-button" onClick={() => setCart([])} disabled={!cart.length || busy}>Clear basket</button>
            <button type="button" className="solid-button" onClick={submit} disabled={!cart.length || busy || !selectedCustomerId}>
              {busy ? 'Processing…' : mode === 'quote' ? 'Create quote' : mode === 'account-sale' ? 'Create account invoice' : 'Complete sale'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default PosPage;
