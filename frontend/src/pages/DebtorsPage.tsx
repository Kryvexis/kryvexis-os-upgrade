import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { AccountingOverview, DebtorRow, FinanceExceptionRow } from '../types';

export function DebtorsPage() {
  const [rows, setRows] = useState<DebtorRow[]>([]);
  const [overview, setOverview] = useState<AccountingOverview | null>(null);
  useEffect(() => { api.debtors().then(setRows); api.accountingOverview().then(setOverview); }, []);
  const topActions: FinanceExceptionRow[] = (overview?.priorityActions ?? []).slice(0, 3);
  return <div className="page-grid">
    <div className="kpi-grid compact-kpi-grid">
      {(overview?.kpis ?? []).slice(0,4).map((item) => <Card key={item.label} className="metric-card" title={item.label}><strong>{item.value}</strong><p>{item.detail}</p></Card>)}
    </div>
    <Card title="Debtors engine" subtitle="Collection priority is scored by overdue pressure, balance size, payment friction, and customer risk.">
      <div className="table-wrap"><table className="data-grid"><thead><tr><th>Customer</th><th>Open</th><th>Overdue</th><th>Bucket</th><th>Risk</th><th>Score</th><th>Recommendation</th></tr></thead><tbody>
      {rows.map((item) => <tr key={item.id}><td><strong>{item.customer}</strong><div className="muted-inline">{item.branch}</div></td><td>{item.totalOpen}</td><td>{item.overdueAmount}</td><td>{item.oldestBucket}</td><td>{item.risk}</td><td>{item.score}</td><td>{item.recommendation}</td></tr>)}
      </tbody></table></div>
    </Card>
    <Card title="Collection radar" subtitle="The highest-impact finance actions ranked by urgency.">
      <div className="table-wrap"><table className="data-grid"><thead><tr><th>Signal</th><th>Branch</th><th>Severity</th><th>Detail</th><th>Action</th></tr></thead><tbody>
      {topActions.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><div className="muted-inline">{item.kind}</div></td><td>{item.branch}</td><td>{item.severity}</td><td>{item.detail}</td><td>{item.action}</td></tr>)}
      </tbody></table></div>
    </Card>
  </div>;
}
