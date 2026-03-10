import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { KpiCard } from '../components/KpiCard';
import { api } from '../lib/api';
import { buildOperationalNotifications, type AlertSummary, type EnrichedNotification } from '../lib/notifications';
import type { DashboardResponse, RoleKey } from '../types';

type DashboardBundle = {
  dashboard: DashboardResponse;
  alerts: EnrichedNotification[];
  summary: AlertSummary;
};

export function DashboardPage({ role }: { role: RoleKey }) {
  const [data, setData] = useState<DashboardBundle | null>(null);

  useEffect(() => {
    Promise.all([api.dashboard(role), api.notifications(), api.quotes(), api.invoices(), api.payments()]).then(
      ([dashboard, notifications, quotes, invoices, payments]) => {
        const operational = buildOperationalNotifications({ notifications, quotes, invoices, payments });
        setData({
          dashboard,
          alerts: operational.feed.slice(0, 4),
          summary: operational.summary,
        });
      }
    );
  }, [role]);

  if (!data) return <div className="loading-state">Loading dashboard...</div>;

  return (
    <div className="page-grid">
      <section className="kpi-grid">{data.dashboard.kpis.map((item) => <KpiCard key={item.label} item={item} />)}</section>

      <div className="split-grid">
        <Card title="Role focus panels" subtitle={`Active dashboard view: ${data.dashboard.role}`}>
          <div className="list-grid">
            {data.dashboard.panels.map((panel) => (
              <div className="soft-panel" key={panel.title}>
                <h4>{panel.title}</h4>
                <ul>{panel.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Priority inbox" subtitle="Notifications, approvals, collections, and finance exceptions linked back to records.">
          <div className="detail-stack">
            <div><span>Unread alerts</span><strong>{data.summary.unread}</strong></div>
            <div><span>Approvals waiting</span><strong>{data.summary.approvals}</strong></div>
            <div><span>Collections at risk</span><strong>{data.summary.collections}</strong></div>
            <div><span>Payment exceptions</span><strong>{data.summary.paymentExceptions}</strong></div>
          </div>
          <div className="notification-stack">
            {data.alerts.map((item) => (
              <article className="notification-row" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.meta}</p>
                  <Link className="row-link" to={item.href}>{item.actionLabel}</Link>
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
            {data.dashboard.topClients.map((item) => (
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
          {data.dashboard.lowStockProducts.map((item) => (
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
          {data.dashboard.recentCustomers.map((item) => (
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

        <Card title="Phase D live layer" subtitle="The workspace now surfaces event-driven action instead of passive records.">
          <div className="detail-stack">
            <div><span>Added now</span><strong>Approval alerts, overdue invoice actions, payment exception links</strong></div>
            <div><span>Operational benefit</span><strong>Every alert now opens the related quote, invoice, or payment record</strong></div>
            <div><span>Next package</span><strong>Reminder controls, approval decisions, and notification state changes</strong></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
