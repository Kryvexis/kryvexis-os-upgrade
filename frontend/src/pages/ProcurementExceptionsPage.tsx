import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { ProcurementExceptionRow } from '../types';

export function ProcurementExceptionsPage() {
  const [rows, setRows] = useState<ProcurementExceptionRow[]>([]);
  useEffect(() => { api.procurementExceptions().then(setRows); }, []);
  return <Card title="Procurement exceptions" subtitle="Only abnormal buying conditions surface here so the team can move quickly.">
    <div className="record-list">
      {rows.map((item) => <article key={item.id} className="record-list-item"><div><strong>{item.title}</strong><p>{item.detail}</p><span className="muted-inline">{item.branch}</span></div><div className="record-list-meta"><span className={`priority-chip ${item.severity.toLowerCase()}`}>{item.severity}</span><span>{item.action}</span></div></article>)}
    </div>
  </Card>;
}
