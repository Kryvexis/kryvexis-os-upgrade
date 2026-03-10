
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { RecordTimeline } from '../components/RecordTimeline';
import { api } from '../lib/api';
import type { Quote } from '../types';
export function QuoteDetailPage() {
  const { id = '' } = useParams();
  const [item, setItem] = useState<Quote | null>(null);
  useEffect(() => { api.quote(id).then(setItem); }, [id]);
  if (!item) return <div className="loading-state">Loading record...</div>;
  return <div className="record-layout"><Card className="record-hero"><div className="record-head"><div><p className="eyebrow">Quote workflow</p><h2>item.id</h2></div><Badge value={item.status} /></div><div className="record-meta"><div><span>Customer</span><strong>{item.customer}</strong></div><div><span>Owner</span><strong>{item.owner}</strong></div><div><span>Branch</span><strong>{item.branch}</strong></div><div><span>Value</span><strong>{item.value}</strong></div><div><span>Validity</span><strong>{item.validity}</strong></div></div></Card><div className="split-grid"><Card title="Record context" subtitle="Status, owner, next action, and audit-friendly field visibility."><div className="detail-stack"><div><span>Approval trigger</span><strong>{item.trigger}</strong></div><div><span>Updated</span><strong>{item.updated}</strong></div><div><span>Next action</span><strong>{item.nextAction}</strong></div><p>{item.notes}</p></div></Card><Card title="Activity and collaboration" subtitle="Timeline, notes, and the foundation for in-context threads."><RecordTimeline items=[`Owner: ${item.owner}`, `Status: ${item.status}`, `Next: ${item.nextAction}`] /></Card></div></div>;
}
