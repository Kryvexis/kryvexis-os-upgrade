import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { ReportsResponse, RoleKey } from '../types';

function fallbackReport(): ReportsResponse {
  return {
    scope: 'Johannesburg',
    date: '2026-03-13',
    canViewAllBranches: true,
    visibleBranches: [
      { branchId: 'jhb', branch: 'Johannesburg', date: '2026-03-13', totalSales: 200000, target: 180000, varianceToTarget: 20000, targetAchievedPct: 111, posSales: 84000, invoiceSales: 116000, cashSales: 40000, cardSales: 110000, eftSales: 50000, transactions: 48, averageBasket: 4167 },
      { branchId: 'cpt', branch: 'Cape Town', date: '2026-03-13', totalSales: 150000, target: 160000, varianceToTarget: -10000, targetAchievedPct: 94, posSales: 68000, invoiceSales: 82000, cashSales: 32000, cardSales: 78000, eftSales: 40000, transactions: 37, averageBasket: 4054 }
    ],
    totals: { totalSales: 350000, target: 340000, varianceToTarget: 10000, targetAchievedPct: 103, posSales: 152000, invoiceSales: 198000, cashSales: 72000, cardSales: 188000, eftSales: 90000, transactions: 85 },
    sellerBoard: [{ name: 'Alex Morgan', branch: 'Johannesburg', sales: 84000, target: 90000 }],
    emailPreview: { subject: 'Daily Sales Summary - 2026-03-13', body: 'Johannesburg made R200 000 yesterday.\nCape Town made R150 000 yesterday.\nTotal company sales yesterday: R350 000.' },
    emailDispatches: [],
    dayCloseHistory: [],
    branchCloseHistory: [],
    automation: { triggerMode: 'manual-close', closeTime: '18:00', sendToManagers: true, sendToExecutives: true, managerRecipients: ['manager@kryvexis.local'], executiveRecipients: ['boss@kryvexis.local'], defaultManagerBranch: 'Johannesburg', branchManagers: [{ branch: 'Johannesburg', manager: 'Nadine Smit', email: 'jhb.manager@kryvexis.local' }] },
    closeStatus: { date: '2026-03-13', state: 'closed', label: 'Closed', lastClosedAt: '2026-03-13T18:00:00.000Z', lastClosedBy: 'Antonie Meyer', recordId: 'close-1' },
    sendStatus: { state: 'sent', label: 'Summary sent', lastSentAt: '2026-03-13T18:05:00.000Z', duplicateBlocked: true, lastDispatchId: 'mail-1' },
    auditTrail: []
  };
}

function money(value: number) {
  return `R${value.toLocaleString('en-ZA')}`;
}

export function ReportsPage({ role }: { role: RoleKey }) {
  const [report, setReport] = useState<ReportsResponse>(fallbackReport());
  const canAccess = role === 'manager' || role === 'executive' || role === 'admin';

  useEffect(() => {
    if (!canAccess) return;
    api.reports(role).then(setReport).catch(() => setReport(fallbackReport()));
  }, [role, canAccess]);

  if (!canAccess) return <div className="loading-state">Reports are available only to managers, executives, and admins.</div>;

  return (
    <div className="page-grid mockup-secondary-page">
      <div className="mockup-secondary-kpis">
        <Card className="metric-card" title="Yesterday sales"><strong>{money(report.totals.totalSales)}</strong><p>{report.date}</p></Card>
        <Card className="metric-card" title="Target"><strong>{money(report.totals.target)}</strong><p>{report.totals.targetAchievedPct}% achieved</p></Card>
        <Card className="metric-card" title="Variance"><strong>{money(report.totals.varianceToTarget)}</strong><p>{report.totals.varianceToTarget >= 0 ? 'Above target' : 'Below target'}</p></Card>
      </div>
      <div className="split-grid">
        <Card title="Branch performance" subtitle="Yesterday totals by branch.">
          <div className="notification-stack">
            {report.visibleBranches.map((item) => (
              <div key={item.branchId} className="mini-list-row report-mini-row">
                <div>
                  <strong>{item.branch}</strong>
                  <p>{money(item.totalSales)} against {money(item.target)}</p>
                </div>
                <div className="align-right">
                  <strong>{item.targetAchievedPct}%</strong>
                  <p>{item.transactions} transactions</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Daily summary email preview" subtitle="What management receives after close.">
          <div className="email-preview-box">
            <strong>{report.emailPreview.subject}</strong>
            <pre>{report.emailPreview.body}</pre>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ReportsPage;
