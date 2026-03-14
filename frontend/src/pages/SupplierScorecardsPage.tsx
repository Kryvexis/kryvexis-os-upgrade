import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { SupplierInsightRow } from '../types';

export function SupplierScorecardsPage() {
  const [rows, setRows] = useState<SupplierInsightRow[]>([]);
  useEffect(() => { api.procurementSuppliers().then(setRows); }, []);
  return <Card title="Supplier scorecards" subtitle="Reliability blends status, lead time, and current exception pressure.">
    <div className="table-wrap"><table className="data-grid"><thead><tr><th>Supplier</th><th>Category</th><th>Lead time</th><th>Status</th><th>Reliability</th><th>Score</th><th>Recommendation</th></tr></thead><tbody>
      {rows.map((item) => <tr key={item.id}><td><strong>{item.supplier}</strong></td><td>{item.category}</td><td>{item.leadTime}</td><td>{item.status}</td><td>{item.reliability}</td><td>{item.score}</td><td>{item.recommendation}</td></tr>)}
    </tbody></table></div>
  </Card>;
}
