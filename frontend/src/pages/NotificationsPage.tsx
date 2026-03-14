import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { Notification } from '../types';

const fallback: Notification[] = [
  { id: 'n1', title: 'Quote approval required', meta: 'Q-1045 • Sales', state: 'Pending', read: false, type: 'approval' },
  { id: 'n2', title: 'Invoice overdue', meta: 'Acme Retail Group • Finance', state: 'Urgent', read: false, type: 'collection' },
  { id: 'n3', title: 'Low stock threshold reached', meta: 'Thermal Roll Box • Procurement', state: 'Alert', read: false, type: 'stock' }
];

export function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>(fallback);
  useEffect(() => {
    api.notifications().then(setItems).catch(() => setItems(fallback));
  }, []);
  return (
    <Card title="Notifications" subtitle="Priority signals and record-linked follow-up.">
      <div className="notification-stack">
        {items.map((item) => (
          <article key={item.id} className="notification-row">
            <div>
              <strong>{item.title}</strong>
              <p>{item.meta}</p>
            </div>
            <span className="badge warning">{item.state}</span>
          </article>
        ))}
      </div>
    </Card>
  );
}
