
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { RecordTimeline } from '../components/RecordTimeline';
import { api } from '../lib/api';
import type { Invoice } from '../types';
export function InvoiceDetailPage() {
  const { id = '' } = useParams();
  const [item, setItem] = useState<Invoice | null>(null);
  useEffect(() => { api.invoice(id).then(setItem); }, [id]);
  if (!item) return <div className="loading-state">Loading record...</div>;
  return <div className="record-layout"><Card className="record-hero"><div className="record-head"><div><p className="eyebrow">Invoice control</p><h2>item.id</h2></div><Badge value={item.status} /></div><div className="record-meta"><div><span>Customer</span><strong>{item.customer}</strong></div><div><span>Amount</span><strong>{item.amount}</strong></div><div><span>Branch</span><strong>{item.branch}</strong></div><div><span>Due</span><strong>{item.due}</strong></div><div><span>Source</span><strong>{item.source}</strong></div></div></Card><div className="split-grid"><Card title="Record context" subtitle="Status, owner, next action, and audit-friendly field visibility."><div className="detail-stack"><div><span>Payment state</span><strong>{item.paymentStatus}</strong></div><div><span>Tax</span><strong>{item.tax}</strong></div><div><span>Reminders</span><strong>{item.reminders}</strong></div><div><span>Next action</span><strong>{item.nextAction}</strong></div></div></Card><Card title="Activity and collaboration" subtitle="Timeline, notes, and the foundation for in-context threads."><RecordTimeline items=[`Reminder status: ${item.reminders}`, `Payment status: ${item.paymentStatus}`, `Next action: ${item.nextAction}`] /></Card></div></div>;
}
