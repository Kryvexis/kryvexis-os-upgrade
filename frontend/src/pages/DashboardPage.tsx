import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { KpiCard } from '../components/KpiCard';
import { api } from '../lib/api';
import type { DashboardResponse, RoleKey } from '../types';

export function DashboardPage({ role }: { role: RoleKey }) {
  const [data, setData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    api.dashboard(role).then(setData);
  }, [role]);

  if (!data) return <div className="loading-state">Loading dashboard...</div>;

  return (
    <div className="page-grid">
      <section className="kpi-grid">{data.kpis.map((item) => <KpiCard key={item.label} item={item} />)}</section>

      <div className="split-grid">
        <Card title="Role focus panels" subtitle={`Active dashboard view: ${data.role}`}>
          <div className="list-grid">
            {data.panels.map((panel) => (
              <div className="soft-panel" key={panel.title}>
                <h4>{panel.title}</h4>
                <ul>{panel.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Priority inbox" subtitle="Notifications, approvals, and follow-up states">
          <div className="notification-stack">
            {data.highlights.map((item) => (
              <article className="notification-row" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.meta}</p>
                </div>
                <span className={`badge ${item.read ? 'neutral' : 'warning'}`}>{item.state}</span>
              </article>
            ))}
          </div>
        </Card>
      </div>

      <div className="split-grid">
        <Card title="Top sales per client" subtitle="Immediate commercial signal for collections and account growth.">
          <div className="notification-stack">
            {data.topClients.map((item) => (
              <article key={item.customerId} className="mini-list-row">
                <div>
                  <strong><Link to={`/customers/${item.customerId}`}>{item.name}</Link></strong>
                  <p>{item.invoices} invoices • AOV {item.averageOrderValue}</p>
                </div>
                <div className="align-right">
                  <strong>{item.revenue}</strong>
                  <p>{item.trend} • overdue {item.overdueBalance}</p>
                </div>
              </article>
            ))}
          </div>
        </Card>

        <Card title="Low-stock watch" subtitle="Keeps inventory and procurement in scope from the beginning">
          {data.lowStockProducts.map((item) => (
            <article key={item.id} className="mini-list-row">
              <div>
                <strong>{item.name}</strong>
                <p>{item.branch} • reorder at {item.reorderAt}</p>
              </div>
              <div className="align-right">
                <strong>{item.stock} on hand</strong>
                <p>{item.nextAction}</p>
              </div>
            </article>
          ))}
        </Card>
      </div>

      <div className="split-grid">
        <Card title="Recent customers" subtitle="Operational clarity for active accounts">
          {data.recentCustomers.map((item) => (
            <article key={item.id} className="mini-list-row">
              <div>
                <strong><Link to={`/customers/${item.id}`}>{item.name}</Link></strong>
                <p>{item.branch} • {item.owner}</p>
              </div>
              <div className="align-right">
                <strong>{item.balance}</strong>
                <p>{item.nextAction}</p>
              </div>
            </article>
          ))}
        </Card>

        <Card title="Why this phase first" subtitle="This package builds the commercial backbone before deeper workflow and PDFs.">
          <div className="detail-stack">
            <div><span>Added now</span><strong>Top clients, customer analytics, quote line items</strong></div>
            <div><span>Next package</span><strong>Quote to invoice conversion + print-ready documents</strong></div>
            <div><span>After that</span><strong>Approval actions, reminders, PDF save pipeline</strong></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
