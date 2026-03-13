import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Product } from '../types';

function WorkspaceBlock({ title, body, to }: { title: string; body: string; to: string }) {
  return (
    <Link to={to} className="workspace-block">
      <div className="workspace-icon" />
      <div className="workspace-block-copy">
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </Link>
  );
}

export function InventoryWorkspacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { api.products().then(setProducts); }, []);

  const lowStock = useMemo(() => products.filter((item) => item.stock <= item.reorderAt), [products]);
  const healthy = Math.max(products.length - lowStock.length, 0);

  return (
    <div className="module-page-grid">
      <section className="module-hero-card">
        <div className="module-hero-copy">
          <p className="eyebrow">Inventory workspace</p>
          <h2>Products, stock, movements, and transfers under one operating module.</h2>
          <p className="module-subcopy">Open inventory as a workspace first, then drill into product-level records and threshold pressure.</p>
        </div>
        <div className="module-chip-row">
          <span className="module-chip">{products.length} active SKUs</span>
          <span className="module-chip">{lowStock.length} low stock</span>
          <span className="module-chip">{healthy} healthy SKUs</span>
        </div>
      </section>

      <section className="module-board">
        <div className="module-board-head">
          <div>
            <strong className="module-board-count">5</strong>
            <p>Products, stock, movements, transfers, and low stock pressure.</p>
          </div>
        </div>
        <div className="workspace-block-grid two-up plus-single">
          <WorkspaceBlock title="Products" body="SKU records, pricing anchors, and item detail." to="/products" />
          <WorkspaceBlock title="Stock" body="On-hand levels, threshold pressure, and coverage." to="/products" />
          <WorkspaceBlock title="Movements" body="Recent movement summaries and internal flow." to="/products" />
          <WorkspaceBlock title="Transfers" body="Inter-branch stock transfers and handoff visibility." to="/products" />
          <WorkspaceBlock title="Low stock" body="Threshold breaches and reorder pressure." to="/products" />
        </div>
      </section>

      <section className="module-watch-card">
        <div className="card-header compact-card-header">
          <div>
            <h3>Low stock watchlist</h3>
            <p>Visible pressure items without opening the full stock table.</p>
          </div>
        </div>
        <div className="watchlist-stack">
          {lowStock.length ? lowStock.map((item) => (
            <Link key={item.id} to={`/products/${item.id}`} className="watchlist-row">
              <div>
                <strong>{item.name}</strong>
                <p>{item.branch} • reorder at {item.reorderAt}</p>
              </div>
              <span className="mini-badge warning">{item.stock} on hand</span>
            </Link>
          )) : <div className="watchlist-row"><strong>No low stock pressure</strong></div>}
        </div>
      </section>
    </div>
  );
}
