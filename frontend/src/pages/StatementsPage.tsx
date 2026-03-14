import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { AccountingBrain, StatementRow } from '../types';

export function StatementsPage() {
  const [rows, setRows] = useState<StatementRow[]>([]);
  const [brain, setBrain] = useState<AccountingBrain | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const load = () => api.statements().then(setRows);
  useEffect(() => { load(); api.accountingBrain().then(setBrain); }, []);
  async function send(customerId: string) { setBusy(customerId); try { await api.sendStatement(customerId); await load(); } finally { setBusy(null); } }
  return <div className="page-grid"><Card title="Statements engine" subtitle="Issue and track debtor statements from one queue.">
    <div className="table-wrap"><table className="data-grid"><thead><tr><th>Customer</th><th>Balance</th><th>Overdue invoices</th><th>Last issued</th><th>Status</th><th>Action</th></tr></thead><tbody>
      {rows.map((item) => <tr key={item.id}><td><strong>{item.customer}</strong><div className="muted-inline">{item.branch}</div></td><td>{item.balance}</td><td>{item.overdueInvoices}</td><td>{item.lastIssued}</td><td>{item.status}</td><td><button className="ghost-button" type="button" onClick={() => send(item.customerId)} disabled={busy===item.customerId}>{busy===item.customerId ? 'Sending…' : 'Send statement'}</button></td></tr>)}
    </tbody></table></div>
  </Card><Card title="Statement intelligence" subtitle="Recommended statement cadence based on balance pressure and overdue exposure.">
    <div className="table-wrap"><table className="data-grid"><thead><tr><th>Priority insight</th><th>Impact</th><th>Confidence</th><th>Action</th></tr></thead><tbody>
      {(brain?.focus || []).map((item) => <tr key={item.id}><td><strong>{item.title}</strong><div className="muted-inline">{item.detail}</div></td><td>{item.impact}</td><td>{item.confidence}</td><td>{item.action}</td></tr>)}
    </tbody></table></div>
  </Card></div>;
}
