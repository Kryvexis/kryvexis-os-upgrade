import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import { summarizeNotifications, type ActionNotification } from '../lib/notifications';
import type { Notification } from '../types';

type SnoozeValue = '1 day' | '3 days' | 'next week';
type FilterValue = 'all' | 'unread' | 'approval' | 'collection' | 'payment';

export function NotificationsPage() {
  const [items, setItems] = useState<ActionNotification[]>([]);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    api.notifications().then((data: Notification[]) => {
      setItems(summarizeNotifications(data).alerts);
    }).catch((err) => setError(err.message || 'Failed to load inbox'));
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'unread') return items.filter((item) => !item.read);
    return items.filter((item) => item.category === filter);
  }, [filter, items]);

  const summary = summarizeNotifications(items);

  async function refresh() {
    const data = await api.notifications();
    setItems(summarizeNotifications(data).alerts);
  }

  async function runAction(id: string, action: () => Promise<unknown>) {
    try {
      setBusyId(id);
      setError('');
      await action();
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Action failed';
      setError(message);
    } finally {
      setBusyId(null);
    }
  }

  async function markAllRead() {
    const unread = items.filter((item) => !item.read);
    for (const item of unread) {
      await api.markNotificationRead(item.id, true);
    }
    await refresh();
  }

  function toggleRead(item: ActionNotification) {
    return runAction(item.id, () => api.markNotificationRead(item.id, !item.read));
  }

  function dismiss(item: ActionNotification) {
    return runAction(item.id, () => api.dismissNotification(item.id));
  }

  function snooze(item: ActionNotification, until: SnoozeValue) {
    return runAction(item.id, () => api.snoozeNotification(item.id, until));
  }

  function executeDomainAction(item: ActionNotification) {
    if (item.category === 'approval') {
      const match = item.recordPath.match(/\/quotes\/(Q-\d+)/i);
      if (!match) return;
      return runAction(item.id, async () => {
        await api.approveQuote(match[1]);
        await api.markNotificationRead(item.id, true);
      });
    }

    if (item.category === 'collection') {
      const match = item.recordPath.match(/\/invoices\/(INV-\d+)/i);
      if (!match) return;
      return runAction(item.id, async () => {
        await api.sendInvoiceReminder(match[1]);
        await api.markNotificationRead(item.id, true);
      });
    }

    if (item.category === 'payment') {
      const match = item.recordPath.match(/\/payments\/(PAY-\d+)/i);
      if (!match) return;
      const needsProof = /proof/i.test(`${item.title} ${item.meta}`);
      return runAction(item.id, async () => {
        if (needsProof) {
          await api.resolvePaymentProof(match[1]);
        } else {
          await api.allocatePayment(match[1]);
        }
        await api.markNotificationRead(item.id, true);
      });
    }
  }

  return (
    <div className="page-grid">
      <Card
        title="Smart inbox"
        subtitle="Unified notifications, mentions, support signals, and record-linked follow-up."
        actions={
          <div className="toolbar-actions">
            <select value={filter} onChange={(event) => setFilter(event.target.value as FilterValue)}>
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
        {error ? <div className="loading-state">{error}</div> : null}

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
                <span className="eyebrow">{item.category}</span>
                <strong>{item.title}</strong>
                <p>{item.meta}</p>
                <div className="notification-actions-row">
                  <Link className="action-link" to={item.recordPath}>{item.actionLabel}</Link>
                  <button className="text-button" onClick={() => toggleRead(item)} disabled={busyId === item.id}>
                    {item.read ? 'Mark unread' : 'Mark read'}
                  </button>
                  <button className="text-button" onClick={() => snooze(item, '1 day')} disabled={busyId === item.id}>Snooze 1 day</button>
                  <button className="text-button danger-text" onClick={() => dismiss(item)} disabled={busyId === item.id}>Dismiss</button>
                </div>
              </div>
              <div className="notification-side">
                <Badge value={busyId === item.id ? 'Working...' : item.state} />
                <div className="quick-action-group">
                  {item.category === 'approval' && <button className="ghost-button compact-button" onClick={() => executeDomainAction(item)} disabled={busyId === item.id}>Approve quote</button>}
                  {item.category === 'collection' && <button className="ghost-button compact-button" onClick={() => executeDomainAction(item)} disabled={busyId === item.id}>Send reminder</button>}
                  {item.category === 'payment' && <button className="ghost-button compact-button" onClick={() => executeDomainAction(item)} disabled={busyId === item.id}>{/proof/i.test(`${item.title} ${item.meta}`) ? 'Resolve proof' : 'Allocate payment'}</button>}
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
