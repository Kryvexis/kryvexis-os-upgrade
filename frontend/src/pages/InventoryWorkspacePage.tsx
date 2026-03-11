import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import { useEffect, useMemo, useState } from 'react';
import type { Product } from '../types';

const inventoryBlocks = [
  { label: 'Products', path: '/products', blurb: 'SKU records, pricing anchors, and item detail.' },
  { label: 'Stock', path: '/products', blurb: 'On-hand levels, threshold pressure, and coverage.' },
  { label: 'Movements', path: '/products', blurb: 'Recent movement summaries and internal flow.' },
  { label: 'Transfers', path: '/products', blurb: 'Inter-branch stock transfers and handoff visibility.' },
  { label: 'Low stock', path: '/products', blurb: 'Threshold breaches and reorder pressure.' }
] as const;

export function InventoryWorkspacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { api.products().then(setProducts).catch(() => setProducts([])); }, []);
  const lowStock = useMemo(() => products.filter((item) => item.stock <= item.reorderAt), [products]);

  return (
    <div className="page-grid module-workspace-page">
      <Card title="Inventory workspace" subtitle="The inventory module opens as a workspace first, then drills into product-level records." className="module-hero-card">
        <div className="module-hero-grid">
          <div>
            <strong className="hero-value compact-hero-value">{products.length || 0}</strong>
            <p className="hero-support">Active SKU records across products, stock, movements, and transfers.</p>
          </div>
          <div className="hero-chip-stack horizontal-chips">
            <span className="hero-chip small-chip">{lowStock.length} low stock</span>
            <span className="hero-chip small-chip">{products.filter((item) => item.status === 'Healthy').length} healthy SKUs</span>
          </div>
        </div>
        <div className="module-block-grid inventory-module-grid">
          {inventoryBlocks.map((block) => (
            <Link key={block.label} to={block.path} className="module-block-card">
              <span className="module-block-icon" />
              <strong>{block.label}</strong>
              <p>{block.blurb}</p>
            </Link>
          ))}
        </div>
      </Card>

      <div className="module-support-grid">
        <Card title="Low stock watchlist" subtitle="Visible pressure items without opening the full stock table.">
          <div className="module-list-stack">
            {lowStock.slice(0, 3).map((item) => (
              <Link key={item.id} to={`/products/${item.id}`} className="mini-list-row module-list-row">
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.branch} • reorder at {item.reorderAt}</p>
                </div>
                <span className="badge warning">{item.stock} on hand</span>
              </Link>
            ))}
          </div>
        </Card>
        <Card title="Inventory quick focus" subtitle="The first places to look before drilling into record detail.">
          <div className="module-mini-stats">
            <div className="hero-footer-card compact-footer-card">
              <span className="eyebrow">Products</span>
              <strong>{products.length}</strong>
            </div>
            <div className="hero-footer-card compact-footer-card">
              <span className="eyebrow">Suppliers in view</span>
              <strong>{new Set(products.map((item) => item.supplier)).size}</strong>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
