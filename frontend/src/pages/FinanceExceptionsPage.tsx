import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { FinanceExceptionRow } from '../types';

export function FinanceExceptionsPage() {
  const [rows, setRows] = useState<FinanceExceptionRow[]>([]);
  useEffect(() => { api.financeExceptions().then(setRows); }, []);
  return <Card title="Finance exception inbox" subtitle="High-signal operational issues surfaced for immediate action.">
    <div className="table-wrap"><table className="data-grid"><thead><tr><th>Exception</th><th>Branch</th><th>Severity</th><th>Detail</th><th>Action</th></tr></thead><tbody>
      {rows.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><div className="muted-inline">{item.kind}</div></td><td>{item.branch}</td><td>{item.severity}</td><td>{item.detail}</td><td>{item.action}</td></tr>)}
    </tbody></table></div>
  </Card>;
}
