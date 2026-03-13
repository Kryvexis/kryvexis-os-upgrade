import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { summarizeNotifications } from '../lib/notifications';
import type { DashboardResponse, Notification, RoleKey } from '../types';

const workspaceTiles = [
  { label: 'Customers', path: '/customers', icon: 'customers' },
  { label: 'Quotes', path: '/quotes', icon: 'quotes' },
  { label: 'Invoices', path: '/invoices', icon: 'invoices' },
  { label: 'Payments', path: '/payments', icon: 'payments' }
] as const;

function DashboardIcon({ kind }: { kind: string }) {
  return <span className={`tile-symbol tile-symbol-${kind}`} aria-hidden="true" />;
}

function currencyValue(value: string) {
  return Number(value.replace(/[^\d.-]/g, '')) || 0;
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
    const max = Math.max(...data.performance.trend.flatMap((item) => [item.actual, item.target]), 1);
    return data.performance.trend.map((item) => ({
      ...item,
      actualHeight: Math.round((item.actual / max) * 100),
      targetHeight: Math.round((item.target / max) * 100)
    }));
  }, [data]);

  if (!data) return <div className="loading-state">Loading dashboard...</div>;

  const summary = summarizeNotifications(notifications.length ? notifications : data.highlights);
  const performance = data.performance;
  const targetGap = currencyValue(performance.monthlyTarget) - currencyValue(performance.monthToDateSales);
  const targetGapLabel = targetGap > 0 ? `R${targetGap.toLocaleString('en-ZA')} short` : 'Target achieved';
  const reportAllowed = ['admin', 'manager', 'executive'].includes(role);

  return (
    <div className="dashboard-mockup-page phase2-dashboard-page">
      <section className="dashboard-mockup-grid phase2-dashboard-grid">
        <div className="dashboard-mockup-main phase2-dashboard-main">
          <div className="dashboard-top-stat-grid phase2-top-stat-grid">
            <article className="dashboard-top-stat-card warning-tone">
              <div className="dashboard-top-stat-icon"><DashboardIcon kind="payments" /></div>
              <div>
                <span>Yesterday sales</span>
                <strong>{performance.yesterdaySales}</strong>
                <p>{performance.branch}</p>
              </div>
            </article>
            <article className="dashboard-top-stat-card amber-tone">
              <div className="dashboard-top-stat-icon"><DashboardIcon kind="quotes" /></div>
              <div>
                <span>Daily target</span>
                <strong>{performance.dailyTarget}</strong>
                <p>{performance.scopeLabel}</p>
              </div>
            </article>
          </div>

          <section className="dashboard-overview-panel phase2-overview-panel">
            <div className="dashboard-overview-head phase2-overview-head">
              <div>
                <span className="eyebrow">{performance.scopeLabel}</span>
                <h2>{performance.actorName}</h2>
                <strong>{performance.monthToDateSales}</strong>
                <p className="phase2-overview-copy">Monthly target {performance.monthlyTarget} • {performance.attainmentPercent}% achieved</p>
              </div>
              <div className="phase2-progress-panel">
                <span className="phase2-progress-pill">{performance.attainmentPercent}%</span>
                <div className="phase2-progress-track">
                  <span className="phase2-progress-fill" style={{ width: `${Math.min(performance.attainmentPercent, 100)}%` }} />
                </div>
                <p>{targetGapLabel}</p>
              </div>
            </div>

            <div className="dashboard-chart-shell phase2-chart-shell">
              <div className="dashboard-chart-grid-lines" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="dashboard-chart-bars phase2-chart-bars">
                {chart.map((item) => (
                  <div key={item.label} className="dashboard-chart-col phase2-chart-col">
                    <div className="dashboard-chart-stack phase2-chart-stack">
                      <span className="chart-bar chart-bar-revenue" style={{ height: `${item.actualHeight}%` }} />
                      <span className="chart-bar chart-bar-target" style={{ height: `${item.targetHeight}%` }} />
                    </div>
                    <div className="dashboard-chart-label">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-bottom-row phase2-bottom-row">
              <article className="dashboard-bottom-card">
                <span>Pipeline</span>
                <strong>{performance.pipelineValue}</strong>
              </article>
              <article className="dashboard-bottom-card">
                <span>Approvals waiting</span>
                <strong>{performance.approvalsWaiting}</strong>
              </article>
            </div>
          </section>
        </div>

        <div className="dashboard-mockup-side phase2-dashboard-side">
          <section className="dashboard-launchpad-panel phase2-launchpad-panel">
            <div className="phase2-side-section">
              <div className="phase2-side-header">
                <h3>Workspace tiles</h3>
                {reportAllowed ? <Link to="/reports" className="action-link">Open reports</Link> : null}
              </div>
              <div className="phase2-workspace-grid">
                {workspaceTiles.map((tile) => (
                  <Link key={tile.path} to={tile.path} className="dashboard-launchpad-tile phase2-launchpad-tile">
                    <div className="dashboard-launchpad-icon">
                      <DashboardIcon kind={tile.icon} />
                    </div>
                    <strong>{tile.label}</strong>
                  </Link>
                ))}
              </div>
            </div>

            <div className="phase2-side-section">
              <div className="phase2-side-header">
                <h3>Branch yesterday</h3>
                <span className="eyebrow">Daily summary</span>
              </div>
              <div className="phase2-branch-list">
                {data.actionCenter.branchSnapshots.map((item) => (
                  <article key={item.branch} className="phase2-branch-row">
                    <div>
                      <strong>{item.branch}</strong>
                      <p>{item.approvals} approvals • {item.collections} collections</p>
                    </div>
                    <span>{item.exceptions} exceptions</span>
                  </article>
                ))}
              </div>
            </div>

            <div className="phase2-side-section">
              <div className="phase2-side-header">
                <h3>Priority inbox</h3>
                <span className="eyebrow">{summary.unread} unread</span>
              </div>
              <div className="phase2-branch-list">
                {summary.alerts.slice(0, 3).map((item) => (
                  <article key={item.id} className="phase2-branch-row">
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.meta}</p>
                    </div>
                    <span>{item.state}</span>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
