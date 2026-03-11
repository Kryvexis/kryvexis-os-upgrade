import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { KpiCard } from '../components/KpiCard';
import { api } from '../lib/api';
import { summarizeNotifications } from '../lib/notifications';
import type { DashboardResponse, Notification, RoleKey } from '../types';

export function DashboardPage({ role }: { role: RoleKey }) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    api.dashboard(role).then(setData);
    api.notifications().then(setNotifications).catch(() => setNotifications([]));
  }, [role]);

  async function markRead(id: string, read: boolean) {
    const updated = await api.markNotificationRead(id, read);
    setNotifications((current) => current.map((item) => item.id === id ? updated : item));
  }

  if (!data) return <div className="loading-state">Loading dashboard...</div>;

  const summary = summarizeNotifications(notifications.length ? notifications : data.highlights);
  const priorityItems = summary.alerts.slice(0, 4);

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

        <Card title="Priority inbox" subtitle="Notifications, approvals, collections, and finance exceptions linked back to records.">
          <div className="detail-stack priority-summary">
            <div><span>Unread alerts</span><strong>{summary.unread}</strong></div>
            <div><span>Approvals waiting</span><strong>{summary.approvals}</strong></div>
            <div><span>Collections at risk</span><strong>{summary.collections}</strong></div>
            <div><span>Payment exceptions</span><strong>{summary.paymentExceptions}</strong></div>
          </div>

          <div className="notification-stack priority-stack">
            {priorityItems.map((item) => (
              <article className="notification-row priority-card" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.meta}</p>
                  <div className="notification-actions-row">
                    <Link className="action-link" to={item.recordPath}>{item.actionLabel}</Link>
                    <button className="text-button" onClick={() => markRead(item.id, !item.read)}>
                      {item.read ? 'Mark unread' : 'Mark read'}
                    </button>
                  </div>
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
    </div>
  );
}
