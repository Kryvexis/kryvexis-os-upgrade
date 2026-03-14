import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { DashboardResponse, KPI, RoleKey, TopClient } from '../types';

function moneyText(value: string | undefined, fallback = 'R0') {
  return value || fallback;
}

function getKpi(kpis: KPI[], matcher: RegExp) {
  return kpis.find((item) => matcher.test(item.label));
}

function numericFromMoney(value: string) {
  return Number(value.replace(/[^\d.]/g, '')) || 0;
}

export function DashboardPage({ role }: { role: RoleKey }) {
  const [data, setData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    api.dashboard(role).then(setData).catch(() => setData(null));
  }, [role]);

  const chartRows = useMemo(() => {
    if (!data) return [] as Array<TopClient & { actualPct: number; targetPct: number }>;
    const maxRevenue = Math.max(...data.topClients.map((item) => numericFromMoney(item.revenue)), 1);
    return data.topClients.slice(0, 6).map((item, index) => {
      const actualPct = Math.max(18, Math.round((numericFromMoney(item.revenue) / maxRevenue) * 100));
      const targetPct = Math.max(14, actualPct - 16 + index * 2);
      return { ...item, actualPct, targetPct };
    });
  }, [data]);

  if (!data) {
    return <div className="loading-state">Loading dashboard...</div>;
  }

  const openInvoices = getKpi(data.kpis, /invoice/i);
  const approvals = getKpi(data.kpis, /approval/i);
  const firstSnapshot = data.actionCenter.branchSnapshots[0];
  const debtorsValue = firstSnapshot ? `${firstSnapshot.collections} collections` : `${data.lowStockProducts.length} alerts`;
  const taskValue = data.actionCenter.actionQueue[0]?.title ?? 'No urgent tasks';

  return (
    <div className="mock-dashboard-page">
      <div className="mock-dashboard-grid">
        <section className="mock-dashboard-left">
          <div className="mock-kpi-row">
            <article className="mock-kpi-card">
              <div className="mock-kpi-icon red">◔</div>
              <div>
                <span>Open Invoices</span>
                <strong>{moneyText(openInvoices?.value)}</strong>
                <p>{openInvoices?.detail ?? 'Overdue balance'}</p>
              </div>
            </article>
            <article className="mock-kpi-card">
              <div className="mock-kpi-icon amber">◉</div>
              <div>
                <span>Pending Approvals</span>
                <strong>{approvals?.value ?? '0'}</strong>
                <p>{approvals?.detail ?? 'Requests waiting'}</p>
              </div>
            </article>
          </div>

          <section className="mock-sales-card">
            <div className="mock-sales-head">
              <div>
                <h2>Sales Overview</h2>
                <strong>{moneyText(data.topClients[0]?.revenue, moneyText(openInvoices?.value))}</strong>
              </div>
              <div className="mock-chart-legend">
                <span><i className="actual" /> Revenue</span>
                <span><i className="target" /> Target</span>
              </div>
            </div>

            <div className="mock-sales-chart">
              {chartRows.map((item) => (
                <div key={item.customerId} className="mock-sales-column">
                  <div className="mock-sales-bars">
                    <span className="target-bar" style={{ height: `${item.targetPct}%` }} />
                    <span className="actual-bar" style={{ height: `${item.actualPct}%` }} />
                  </div>
                  <small>{item.name.slice(0, 3)}</small>
                </div>
              ))}
            </div>
          </section>

          <div className="mock-footer-row">
            <article className="mock-footer-card">
              <span>Debtors &amp; Creditors</span>
              <strong>{debtorsValue}</strong>
            </article>
            <article className="mock-footer-card">
              <span>Tasks &amp; Reminders</span>
              <strong>{taskValue}</strong>
            </article>
          </div>
        </section>

        <aside className="mock-dashboard-right">
          <div className="mock-module-grid">
            <Link to="/customers" className="mock-module-tile">
              <span className="mock-module-icon">◌</span>
              <strong>Customers</strong>
            </Link>
            <Link to="/quotes" className="mock-module-tile">
              <span className="mock-module-icon">▤</span>
              <strong>Quotes</strong>
            </Link>
            <Link to="/invoices" className="mock-module-tile">
              <span className="mock-module-icon">▥</span>
              <strong>Invoices</strong>
            </Link>
            <Link to="/payments" className="mock-module-tile">
              <span className="mock-module-icon">◍</span>
              <strong>Payments</strong>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
