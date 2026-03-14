import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { ProcurementPoRow } from '../types';

export function PurchaseOrderRecommendationsPage() {
  const [rows, setRows] = useState<ProcurementPoRow[]>([]);
  useEffect(() => { api.procurementPurchaseOrders().then(setRows); }, []);
  return <Card title="Purchase order recommendations" subtitle="The engine highlights what to approve, chase, or hold based on ETA and downstream finance readiness.">
    <div className="table-wrap"><table className="data-grid"><thead><tr><th>PO</th><th>Supplier</th><th>Branch</th><th>Status</th><th>ETA</th><th>Buyer</th><th>Score</th><th>Recommendation</th></tr></thead><tbody>
      {rows.map((item) => <tr key={item.id}><td><strong>{item.id}</strong><div className="muted-inline">{item.value}</div></td><td>{item.supplier}</td><td>{item.branch}</td><td>{item.status}</td><td>{item.eta}</td><td>{item.buyer}</td><td>{item.score}</td><td>{item.recommendation}</td></tr>)}
    </tbody></table></div>
  </Card>;
}
