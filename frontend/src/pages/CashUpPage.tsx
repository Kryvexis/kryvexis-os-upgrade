import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { AccountingOverview, CashUpRow } from '../types';

export function CashUpPage() {
  const [rows, setRows] = useState<CashUpRow[]>([]);
  const [overview, setOverview] = useState<AccountingOverview | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const load = () => api.cashUps().then(setRows);
  useEffect(() => { load(); api.accountingOverview().then(setOverview); }, []);
  async function approve(id: string) { setBusy(id); try { await api.approveCashUp(id); await load(); } finally { setBusy(null); } }
  return <div className="page-grid"><Card title="Cash-up engine" subtitle="Variance monitoring, anomaly scoring, and branch close approval.">
    <div className="table-wrap"><table className="data-grid"><thead><tr><th>Branch</th><th>Date</th><th>Expected</th><th>Counted</th><th>Variance</th><th>Status</th><th>Recommendation</th><th>Action</th></tr></thead><tbody>
      {rows.map((item) => <tr key={item.id}><td>{item.branch}</td><td>{item.date}</td><td>{item.expected}</td><td>{item.counted}</td><td>{item.variance}</td><td>{item.status}</td><td>{item.recommendation}</td><td><button className="ghost-button" type="button" onClick={() => approve(item.id)} disabled={busy===item.id || item.status==='Approved'}>{item.status==='Approved' ? 'Approved' : busy===item.id ? 'Approving…' : 'Approve'}</button></td></tr>)}
    </tbody></table></div>
  </Card><Card title="Close-risk queue" subtitle="Exceptions likely to block close or trigger finance review.">
    <div className="table-wrap"><table className="data-grid"><thead><tr><th>Exception</th><th>Branch</th><th>Severity</th><th>Detail</th><th>Action</th></tr></thead><tbody>
      {(overview?.priorityActions || []).filter((item) => /cash|proof|allocation/i.test(`${item.title} ${item.detail}`)).map((item) => <tr key={item.id}><td><strong>{item.title}</strong><div className="muted-inline">{item.kind}</div></td><td>{item.branch}</td><td>{item.severity}</td><td>{item.detail}</td><td>{item.action}</td></tr>)}
    </tbody></table></div>
  </Card></div>;
}
