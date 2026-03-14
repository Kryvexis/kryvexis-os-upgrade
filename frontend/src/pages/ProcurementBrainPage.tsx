import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { ProcurementOverview } from '../types';

export function ProcurementBrainPage() {
  const [data, setData] = useState<ProcurementOverview | null>(null);
  useEffect(() => { api.procurementOverview().then(setData); }, []);
  return <div className="page-grid">
    <div className="kpi-grid compact-kpi-grid">
      {(data?.kpis ?? []).map((item) => <Card key={item.label} className="metric-card" title={item.label}><strong>{item.value}</strong><p>{item.detail}</p></Card>)}
    </div>
    <Card title="Procurement autopilot" subtitle="The brain ranks what to buy, what to wait on, and what needs supplier follow-up.">
      <div className="record-list">
        {(data?.focus ?? []).map((item) => <article key={item.id} className="record-list-item"><div><strong>{item.title}</strong><p>{item.detail}</p><span className="muted-inline">{item.impact}</span></div><div className="record-list-meta"><span className={`priority-chip ${item.priority}`}>{item.priority}</span><span>{item.actionLabel}</span></div></article>)}
      </div>
    </Card>
  </div>;
}
