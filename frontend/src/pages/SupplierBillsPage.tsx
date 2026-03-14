import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { SupplierBillsPayload } from '../types';

export function SupplierBillsPage() {
  const [data, setData] = useState<SupplierBillsPayload | null>(null);
  useEffect(() => { api.accountingBills().then(setData); }, []);
  return <div className="page-grid">
    <div className="kpi-grid compact-kpi-grid">
      {(data?.kpis ?? []).map((item) => <Card key={item.label} className="metric-card" title={item.label}><strong>{item.value}</strong><p>{item.detail}</p></Card>)}
    </div>
    <Card title="Supplier bills control" subtitle="Accounts payable, match status, and payment-batch readiness in one view.">
      <div className="table-wrap"><table className="data-grid"><thead><tr><th>Bill</th><th>Supplier</th><th>Branch</th><th>Amount</th><th>Due</th><th>Status</th><th>Match</th><th>Recommendation</th></tr></thead><tbody>
      {(data?.bills ?? []).map((item) => <tr key={item.id}><td><strong>{item.id}</strong></td><td>{item.supplier}</td><td>{item.branch}</td><td>{item.amount}</td><td>{item.dueDate}</td><td>{item.status}</td><td>{item.matchStatus}</td><td>{item.recommendation}</td></tr>)}
      </tbody></table></div>
    </Card>
  </div>;
}
