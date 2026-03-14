import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { ReorderCandidateRow } from '../types';

export function ReordersPage() {
  const [rows, setRows] = useState<ReorderCandidateRow[]>([]);
  useEffect(() => { api.procurementReorders().then(setRows); }, []);
  return <Card title="Reorder candidates" subtitle="Urgency is driven by stock deficit, live threshold pressure, and supplier timing.">
    <div className="table-wrap"><table className="data-grid"><thead><tr><th>Product</th><th>Branch</th><th>Stock</th><th>Reorder at</th><th>Deficit</th><th>Urgency</th><th>Score</th><th>Recommendation</th></tr></thead><tbody>
      {rows.map((item) => <tr key={item.id}><td><strong>{item.product}</strong><div className="muted-inline">{item.supplier}</div></td><td>{item.branch}</td><td>{item.stock}</td><td>{item.reorderAt}</td><td>{item.deficit}</td><td>{item.urgency}</td><td>{item.score}</td><td>{item.recommendation}</td></tr>)}
    </tbody></table></div>
  </Card>;
}
