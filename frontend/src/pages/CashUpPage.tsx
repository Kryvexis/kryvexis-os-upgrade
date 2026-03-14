import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { CashUpRow } from '../types';

export function CashUpPage() {
  const [rows, setRows] = useState<CashUpRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const load = () => api.cashUps().then(setRows);
  useEffect(() => { load(); }, []);
  async function approve(id: string) { setBusy(id); try { await api.approveCashUp(id); await load(); } finally { setBusy(null); } }
  return <Card title="Cash-up engine" subtitle="Variance monitoring and branch close approval.">
    <div className="table-wrap"><table className="data-grid"><thead><tr><th>Branch</th><th>Date</th><th>Expected</th><th>Counted</th><th>Variance</th><th>Status</th><th>Recommendation</th><th>Action</th></tr></thead><tbody>
      {rows.map((item) => <tr key={item.id}><td>{item.branch}</td><td>{item.date}</td><td>{item.expected}</td><td>{item.counted}</td><td>{item.variance}</td><td>{item.status}</td><td>{item.recommendation}</td><td><button className="ghost-button" type="button" onClick={() => approve(item.id)} disabled={busy===item.id || item.status==='Approved'}>{item.status==='Approved' ? 'Approved' : busy===item.id ? 'Approving…' : 'Approve'}</button></td></tr>)}
    </tbody></table></div>
  </Card>;
}
