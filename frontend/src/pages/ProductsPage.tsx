import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { InventoryOverview, InventoryRow } from '../types';

const emptyOverview: InventoryOverview = {
  generatedAt: new Date().toISOString(),
  kpis: [],
  focus: [],
  stockRisks: [],
  transferSuggestions: [],
  movementIntelligence: [],
  exceptions: [],
  rows: []
};

export function ProductsPage() {
  const [data, setData] = useState<InventoryOverview>(emptyOverview);

  useEffect(() => {
    api.inventoryOverview().then(setData).catch(() => setData(emptyOverview));
  }, []);

  const items = data.rows;
  const lowStock = useMemo(() => items.filter((item) => item.freeToSell <= item.reorderAt), [items]);
  const totalUnits = items.reduce((sum, item) => sum + item.onHand, 0);
  const healthy = items.filter((item) => item.riskBand === 'Healthy').length;

  return (
    <div className="page-grid inventory-page-grid">
      <Card title="Inventory brain" subtitle="Stock risk, reservations, movement pressure, and transfer-first logic in one control surface." className="inventory-hero-card">
        <div className="inventory-hero-grid">
          <div>
            <strong className="hero-value compact-hero-value">{totalUnits}</strong>
            <p className="hero-support">Units on hand across active stock records</p>
          </div>
          <div className="hero-chip-stack horizontal-chips">
            <span className="hero-chip small-chip">{lowStock.length} at-risk SKUs</span>
            <span className="hero-chip muted small-chip">{healthy} healthy covers</span>
          </div>
        </div>
        <div className="inventory-tile-grid">
          {data.kpis.map((item) => (
            <div key={item.label} className="inventory-module-tile">
              <span className="workspace-tile-icon" />
              <strong>{item.label}</strong>
              <p>{item.value}</p>
              <p>{item.detail}</p>
            </div>
          ))}
        </div>
      </Card>

      <section className="dashboard-secondary-grid compact-secondary-grid inventory-secondary-grid">
        <Card title="Stock risk watchlist" subtitle="Reservation-aware cover, not just raw on-hand counts.">
          <div className="notification-stack compact-priority-stack inventory-watch-stack">
            {(data.stockRisks.length ? data.stockRisks : items.slice(0, 2)).map((item) => (
              <article key={item.id} className="notification-row priority-card compact-priority-card">
                <div>
                  <strong>{item.product}</strong>
                  <p>{item.branch} • free {item.freeToSell} / reorder {item.reorderAt}</p>
                </div>
                <div className="inventory-watch-meta">
                  <strong>{item.riskBand}</strong>
                  <Link className="action-link" to={`/products/${item.id.replace('ISR-', '')}`}>Open record</Link>
                </div>
              </article>
            ))}
          </div>
        </Card>

        <Card title="Transfer optimizer" subtitle="Move stock internally before buying more.">
          <div className="notification-stack compact-priority-stack inventory-watch-stack">
            {data.transferSuggestions.slice(0, 4).map((item) => (
              <article key={item.id} className="notification-row priority-card compact-priority-card">
                <div>
                  <strong>{item.product}</strong>
                  <p>{item.fromBranch} → {item.toBranch} • transfer {item.suggestedUnits || 0} • buy shortfall {item.buyShortfallOnly}</p>
                </div>
                <div className="inventory-watch-meta">
                  <strong>{item.urgency}</strong>
                  <span>Score {item.score}</span>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </section>

      <section className="dashboard-secondary-grid compact-secondary-grid inventory-secondary-grid">
        <Card title="Movement intelligence" subtitle="Fast movers, anomalies, and slow stock without noise.">
          <div className="history-table-wrap">
            <table className="data-grid history-table inventory-table compact-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Branch</th>
                  <th>Movement</th>
                  <th>Insight</th>
                </tr>
              </thead>
              <tbody>
                {data.movementIntelligence.slice(0, 6).map((item) => (
                  <tr key={item.id}>
                    <td>{item.product}</td>
                    <td>{item.branch}</td>
                    <td>{item.movementBand}</td>
                    <td>{item.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="SKU table" subtitle="Reservation-aware stock table for day-to-day control.">
          <div className="history-table-wrap">
            <table className="data-grid history-table inventory-table compact-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>On hand</th>
                  <th>Reserved</th>
                  <th>Free</th>
                  <th>Risk</th>
                  <th>Next action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: InventoryRow) => (
                  <tr key={item.id}>
                    <td><Link className="table-link" to={`/products/${item.id}`}>{item.product}</Link></td>
                    <td>{item.onHand}</td>
                    <td>{item.reserved}</td>
                    <td>{item.freeToSell}</td>
                    <td>{item.riskBand}</td>
                    <td>{item.recommendation}</td>
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
