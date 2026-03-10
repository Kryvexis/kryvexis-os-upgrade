import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { api } from '../lib/api';
import type { Notification } from '../types';
export function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  useEffect(() => { api.notifications().then(setItems); }, []);
  return <Card title="Smart inbox" subtitle="Unified notifications, mentions, support signals, and record-linked follow-up." actions={<button className="ghost-button">Mark all read</button>}><div className="notification-stack">{items.map((item) => <article key={item.id} className={`notification-row ${item.read ? 'is-read' : ''}`}><div><span className="eyebrow">{item.type}</span><strong>{item.title}</strong><p>{item.meta}</p></div><Badge value={item.state} /></article>)}</div></Card>;
}
