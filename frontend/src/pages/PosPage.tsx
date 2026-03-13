import { useMemo, useState } from 'react';

const catalog = [
  { id: 'SKU-1001', name: 'Kryvexis Label Printer', price: 2499, stock: 14 },
  { id: 'SKU-1021', name: 'Thermal Roll Box', price: 380, stock: 8 },
  { id: 'SKU-1080', name: 'Mobile Scanner', price: 1995, stock: 5 },
  { id: 'SKU-1120', name: 'Stock Shelf Tag Set', price: 540, stock: 22 }
] as const;

const tenderOptions = ['Cash', 'Card', 'EFT', 'Split'] as const;

function formatCurrency(value: number) {
  return `R${value.toLocaleString('en-ZA')}`;
}

export function PosPage() {
  const [quantities, setQuantities] = useState<Record<string, number>>({
    'SKU-1001': 1,
    'SKU-1021': 2
  });
  const [search, setSearch] = useState('');
  const [tender, setTender] = useState<(typeof tenderOptions)[number]>('Card');

  const filteredCatalog = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return catalog;
    return catalog.filter((item) => item.name.toLowerCase().includes(needle) || item.id.toLowerCase().includes(needle));
  }, [search]);

  const cartItems = catalog.filter((item) => (quantities[item.id] ?? 0) > 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * (quantities[item.id] ?? 0), 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  function changeQty(id: string, delta: number) {
    setQuantities((current) => {
      const next = Math.max(0, (current[id] ?? 0) + delta);
      return { ...current, [id]: next };
    });
  }

  return (
    <div className="page-grid pos-page">
      <section className="card pos-hero-card">
        <div className="card-header">
          <div>
            <span className="eyebrow">Sales desk</span>
            <h3>Point of sale</h3>
            <p>Fast tendering, quick product lookup, and a cleaner cashier surface.</p>
          </div>
          <div className="pos-hero-actions">
            <button className="ghost-button" type="button">Hold sale</button>
            <button className="solid-button" type="button">Complete sale</button>
          </div>
        </div>

        <div className="pos-summary-grid">
          <article className="soft-panel pos-summary-card">
            <span className="eyebrow">Till</span>
            <strong>Front Counter 01</strong>
            <p>Cashier: Alex Morgan</p>
          </article>
          <article className="soft-panel pos-summary-card">
            <span className="eyebrow">Queue</span>
            <strong>3 waiting</strong>
            <p>2 card, 1 cash customer</p>
          </article>
          <article className="soft-panel pos-summary-card">
            <span className="eyebrow">Today</span>
            <strong>R18,420</strong>
            <p>24 sales processed</p>
          </article>
        </div>
      </section>

      <section className="pos-grid">
        <article className="card pos-catalog-card">
          <div className="card-header">
            <div>
              <h3>Product lookup</h3>
              <p>Scan a barcode or search by SKU or description.</p>
            </div>
            <input
              className="pos-search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products or scan barcode"
            />
          </div>

          <div className="pos-catalog-list">
            {filteredCatalog.map((item) => (
              <article key={item.id} className="pos-product-row">
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.id} • {item.stock} in stock</p>
                </div>
                <div className="pos-product-actions">
                  <span>{formatCurrency(item.price)}</span>
                  <button className="ghost-button" type="button" onClick={() => changeQty(item.id, 1)}>Add</button>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="card pos-cart-card">
          <div className="card-header">
            <div>
              <h3>Current basket</h3>
              <p>Review quantities, tender type, and totals before checkout.</p>
            </div>
          </div>

          <div className="pos-cart-list">
            {cartItems.map((item) => (
              <article key={item.id} className="pos-cart-row">
                <div>
                  <strong>{item.name}</strong>
                  <p>{formatCurrency(item.price)} each</p>
                </div>
                <div className="pos-qty-controls">
                  <button className="icon-chip" type="button" onClick={() => changeQty(item.id, -1)}>−</button>
                  <strong>{quantities[item.id]}</strong>
                  <button className="icon-chip" type="button" onClick={() => changeQty(item.id, 1)}>＋</button>
                </div>
              </article>
            ))}
            {!cartItems.length ? <div className="loading-state">No items in the basket yet.</div> : null}
          </div>

          <div className="pos-payment-panel">
            <label className="stack-field compact-stack-field">
              <span>Tender type</span>
              <select value={tender} onChange={(event) => setTender(event.target.value as (typeof tenderOptions)[number])}>
                {tenderOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>

            <div className="pos-total-stack">
              <div><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
              <div><span>VAT</span><strong>{formatCurrency(tax)}</strong></div>
              <div className="pos-grand-total"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
            </div>

            <div className="pos-checkout-actions">
              <button className="ghost-button" type="button">Save draft sale</button>
              <button className="solid-button" type="button">Take payment</button>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
