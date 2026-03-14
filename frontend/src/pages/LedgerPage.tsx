import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { LedgerPayload } from '../types';

export function LedgerPage() {
  const [data, setData] = useState<LedgerPayload | null>(null);
  useEffect(() => { api.accountingLedger().then(setData); }, []);
  return <div className="page-grid">
    <div className="kpi-grid compact-kpi-grid">
      {(data?.summary ?? []).map((item) => <Card key={item.label} className="metric-card" title={item.label}><strong>{item.value}</strong><p>{item.detail}</p></Card>)}
    </div>
    <Card title="Ledger control" subtitle="A calm finance surface on top of a proper accounting backbone.">
      <div className="table-wrap"><table className="data-grid"><thead><tr><th>Code</th><th>Account</th><th>Type</th><th>Balance</th><th>Status</th><th>Movement</th></tr></thead><tbody>
      {(data?.accounts ?? []).map((item) => <tr key={item.code}><td><strong>{item.code}</strong></td><td>{item.name}</td><td>{item.type}</td><td>{item.balance}</td><td>{item.status}</td><td>{item.movement}</td></tr>)}
      </tbody></table></div>
    </Card>
    <Card title="Journal feed" subtitle="Recent posting activity and entries waiting for finance approval.">
      <div className="table-wrap"><table className="data-grid"><thead><tr><th>Journal</th><th>Date</th><th>Source</th><th>Reference</th><th>Status</th><th>Total</th><th>Summary</th></tr></thead><tbody>
      {(data?.journals ?? []).map((item) => <tr key={item.id}><td><strong>{item.id}</strong></td><td>{item.date}</td><td>{item.source}</td><td>{item.reference}</td><td>{item.status}</td><td>{item.total}</td><td>{item.summary}</td></tr>)}
      </tbody></table></div>
    </Card>
  </div>;
}
