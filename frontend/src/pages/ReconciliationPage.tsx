import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { ReconciliationPayload } from '../types';

export function ReconciliationPage() {
  const [data, setData] = useState<ReconciliationPayload | null>(null);
  useEffect(() => { api.accountingReconciliation().then(setData); }, []);
  return <div className="page-grid">
    <div className="kpi-grid compact-kpi-grid">
      {(data?.bankAccounts ?? []).map((item) => <Card key={item.id} className="metric-card" title={item.name}><strong>{item.balance}</strong><p>{item.unreconciled} unreconciled • {item.suggestedMatches} suggested matches</p></Card>)}
    </div>
    <Card title="Bank reconciliation" subtitle="Unmatched money movements are surfaced as simple decisions instead of finance noise.">
      <div className="table-wrap"><table className="data-grid"><thead><tr><th>Item</th><th>Account</th><th>Date</th><th>Amount</th><th>Status</th><th>Recommendation</th></tr></thead><tbody>
      {(data?.items ?? []).map((item) => <tr key={item.id}><td><strong>{item.description}</strong><div className="muted-inline">{item.id}</div></td><td>{item.account}</td><td>{item.date}</td><td>{item.amount}</td><td>{item.status}</td><td>{item.recommendation}</td></tr>)}
      </tbody></table></div>
    </Card>
  </div>;
}
