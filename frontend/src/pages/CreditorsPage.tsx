import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { CreditorRow } from '../types';

export function CreditorsPage() {
  const [rows, setRows] = useState<CreditorRow[]>([]);
  useEffect(() => { api.creditors().then(setRows); }, []);
  return <Card title="Creditors" subtitle="Supplier exposure, due windows, and pay priority guidance.">
    <div className="table-wrap"><table className="data-grid"><thead><tr><th>Supplier</th><th>Outstanding</th><th>Due window</th><th>Status</th><th>Recommendation</th></tr></thead><tbody>
      {rows.map((item) => <tr key={item.id}><td><strong>{item.supplier}</strong><div className="muted-inline">{item.branch}</div></td><td>{item.outstanding}</td><td>{item.dueWindow}</td><td>{item.status}</td><td>{item.recommendation}</td></tr>)}
    </tbody></table></div>
  </Card>;
}
