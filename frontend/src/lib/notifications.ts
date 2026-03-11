import type { Notification } from '../types';

export type ActionNotification = Notification & {
  recordPath: string;
  actionLabel: string;
  category: 'approval' | 'collection' | 'payment' | 'general';
};

function extractRecordId(value: string): string | null {
  const match = value.match(/(Q-\d+|INV-\d+|PAY-\d+)/i);
  return match ? match[1].toUpperCase() : null;
}

function buildRecordPath(item: Notification): string {
  const source = `${item.title} ${item.meta}`;
  const id = extractRecordId(source);
  if (!id) return '/notifications';
  if (id.startsWith('Q-')) return `/quotes/${id}`;
  if (id.startsWith('INV-')) return `/invoices/${id}`;
  if (id.startsWith('PAY-')) return `/payments/${id}`;
  return '/notifications';
}

function inferActionLabel(item: Notification): string {
  const source = `${item.title} ${item.meta}`.toLowerCase();
  if (source.includes('approval') || item.type === 'approval') return 'Review record';
  if (source.includes('overdue') || item.type === 'collection') return 'Collect now';
  if (source.includes('proof')) return 'Resolve proof';
  if (source.includes('unallocated') || source.includes('allocate')) return 'Allocate payment';
  return 'Open record';
}

function inferCategory(item: Notification): ActionNotification['category'] {
  const source = `${item.title} ${item.meta}`.toLowerCase();
  if (source.includes('approval') || item.type === 'approval') return 'approval';
  if (source.includes('overdue') || item.type === 'collection') return 'collection';
  if (source.includes('proof') || source.includes('payment') || item.type === 'payment') return 'payment';
  return 'general';
}

export function toActionNotification(item: Notification): ActionNotification {
  return {
    ...item,
    recordPath: buildRecordPath(item),
    actionLabel: inferActionLabel(item),
    category: inferCategory(item)
  };
}

export function summarizeNotifications(items: Notification[]) {
  const alerts = items.map(toActionNotification);
  return {
    alerts,
    unread: alerts.filter((item) => !item.read).length,
    approvals: alerts.filter((item) => item.category === 'approval').length,
    collections: alerts.filter((item) => item.category === 'collection').length,
    paymentExceptions: alerts.filter((item) => item.category === 'payment').length
  };
}
