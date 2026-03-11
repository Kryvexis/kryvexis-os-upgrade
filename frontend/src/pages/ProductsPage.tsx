import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { Product } from '../types';

export function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    api.products().then(setItems);
  }, []);

  const lowStock = useMemo(() => items.filter((item) => item.stock <= item.reorderAt), [items]);
  const totalUnits = items.reduce((sum, item) => sum + item.stock, 0);
  const healthy = items.filter((item) => item.status === 'Healthy').length;

  return (
    <div className="page-grid inventory-page-grid">
      <Card title="Inventory workspace" subtitle="Products, stock watch, movements, and reorder visibility in one cleaner control surface." className="inventory-hero-card">
        <div className="inventory-hero-grid">
          <div>
            <strong className="hero-value compact-hero-value">{totalUnits}</strong>
            <p className="hero-support">Units on hand across active stock records</p>
          </div>
          <div className="hero-chip-stack horizontal-chips">
            <span className="hero-chip small-chip">{lowStock.length} low stock</span>
            <span className="hero-chip muted small-chip">{healthy} healthy SKUs</span>
          </div>
        </div>
        <div className="inventory-tile-grid">
          <div className="inventory-module-tile"><span className="workspace-tile-icon" /><strong>Products</strong><p>Master SKU records and pricing anchors.</p></div>
          <div className="inventory-module-tile"><span className="workspace-tile-icon" /><strong>Stock</strong><p>On-hand levels, threshold pressure, and watch items.</p></div>
          <div className="inventory-module-tile"><span className="workspace-tile-icon" /><strong>Movements</strong><p>Recent movement summaries and supplier-linked activity.</p></div>
          <div className="inventory-module-tile"><span className="workspace-tile-icon" /><strong>Transfers</strong><p>Foundation for inter-branch stock flow and internal handoffs.</p></div>
        </div>
      </Card>

      <section className="dashboard-secondary-grid compact-secondary-grid inventory-secondary-grid">
        <Card title="Low stock watchlist" subtitle="Keep threshold breaches visible without flooding the page.">
          <div className="notification-stack compact-priority-stack inventory-watch-stack">
            {(lowStock.length ? lowStock : items.slice(0, 2)).map((item) => (
              <article key={item.id} className="notification-row priority-card compact-priority-card">
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.branch} • reorder at {item.reorderAt}</p>
                </div>
                <div className="inventory-watch-meta">
                  <strong>{item.stock}</strong>
                  <Link className="action-link" to={`/products/${item.id}`}>Open record</Link>
                </div>
              </article>
            ))}
          </div>
        </Card>

        <Card title="SKU table" subtitle="Compact stock table for day-to-day control.">
          <div className="history-table-wrap">
            <table className="data-grid history-table inventory-table compact-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Next action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td><Link className="table-link" to={`/products/${item.id}`}>{item.name}</Link></td>
                    <td>{item.sku}</td>
                    <td>{item.stock}</td>
                    <td>{item.status}</td>
                    <td>{item.nextAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
