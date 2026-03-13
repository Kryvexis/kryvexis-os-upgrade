import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { KpiCard } from '../components/KpiCard';
import { api } from '../lib/api';
import { summarizeNotifications } from '../lib/notifications';
import type { DashboardResponse, Notification, RoleKey } from '../types';

const workspaceTiles = [
  { label: 'Customers', path: '/customers' },
  { label: 'Quotes', path: '/quotes' },
  { label: 'Invoices', path: '/invoices' },
  { label: 'Payments', path: '/payments' },
  { label: 'POS', path: '/pos' }
] as const;

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

  const salesOverview = useMemo(() => {
    if (!data) return [];
    const clientValues = data.topClients.map((item) => Number(item.revenue.replace(/[^\d.]/g, '')) || 0);
    const maxValue = Math.max(...clientValues, 1);

    return data.topClients.map((item, index) => ({
      ...item,
      percent: Math.max(24, Math.round(((Number(item.revenue.replace(/[^\d.]/g, '')) || 0) / maxValue) * 100)),
      targetPercent: Math.max(18, 80 - index * 12)
    }));
  }, [data]);

  if (!data) return <div className="loading-state">Loading dashboard...</div>;

  const summary = summarizeNotifications(notifications.length ? notifications : data.highlights);
  const priorityItems = summary.alerts.slice(0, 3);
  const actionItems = data.actionCenter.actionQueue.slice(0, 2);
  const clientLead = data.topClients[0];
  const openInvoices = data.kpis.find((item) => /invoice/i.test(item.label));
  const approvals = data.kpis.find((item) => /approval/i.test(item.label));

  return (
    <div className="page-grid dashboard-v3">
      <section className="kpi-grid dashboard-kpi-grid compact-dashboard-kpis">
        {data.kpis.map((item) => <KpiCard key={item.label} item={item} />)}
      </section>

      <section className="dashboard-primary-grid dashboard-primary-grid-tight">
        <Card title="Sales overview" subtitle="A tighter command view for approvals, collections, and revenue movement." className="hero-card hero-card-compact">
          <div className="dashboard-hero-value-row compact-hero-row">
            <div>
              <strong className="hero-value compact-hero-value">{clientLead?.revenue ?? openInvoices?.value ?? 'R0'}</strong>
              <p className="hero-support">Top client this cycle • {clientLead?.name ?? 'No client selected yet'}</p>
            </div>
            <div className="hero-chip-stack horizontal-chips">
              <span className="hero-chip small-chip">{approvals?.value ?? '0'} approvals</span>
              <span className="hero-chip muted small-chip">{summary.unread} unread</span>
            </div>
          </div>

          <div className="sales-bars-card compact-sales-bars-card">
            {salesOverview.map((item) => (
              <div className="sales-bar-row compact-sales-bar-row" key={item.customerId}>
                <div className="sales-bar-copy compact-sales-copy">
                  <strong>{item.name}</strong>
                  <p>{item.trend}</p>
                </div>
                <div className="sales-bar-visuals">
                  <div className="sales-bar-track compact-sales-track">
                    <span className="sales-bar sales-bar-target" style={{ width: `${item.targetPercent}%` }} />
                    <span className="sales-bar sales-bar-actual" style={{ width: `${item.percent}%` }} />
                  </div>
                  <div className="sales-bar-values">
                    <strong>{item.revenue}</strong>
                    <span>{item.averageOrderValue} avg</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hero-footer-grid compact-hero-footer-grid">
            <div className="hero-footer-card compact-footer-card">
              <span className="eyebrow">Open invoices</span>
              <strong>{openInvoices?.value ?? 'R0'}</strong>
            </div>
            <div className="hero-footer-card compact-footer-card">
              <span className="eyebrow">Top client</span>
              <strong>{clientLead?.name ?? '—'}</strong>
            </div>
          </div>
        </Card>

        <div className="dashboard-side-stack dashboard-side-stack-tight">
          <Card title="Priority inbox" subtitle="Only the sharpest urgency stays above the fold." className="priority-compact-card tighter-panel-card">
            <div className="priority-summary-strip compact-summary-strip">
              <div><span>Unread</span><strong>{summary.unread}</strong></div>
              <div><span>Approvals</span><strong>{summary.approvals}</strong></div>
              <div><span>Collections</span><strong>{summary.collections}</strong></div>
            </div>
            <div className="notification-stack priority-stack compact-priority-stack">
              {priorityItems.map((item) => (
                <article className="notification-row priority-card compact-priority-card" key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.meta}</p>
                    <div className="notification-actions-row compact-link-row">
                      <Link className="action-link" to={item.recordPath}>{item.actionLabel}</Link>
                      <button className="text-button" onClick={() => markRead(item.id, !item.read)}>
                        {item.read ? 'Unread' : 'Mark read'}
                      </button>
                    </div>
                  </div>
                  <span className={`badge ${item.read ? 'neutral' : item.type === 'collection' ? 'danger' : 'warning'}`}>{item.state}</span>
                </article>
              ))}
            </div>
          </Card>

          <Card title="Today's actions" subtitle="Two fast moves to keep the cycle moving." className="tighter-panel-card">
            <div className="action-focus-stack compact-action-stack">
              {actionItems.map((item) => (
                <article key={item.id} className="action-focus-row compact-action-row">
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.owner} • {item.branch}</p>
                  </div>
                  <Link className="ghost-button compact-button" to={item.recordPath}>{item.actionLabel}</Link>
                </article>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="dashboard-secondary-grid compact-secondary-grid">
        <Card title="Workspace tiles" subtitle="Jump straight into the operating modules." className="compact-secondary-card">
          <div className="workspace-tile-grid compact-workspace-grid">
            {workspaceTiles.map((tile) => (
              <Link key={tile.path} to={tile.path} className="workspace-tile compact-workspace-tile">
                <span className="workspace-tile-icon" />
                <strong>{tile.label}</strong>
              </Link>
            ))}
          </div>
        </Card>

        <Card title="Watchlist" subtitle="The three compact signals worth keeping visible." className="compact-secondary-card">
          <div className="watchlist-grid compact-watchlist-grid">
            <div className="watchlist-card compact-watch-card">
              <span className="eyebrow">Low stock</span>
              <strong>{data.lowStockProducts.length}</strong>
              <p>{data.lowStockProducts[0] ? data.lowStockProducts[0].name : 'No immediate stock alerts'}</p>
            </div>
            <div className="watchlist-card compact-watch-card">
              <span className="eyebrow">Branch focus</span>
              <strong>{data.actionCenter.branchSnapshots[0]?.branch ?? '—'}</strong>
              <p>{data.actionCenter.branchSnapshots[0] ? `${data.actionCenter.branchSnapshots[0].exceptions} exceptions` : 'Waiting for branch data'}</p>
            </div>
            <div className="watchlist-card compact-watch-card">
              <span className="eyebrow">Top client</span>
              <strong>{clientLead?.name ?? '—'}</strong>
              <p>{clientLead ? clientLead.revenue : 'No sales signal yet'}</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
