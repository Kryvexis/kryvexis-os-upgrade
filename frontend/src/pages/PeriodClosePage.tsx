import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { PeriodClosePayload } from '../types';

export function PeriodClosePage() {
  const [data, setData] = useState<PeriodClosePayload | null>(null);
  useEffect(() => { api.accountingPeriodClose().then(setData); }, []);
  return <div className="page-grid">
    <div className="kpi-grid compact-kpi-grid">
      <Card className="metric-card" title="Close readiness"><strong>{data?.readiness || '—'}</strong><p>{data?.status || 'Loading period-close status'}</p></Card>
      <Card className="metric-card" title="Blocked items"><strong>{String((data?.checklist ?? []).filter((item) => item.status === 'Blocked').length)}</strong><p>Issues that must be resolved before close.</p></Card>
      <Card className="metric-card" title="In progress"><strong>{String((data?.checklist ?? []).filter((item) => item.status === 'In progress').length)}</strong><p>Tasks already moving through finance and operations.</p></Card>
    </div>
    <Card title="Period close control" subtitle="Month-end should feel like a guided checklist, not a maze of accounting menus.">
      <div className="table-wrap"><table className="data-grid"><thead><tr><th>Task</th><th>Status</th><th>Owner</th><th>Detail</th></tr></thead><tbody>
      {(data?.checklist ?? []).map((item) => <tr key={item.id}><td><strong>{item.label}</strong></td><td>{item.status}</td><td>{item.owner}</td><td>{item.detail}</td></tr>)}
      </tbody></table></div>
    </Card>
  </div>;
}
