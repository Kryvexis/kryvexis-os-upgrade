import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { summarizeNotifications } from '../lib/notifications';
import type { DashboardResponse, Notification, RoleKey } from '../types';

const monthLabels = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'May', 'Jun'];

const workspaceTiles = [
  { label: 'Customers', path: '/customers', icon: 'customers' },
  { label: 'Quotes', path: '/quotes', icon: 'quotes' },
  { label: 'Invoices', path: '/invoices', icon: 'invoices' },
  { label: 'Payments', path: '/payments', icon: 'payments' }
] as const;

function DashboardIcon({ kind }: { kind: string }) {
  return <span className={`tile-symbol tile-symbol-${kind}`} aria-hidden="true" />;
}

export function DashboardPage({ role }: { role: RoleKey }) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    api.dashboard(role).then(setData);
    api.notifications().then(setNotifications).catch(() => setNotifications([]));
  }, [role]);

  const chart = useMemo(() => {
    if (!data) return [];
    const top = data.topClients.slice(0, 7);
    const raw = top.map((item, index) => {
      const value = Number(item.revenue.replace(/[^\d.]/g, '')) || 0;
      return {
        label: monthLabels[index] ?? `M${index + 1}`,
        revenue: value,
        target: Math.round(value * (0.56 + index * 0.05))
      };
    });

    const max = Math.max(...raw.flatMap((item) => [item.revenue, item.target]), 1);
    return raw.map((item) => ({
      ...item,
      revenueHeight: Math.max(18, Math.round((item.revenue / max) * 100)),
      targetHeight: Math.max(12, Math.round((item.target / max) * 100))
    }));
  }, [data]);

  if (!data) return <div className="loading-state">Loading dashboard...</div>;

  const summary = summarizeNotifications(notifications.length ? notifications : data.highlights);
  const openInvoices = data.kpis.find((item) => /invoice/i.test(item.label));
  const approvals = data.kpis.find((item) => /approval/i.test(item.label));
  const overdue = data.kpis.find((item) => /overdue/i.test(item.detail) || /invoice/i.test(item.label));
  const debtors = data.kpis.find((item) => /receipts|cash|payments/i.test(item.label)) ?? data.kpis[0];
  const clientLead = data.topClients[0];
  const priorityItem = summary.alerts[0];

  return (
    <div className="dashboard-mockup-page">
      <section className="dashboard-mockup-grid">
        <div className="dashboard-mockup-main">
          <div className="dashboard-top-stat-grid">
            <article className="dashboard-top-stat-card warning-tone">
              <div className="dashboard-top-stat-icon"><DashboardIcon kind="invoices" /></div>
              <div>
                <span>Open Invoices</span>
                <strong>{openInvoices?.value ?? 'R0'}</strong>
                <p>{overdue?.detail ?? 'Overdue'}</p>
              </div>
            </article>
            <article className="dashboard-top-stat-card amber-tone">
              <div className="dashboard-top-stat-icon"><DashboardIcon kind="approvals" /></div>
              <div>
                <span>Pending Approvals</span>
                <strong>{approvals?.value ?? '0'}</strong>
                <p>{summary.approvals} requests</p>
              </div>
            </article>
          </div>

          <section className="dashboard-overview-panel">
            <div className="dashboard-overview-head">
              <div>
                <h2>Sales Overview</h2>
                <strong>{clientLead?.revenue ?? 'R0'}</strong>
              </div>
              <div className="dashboard-overview-legend">
                <span><i className="legend-revenue" /> Revenues</span>
                <span><i className="legend-target" /> Target</span>
              </div>
            </div>

            <div className="dashboard-chart-shell">
              <div className="dashboard-chart-grid-lines" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="dashboard-chart-bars">
                {chart.map((item) => (
                  <div key={item.label} className="dashboard-chart-col">
                    <div className="dashboard-chart-stack">
                      <span className="chart-bar chart-bar-revenue" style={{ height: `${item.revenueHeight}%` }} />
                      <span className="chart-bar chart-bar-target" style={{ height: `${item.targetHeight}%` }} />
                    </div>
                    <div className="dashboard-chart-label">{item.label}</div>
                  </div>
                ))}
              </div>
              <svg className="dashboard-trend-line revenue-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <polyline points="4,90 18,80 32,79 46,72 60,45 74,47 96,28" />
              </svg>
              <svg className="dashboard-trend-line target-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <polyline points="4,92 18,88 32,84 46,79 60,70 74,66 96,58" />
              </svg>
            </div>
          </section>

          <div className="dashboard-bottom-row">
            <article className="dashboard-bottom-card">
              <span>Debtors &amp; Creditors</span>
              <strong>{debtors?.value ?? 'R0'}</strong>
            </article>
            <article className="dashboard-bottom-card">
              <span>Tasks &amp; Reminders</span>
              <p>{priorityItem?.title ?? 'No urgent reminders'}</p>
            </article>
          </div>
        </div>

        <div className="dashboard-mockup-side">
          <section className="dashboard-launchpad-panel">
            {workspaceTiles.map((tile) => (
              <Link key={tile.path} to={tile.path} className="dashboard-launchpad-tile">
                <div className="dashboard-launchpad-icon">
                  <DashboardIcon kind={tile.icon} />
                </div>
                <strong>{tile.label}</strong>
              </Link>
            ))}
          </section>
        </div>
      </section>
    </div>
  );
}
