import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { DashboardResponse, RoleKey } from '../types';

function numericCurrency(value: string) {
  return Number(value.replace(/[^\d.]/g, '')) || 0;
}

export function DashboardPage({ role }: { role: RoleKey }) {
  const [data, setData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    api.dashboard(role).then(setData).catch(() => setData(null));
  }, [role]);

  const salesTrend = useMemo(() => {
    if (!data) return [];
    const top = data.topClients.slice(0, 6);
    const max = Math.max(1, ...top.map((item) => numericCurrency(item.revenue)));
    return top.map((item, index) => ({
      ...item,
      month: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Jun'][index] ?? `M${index + 1}`,
      actualHeight: Math.max(18, Math.round((numericCurrency(item.revenue) / max) * 100)),
      targetHeight: Math.max(14, 48 + index * 6)
    }));
  }, [data]);

  if (!data) return <div className="loading-state">Loading dashboard...</div>;

  const openInvoices = data.kpis.find((item) => /invoice/i.test(item.label));
  const approvals = data.kpis.find((item) => /approval/i.test(item.label));
  const totalSales = data.topClients[0]?.revenue ?? openInvoices?.value ?? 'R0';
  const debtorValue = data.actionCenter?.branchSnapshots?.[0]?.sales ?? data.lowStockProducts.length.toString();
  const reminder = data.actionCenter?.actionQueue?.[0]?.title ?? 'No urgent action right now';

  const workspaceTiles = [
    { label: 'Customers', path: '/customers', icon: '◔' },
    { label: 'Quotes', path: '/quotes', icon: '⌁' },
    { label: 'Invoices', path: '/invoices', icon: '▤' },
    { label: 'Payments', path: '/payments', icon: '◌' }
  ];

  return (
    <div className="page-grid dashboard-mockup-grid">
      <section className="dashboard-mockup-main">
        <div className="dashboard-top-stats">
          <Card className="mockup-stat-card warning">
            <div className="mockup-stat-icon red">◉</div>
            <div>
              <span className="eyebrow">Open invoices</span>
              <strong>{openInvoices?.value ?? 'R0'}</strong>
              <p>{openInvoices?.meta ?? 'Overdue balance'}</p>
            </div>
          </Card>
          <Card className="mockup-stat-card amber">
            <div className="mockup-stat-icon amber">◎</div>
            <div>
              <span className="eyebrow">Pending approvals</span>
              <strong>{approvals?.value ?? '0'}</strong>
              <p>{approvals?.meta ?? 'Requests waiting'}</p>
            </div>
          </Card>
        </div>

        <Card className="mockup-chart-card" title="Sales overview">
          <div className="mockup-chart-header">
            <strong className="mockup-chart-total">{totalSales}</strong>
            <div className="mockup-chart-legend">
              <span><i className="legend-dot revenue" /> Revenue</span>
              <span><i className="legend-dot target" /> Target</span>
            </div>
          </div>
          <div className="mockup-chart-visual">
            <div className="chart-grid-lines" />
            <div className="mockup-bars-row">
              {salesTrend.map((item) => (
                <div key={item.customerId} className="mockup-bar-group">
                  <div className="mockup-bars">
                    <span className="mockup-bar revenue" style={{ height: `${item.actualHeight}%` }} />
                    <span className="mockup-bar target" style={{ height: `${item.targetHeight}%` }} />
                  </div>
                  <span>{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="dashboard-bottom-row">
          <Card className="mockup-footer-card" title="Debtors & creditors">
            <strong>{debtorValue}</strong>
          </Card>
          <Card className="mockup-footer-card" title="Tasks & reminders">
            <p>{reminder}</p>
          </Card>
        </div>
      </section>

      <section className="dashboard-mockup-side">
        <div className="mockup-side-grid">
          {workspaceTiles.map((tile) => (
            <Link key={tile.path} to={tile.path} className="mockup-launch-tile">
              <span className="mockup-launch-icon">{tile.icon}</span>
              <strong>{tile.label}</strong>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
