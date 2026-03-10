import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import { buildOperationalNotifications, type AlertSummary, type EnrichedNotification } from '../lib/notifications';

export function NotificationsPage() {
  const [items, setItems] = useState<EnrichedNotification[]>([]);
  const [summary, setSummary] = useState<AlertSummary | null>(null);

  useEffect(() => {
    Promise.all([api.notifications(), api.quotes(), api.invoices(), api.payments()]).then(
      ([notifications, quotes, invoices, payments]) => {
        const result = buildOperationalNotifications({ notifications, quotes, invoices, payments });
        setItems(result.feed);
        setSummary(result.summary);
      }
    );
  }, []);

  return (
    <div className="page-grid">
      <div className="kpi-grid compact-kpi-grid">
        <Card className="metric-card"><p className="eyebrow">Unread alerts</p><strong>{summary?.unread ?? '—'}</strong><p>Active items across approvals, collections, and finance exceptions.</p></Card>
        <Card className="metric-card"><p className="eyebrow">Approvals</p><strong>{summary?.approvals ?? '—'}</strong><p>Quotes and workflow holds that need a decision.</p></Card>
        <Card className="metric-card"><p className="eyebrow">Collections</p><strong>{summary?.collections ?? '—'}</strong><p>Overdue or allocation-linked debtor actions.</p></Card>
        <Card className="metric-card"><p className="eyebrow">Payment exceptions</p><strong>{summary?.paymentExceptions ?? '—'}</strong><p>Missing proof and unallocated receipt cases.</p></Card>
      </div>

      <Card title="Smart inbox" subtitle="Unified notifications, approvals, support signals, and record-linked follow-up." actions={<button className="ghost-button">Mark all read</button>}>
        <div className="notification-stack">
          {items.map((item) => (
            <article key={item.id} className={`notification-row ${item.read ? 'is-read' : ''}`}>
              <div>
                <span className="eyebrow">{item.type}</span>
                <strong>{item.title}</strong>
                <p>{item.meta}</p>
                <Link className="row-link" to={item.href}>{item.actionLabel}</Link>
              </div>
              <Badge value={item.state} />
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}
