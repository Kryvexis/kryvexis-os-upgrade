import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { VatPayload } from '../types';

export function VatControlPage() {
  const [data, setData] = useState<VatPayload | null>(null);
  useEffect(() => { api.accountingVat().then(setData); }, []);
  return <div className="page-grid">
    <div className="kpi-grid compact-kpi-grid">
      <Card className="metric-card" title="VAT period"><strong>{data?.period || '—'}</strong><p>{data?.status || 'Loading VAT status'}</p></Card>
      <Card className="metric-card" title="Output VAT"><strong>{data?.outputVat || '—'}</strong><p>Sales tax recognized from issued revenue.</p></Card>
      <Card className="metric-card" title="Input VAT"><strong>{data?.inputVat || '—'}</strong><p>Recoverable VAT from approved costs.</p></Card>
      <Card className="metric-card" title="Net payable"><strong>{data?.payable || '—'}</strong><p>Current return position before submission.</p></Card>
    </div>
    <Card title="VAT control" subtitle="Tax stays understandable because the system explains what is driving the payable position.">
      <div className="table-wrap"><table className="data-grid"><thead><tr><th>Bucket</th><th>Value</th><th>Detail</th></tr></thead><tbody>
      {(data?.items ?? []).map((item) => <tr key={item.id}><td><strong>{item.label}</strong></td><td>{item.value}</td><td>{item.detail}</td></tr>)}
      </tbody></table></div>
    </Card>
  </div>;
}
