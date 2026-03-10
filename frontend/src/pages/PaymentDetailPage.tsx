
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { RecordTimeline } from '../components/RecordTimeline';
import { api } from '../lib/api';
import type { Payment } from '../types';
export function PaymentDetailPage() {
  const { id = '' } = useParams();
  const [item, setItem] = useState<Payment | null>(null);
  useEffect(() => { api.payment(id).then(setItem); }, [id]);
  if (!item) return <div className="loading-state">Loading record...</div>;
  return <div className="record-layout"><Card className="record-hero"><div className="record-head"><div><p className="eyebrow">Payment event</p><h2>item.ref</h2></div><Badge value={item.status} /></div><div className="record-meta"><div><span>Party</span><strong>{item.party}</strong></div><div><span>Amount</span><strong>{item.amount}</strong></div><div><span>Method</span><strong>{item.method}</strong></div><div><span>Date</span><strong>{item.date}</strong></div><div><span>Applied to</span><strong>{item.appliedTo}</strong></div></div></Card><div className="split-grid"><Card title="Record context" subtitle="Status, owner, next action, and audit-friendly field visibility."><div className="detail-stack"><div><span>Proof</span><strong>{item.proof}</strong></div><div><span>Next action</span><strong>{item.nextAction}</strong></div></div></Card><Card title="Activity and collaboration" subtitle="Timeline, notes, and the foundation for in-context threads."><RecordTimeline items=[`Method: ${item.method}`, `Proof: ${item.proof}`, `Next action: ${item.nextAction}`] /></Card></div></div>;
}
