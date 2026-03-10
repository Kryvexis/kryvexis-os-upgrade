
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { RecordTimeline } from '../components/RecordTimeline';
import { api } from '../lib/api';
import type { Customer } from '../types';
export function CustomerDetailPage() {
  const { id = '' } = useParams();
  const [item, setItem] = useState<Customer | null>(null);
  useEffect(() => { api.customer(id).then(setItem); }, [id]);
  if (!item) return <div className="loading-state">Loading record...</div>;
  return <div className="record-layout"><Card className="record-hero"><div className="record-head"><div><p className="eyebrow">Customer record</p><h2>{item.name}</h2></div><Badge value={item.status} /></div><div className="record-meta"><div><span>Customer ID</span><strong>{item.id}</strong></div><div><span>Owner</span><strong>{item.owner}</strong></div><div><span>Branch</span><strong>{item.branch}</strong></div><div><span>Balance</span><strong>{item.balance}</strong></div><div><span>Risk</span><strong>{item.risk}</strong></div></div></Card><div className="split-grid"><Card title="Record context" subtitle="Status, owner, next action, and audit-friendly field visibility."><div className="detail-stack"><div><span>Contact</span><strong>{item.contact}</strong></div><div><span>Phone</span><strong>{item.phone}</strong></div><div><span>Credit terms</span><strong>{item.creditTerms}</strong></div><div><span>Price list</span><strong>{item.priceList}</strong></div><div><span>Next action</span><strong>{item.nextAction}</strong></div><p>{item.notes}</p></div></Card><Card title="Activity and collaboration" subtitle="Timeline, notes, and the foundation for in-context threads."><RecordTimeline items={item.activity} /></Card></div></div>;
}
