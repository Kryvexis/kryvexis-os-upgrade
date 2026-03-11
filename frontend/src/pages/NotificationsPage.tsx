import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import { summarizeNotifications, type ActionNotification } from '../lib/notifications';
import type { Notification } from '../types';

type SnoozeValue = '1 day' | '3 days' | 'next week';

export function NotificationsPage() {
  const [items, setItems] = useState<ActionNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'approval' | 'collection' | 'payment'>('all');

  useEffect(() => {
    api.notifications().then((data: Notification[]) => {
      setItems(summarizeNotifications(data).alerts);
    });
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'unread') return items.filter((item) => !item.read);
    return items.filter((item) => item.category === filter);
  }, [filter, items]);

  const summary = summarizeNotifications(items);

  function updateItem(id: string, updater: (item: ActionNotification) => ActionNotification) {
    setItems((current) => current.map((item) => item.id === id ? updater(item) : item));
  }

  function markAllRead() {
    setItems((current) => current.map((item) => ({ ...item, read: true, state: item.state === 'Pending' ? 'Seen' : item.state })));
  }

  function toggleRead(id: string) {
    updateItem(id, (item) => ({ ...item, read: !item.read }));
  }

  function dismiss(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function snooze(id: string, until: SnoozeValue) {
    updateItem(id, (item) => ({
      ...item,
      read: true,
      state: `Snoozed`,
      meta: `${item.meta} • snoozed until ${until}`
    }));
  }

  return (
    <div className="page-grid">
      <Card
        title="Smart inbox"
        subtitle="Unified notifications, mentions, support signals, and record-linked follow-up."
        actions={
          <div className="toolbar-actions">
            <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}>
              <option value="all">All alerts</option>
              <option value="unread">Unread</option>
              <option value="approval">Approvals</option>
              <option value="collection">Collections</option>
              <option value="payment">Payments</option>
            </select>
            <button className="ghost-button" onClick={markAllRead}>Mark all read</button>
          </div>
        }
      >
        <div className="kpi-grid compact-kpi-grid inbox-summary-grid">
          <div className="soft-panel"><p className="eyebrow">Unread</p><strong>{summary.unread}</strong></div>
          <div className="soft-panel"><p className="eyebrow">Approvals</p><strong>{summary.approvals}</strong></div>
          <div className="soft-panel"><p className="eyebrow">Collections</p><strong>{summary.collections}</strong></div>
          <div className="soft-panel"><p className="eyebrow">Payments</p><strong>{summary.paymentExceptions}</strong></div>
        </div>

        <div className="notification-stack action-notification-stack">
          {filtered.map((item) => (
            <article key={item.id} className={`notification-row notification-card ${item.read ? 'is-read' : ''}`}>
              <div className="notification-main">
                <span className="eyebrow">{item.type}</span>
                <strong>{item.title}</strong>
                <p>{item.meta}</p>
                <div className="notification-actions-row">
                  <Link className="action-link" to={item.recordPath}>{item.actionLabel}</Link>
                  <button className="text-button" onClick={() => toggleRead(item.id)}>{item.read ? 'Mark unread' : 'Mark read'}</button>
                  <button className="text-button" onClick={() => snooze(item.id, 'next week')}>Snooze</button>
                  <button className="text-button danger-text" onClick={() => dismiss(item.id)}>Dismiss</button>
                </div>
              </div>
              <div className="notification-side">
                <Badge value={item.state} />
                <div className="quick-action-group">
                  {item.category === 'approval' && <Link className="ghost-button compact-button" to={item.recordPath}>Approve path</Link>}
                  {item.category === 'collection' && <Link className="ghost-button compact-button" to={item.recordPath}>Reminder controls</Link>}
                  {item.category === 'payment' && <Link className="ghost-button compact-button" to={item.recordPath}>Resolve now</Link>}
                </div>
              </div>
            </article>
          ))}
          {!filtered.length && <div className="loading-state">No alerts match this filter.</div>}
        </div>
      </Card>
    </div>
  );
}
