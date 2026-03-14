import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { AccountingBrain, FinanceExceptionRow } from '../types';

export function FinanceExceptionsPage() {
  const [rows, setRows] = useState<FinanceExceptionRow[]>([]);
  const [brain, setBrain] = useState<AccountingBrain | null>(null);
  useEffect(() => { api.financeExceptions().then(setRows); api.accountingBrain().then(setBrain); }, []);
  return <div className="page-grid"><Card title="Finance exception inbox" subtitle="High-signal operational issues surfaced for immediate action.">
    <div className="table-wrap"><table className="data-grid"><thead><tr><th>Exception</th><th>Branch</th><th>Severity</th><th>Detail</th><th>Action</th></tr></thead><tbody>
      {rows.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><div className="muted-inline">{item.kind}</div></td><td>{item.branch}</td><td>{item.severity}</td><td>{item.detail}</td><td>{item.action}</td></tr>)}
    </tbody></table></div>
  </Card><Card title="Brain guidance" subtitle={brain?.summary || 'The accounting brain highlights the next best moves for finance.'}>
    <div className="table-wrap"><table className="data-grid"><thead><tr><th>Insight</th><th>Impact</th><th>Confidence</th><th>Action</th></tr></thead><tbody>
      {(brain?.focus || []).map((item) => <tr key={item.id}><td><strong>{item.title}</strong><div className="muted-inline">{item.detail}</div></td><td>{item.impact}</td><td>{item.confidence}</td><td>{item.action}</td></tr>)}
    </tbody></table></div>
  </Card></div>;
}
