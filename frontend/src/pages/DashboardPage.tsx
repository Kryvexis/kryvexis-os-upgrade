import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { DashboardResponse, KPI, Notification, RoleKey, TopClient } from '../types';

function revenueNumber(value: string) {
  return Number(value.replace(/[^\d.]/g, '')) || 0;
}

function fallbackDashboard(role: RoleKey): DashboardResponse {
  return {
    role,
    kpis: [
      { label: 'Open Invoices', value: 'R45,230', detail: 'Overdue' },
      { label: 'Pending Approvals', value: '6', detail: 'Requests' },
      { label: 'Debtors & Creditors', value: 'R32,450', detail: 'Open invoices' },
      { label: 'Tasks & Reminders', value: '4', detail: 'Today' }
    ],
    panels: [],
    highlights: [
      { id: 'n1', title: 'Quote approval required', meta: 'Alex mentioned priority, 1 item here', state: 'Pending', read: false, type: 'approval' }
    ] as Notification[],
    recentCustomers: [],
    lowStockProducts: [],
    topClients: [
      { customerId: 'c1', name: 'Nov', revenue: 'R28,000', invoices: 1, averageOrderValue: 'R18,000', overdueBalance: 'R0', trend: 'R12,000' },
      { customerId: 'c2', name: 'Dec', revenue: 'R35,000', invoices: 1, averageOrderValue: 'R22,000', overdueBalance: 'R0', trend: 'R17,000' },
      { customerId: 'c3', name: 'Jan', revenue: 'R31,000', invoices: 1, averageOrderValue: 'R15,000', overdueBalance: 'R0', trend: 'R14,000' },
      { customerId: 'c4', name: 'Feb', revenue: 'R42,000', invoices: 1, averageOrderValue: 'R20,000', overdueBalance: 'R0', trend: 'R18,000' },
      { customerId: 'c5', name: 'Mar', revenue: 'R58,000', invoices: 1, averageOrderValue: 'R31,000', overdueBalance: 'R0', trend: 'R21,000' },
      { customerId: 'c6', name: 'May', revenue: 'R56,000', invoices: 1, averageOrderValue: 'R25,000', overdueBalance: 'R0', trend: 'R25,000' },
      { customerId: 'c7', name: 'Jun', revenue: 'R71,000', invoices: 1, averageOrderValue: 'R29,000', overdueBalance: 'R0', trend: 'R33,000' }
    ],
    actionCenter: {
      branchSnapshots: [{ branch: 'Johannesburg', approvals: 6, collections: 3, exceptions: 4 }],
      actionQueue: [],
      auditHighlights: []
    }
  };
}

const salesTiles = [
  { label: 'Customers', to: '/customers', icon: '👥' },
  { label: 'Quotes', to: '/quotes', icon: '🧾' },
  { label: 'Invoices', to: '/invoices', icon: '📄' },
  { label: 'Payments', to: '/payments', icon: '💳' }
] as const;

export function DashboardPage({ role }: { role: RoleKey }) {
  const [data, setData] = useState<DashboardResponse>(fallbackDashboard(role));

  useEffect(() => {
    let active = true;
    api.dashboard(role).then((result) => {
      if (active) setData(result);
    }).catch(() => {
      if (active) setData(fallbackDashboard(role));
    });
    return () => {
      active = false;
    };
  }, [role]);

  const openInvoices = data.kpis.find((item) => /invoice/i.test(item.label)) ?? data.kpis[0] ?? { label: 'Open Invoices', value: 'R0', detail: 'Overdue' };
  const approvals = data.kpis.find((item) => /approval/i.test(item.label)) ?? data.kpis[1] ?? { label: 'Pending Approvals', value: '0', detail: 'Requests' };
  const debtors = data.kpis.find((item) => /debtor|creditor/i.test(item.label)) ?? { label: 'Debtors & Creditors', value: 'R32,450', detail: 'Open invoices' };
  const reminders = data.kpis.find((item) => /task|reminder/i.test(item.label)) ?? { label: 'Tasks & Reminders', value: '4', detail: 'Today' };
  const chartSource = data.topClients.length ? data.topClients : fallbackDashboard(role).topClients;
  const maxActual = Math.max(...chartSource.map((item) => revenueNumber(item.revenue)), 1);
  const maxTarget = Math.max(...chartSource.map((item) => revenueNumber(item.trend)), 1);
  const salesHeadline = chartSource.reduce((sum, item) => sum + revenueNumber(item.revenue), 0);
  const note = data.highlights[0]?.meta ?? 'Alex mentioned priority, 1 item here';

  function formatMoneyFromNumber(value: number) {
    return `R${value.toLocaleString('en-ZA')}`;
  }

  return (
    <div className="mockup-dashboard">
      <div className="mockup-kpi-row">
        <article className="mockup-kpi-card danger">
          <div className="mockup-kpi-icon">◉</div>
          <div>
            <span>{openInvoices.label}</span>
            <strong>{openInvoices.value}</strong>
            <p>{openInvoices.detail}</p>
          </div>
        </article>
        <article className="mockup-kpi-card warning">
          <div className="mockup-kpi-icon">◉</div>
          <div>
            <span>{approvals.label}</span>
            <strong>{approvals.value}</strong>
            <p>{approvals.detail}</p>
          </div>
        </article>
      </div>

      <div className="mockup-dashboard-grid">
        <section className="mockup-sales-panel">
          <div className="mockup-card-head">
            <div>
              <h3>Sales Overview</h3>
              <strong>{formatMoneyFromNumber(salesHeadline)}</strong>
            </div>
            <div className="mockup-legend">
              <span>Revenue</span>
              <span>Target</span>
            </div>
          </div>

          <div className="mockup-chart-area">
            {chartSource.map((item) => {
              const actual = Math.max(18, Math.round((revenueNumber(item.revenue) / maxActual) * 100));
              const target = Math.max(18, Math.round((revenueNumber(item.trend) / maxTarget) * 100));
              return (
                <div key={item.customerId} className="mockup-chart-group">
                  <div className="mockup-bars">
                    <span className="mockup-bar actual" style={{ height: `${actual}%` }} />
                    <span className="mockup-bar target" style={{ height: `${target}%` }} />
                  </div>
                  <small>{item.name}</small>
                </div>
              );
            })}
          </div>

          <div className="mockup-bottom-row">
            <article className="mockup-mini-card">
              <span>Debtors &amp; Creditors</span>
              <strong>{debtors.value}</strong>
              <p>{debtors.detail}</p>
            </article>
            <article className="mockup-mini-card">
              <span>Tasks &amp; Reminders</span>
              <strong>{reminders.value}</strong>
              <p>{note}</p>
            </article>
          </div>
        </section>

        <aside className="mockup-launcher-panel">
          {salesTiles.map((tile) => (
            <Link key={tile.to} to={tile.to} className="mockup-launcher-tile">
              <span className="mockup-launcher-icon">{tile.icon}</span>
              <strong>{tile.label}</strong>
            </Link>
          ))}
        </aside>
      </div>
    </div>
  );
}
