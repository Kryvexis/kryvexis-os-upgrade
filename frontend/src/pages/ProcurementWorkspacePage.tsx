import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import { useEffect, useState } from 'react';
import type { PurchaseOrder, Supplier } from '../types';

const procurementBlocks = [
  { label: 'Suppliers', path: '/procurement', blurb: 'Commercial partners, lead times, and contact ownership.' },
  { label: 'Purchase Orders', path: '/procurement', blurb: 'PO queue, approvals, and issue-to-receipt flow.' },
  { label: 'Reorders', path: '/procurement', blurb: 'Threshold-driven reorder candidates and follow-up.' },
  { label: 'Goods Received', path: '/procurement', blurb: 'Inbound stock acknowledgement and receiving control.' },
  { label: 'Supplier Bills', path: '/procurement', blurb: 'Bills matched against deliveries and PO references.' }
] as const;

export function ProcurementWorkspacePage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    api.purchaseOrders().then(setPurchaseOrders).catch(() => setPurchaseOrders([]));
    api.suppliers().then(setSuppliers).catch(() => setSuppliers([]));
  }, []);

  return (
    <div className="page-grid module-workspace-page">
      <Card title="Procurement workspace" subtitle="POs, suppliers, reorders, and goods received live under one procurement module instead of separate flat sidebar links." className="module-hero-card">
        <div className="module-hero-grid">
          <div>
            <strong className="hero-value compact-hero-value">{purchaseOrders.length || 0}</strong>
            <p className="hero-support">Open procurement control blocks with purchase orders at the center.</p>
          </div>
          <div className="hero-chip-stack horizontal-chips">
            <span className="hero-chip small-chip">{purchaseOrders.filter((item) => item.status === 'Pending approval').length} pending POs</span>
            <span className="hero-chip small-chip">{suppliers.length} suppliers</span>
          </div>
        </div>
        <div className="module-block-grid procurement-module-grid">
          {procurementBlocks.map((block) => (
            <Link key={block.label} to={block.path} className="module-block-card">
              <span className="module-block-icon" />
              <strong>{block.label}</strong>
              <p>{block.blurb}</p>
            </Link>
          ))}
        </div>
      </Card>

      <div className="module-support-grid">
        <Card title="PO queue" subtitle="The live purchase order foundation you asked for.">
          <div className="table-wrap module-table-wrap">
            <table className="data-grid">
              <thead>
                <tr><th>PO</th><th>Supplier</th><th>Status</th><th>Branch</th><th>Value</th></tr>
              </thead>
              <tbody>
                {purchaseOrders.slice(0, 4).map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.id}</strong></td>
                    <td>{item.supplier}</td>
                    <td>{item.status}</td>
                    <td>{item.branch}</td>
                    <td>{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Supplier watchlist" subtitle="Lead-time pressure and next procurement actions.">
          <div className="module-list-stack">
            {suppliers.slice(0, 3).map((item) => (
              <article key={item.id} className="mini-list-row module-list-row">
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.category} • lead time {item.leadTime}</p>
                </div>
                <span className={`badge ${item.status === 'On track' ? 'success' : 'warning'}`}>{item.status}</span>
              </article>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
