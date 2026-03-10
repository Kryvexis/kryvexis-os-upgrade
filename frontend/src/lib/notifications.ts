import type { Invoice, Notification, Payment, Quote } from '../types';

export type AlertSummary = {
  unread: number;
  approvals: number;
  collections: number;
  paymentExceptions: number;
};

export type EnrichedNotification = Notification & {
  href: string;
  actionLabel: string;
  sourceRef: string;
};

function inferHref(sourceRef: string, type: string) {
  if (type === 'approval' || sourceRef.startsWith('Q-')) return `/quotes/${sourceRef}`;
  if (type === 'collection' || sourceRef.startsWith('INV-')) return `/invoices/${sourceRef}`;
  if (type === 'payment' || sourceRef.startsWith('PAY-')) return `/payments/${sourceRef}`;
  return '/inbox';
}

function sourceFromMeta(meta: string) {
  const match = meta.match(/(Q-\d+|INV-\d+|PAY-\d+)/);
  return match ? match[1] : 'INBOX';
}

function toBaseNotification(item: Notification): EnrichedNotification {
  const sourceRef = sourceFromMeta(item.meta);
  return {
    ...item,
    href: inferHref(sourceRef, item.type),
    actionLabel:
      item.type === 'approval'
        ? 'Review record'
        : item.type === 'collection'
          ? 'Open invoice'
          : item.type === 'payment'
            ? 'Resolve payment'
            : 'Open inbox',
    sourceRef,
  };
}

function quoteAlerts(quotes: Quote[]): EnrichedNotification[] {
  return quotes.flatMap((quote) => {
    const alerts: EnrichedNotification[] = [];

    if (quote.status === 'Pending approval') {
      alerts.push({
        id: `AUTO-${quote.id}-approval`,
        title: `Approval needed for ${quote.id}`,
        meta: `${quote.customer} • ${quote.owner} • ${quote.nextAction}`,
        state: 'Pending',
        read: false,
        type: 'approval',
        href: `/quotes/${quote.id}`,
        actionLabel: 'Review quote',
        sourceRef: quote.id,
      });
    }

    if (quote.status === 'Sent to customer') {
      alerts.push({
        id: `AUTO-${quote.id}-followup`,
        title: `Follow up on ${quote.id}`,
        meta: `${quote.customer} • Watch customer response window`,
        state: 'Action',
        read: false,
        type: 'sales',
        href: `/quotes/${quote.id}`,
        actionLabel: 'Open quote',
        sourceRef: quote.id,
      });
    }

    return alerts;
  });
}

function invoiceAlerts(invoices: Invoice[]): EnrichedNotification[] {
  return invoices.flatMap((invoice) => {
    const alerts: EnrichedNotification[] = [];

    if (invoice.status === 'Overdue') {
      alerts.push({
        id: `AUTO-${invoice.id}-overdue`,
        title: `${invoice.id} is overdue`,
        meta: `${invoice.customer} • ${invoice.nextAction}`,
        state: 'Urgent',
        read: false,
        type: 'collection',
        href: `/invoices/${invoice.id}`,
        actionLabel: 'Collect now',
        sourceRef: invoice.id,
      });
    }

    if (invoice.status === 'Awaiting allocation') {
      alerts.push({
        id: `AUTO-${invoice.id}-allocation`,
        title: `${invoice.id} awaits allocation`,
        meta: `${invoice.customer} • ${invoice.paymentStatus}`,
        state: 'Action',
        read: false,
        type: 'finance',
        href: `/invoices/${invoice.id}`,
        actionLabel: 'Allocate receipt',
        sourceRef: invoice.id,
      });
    }

    return alerts;
  });
}

function paymentAlerts(payments: Payment[]): EnrichedNotification[] {
  return payments.flatMap((payment) => {
    const alerts: EnrichedNotification[] = [];

    if (payment.status === 'Pending proof') {
      alerts.push({
        id: `AUTO-${payment.id}-proof`,
        title: `Proof missing for ${payment.id}`,
        meta: `${payment.party} • ${payment.nextAction}`,
        state: 'Action',
        read: false,
        type: 'payment',
        href: `/payments/${payment.id}`,
        actionLabel: 'Resolve proof',
        sourceRef: payment.id,
      });
    }

    if (payment.status === 'Unallocated') {
      alerts.push({
        id: `AUTO-${payment.id}-allocation`,
        title: `${payment.id} is unallocated`,
        meta: `${payment.party} • ${payment.appliedTo}`,
        state: 'Pending',
        read: false,
        type: 'payment',
        href: `/payments/${payment.id}`,
        actionLabel: 'Allocate payment',
        sourceRef: payment.id,
      });
    }

    return alerts;
  });
}

function priorityScore(item: EnrichedNotification) {
  const state = item.state.toLowerCase();
  if (state.includes('urgent')) return 0;
  if (item.type === 'approval') return 1;
  if (state.includes('pending')) return 2;
  if (state.includes('action')) return 3;
  if (state.includes('alert')) return 4;
  return 5;
}

export function buildOperationalNotifications(args: {
  quotes: Quote[];
  invoices: Invoice[];
  payments: Payment[];
  notifications: Notification[];
}) {
  const feed = [
    ...args.notifications.map(toBaseNotification),
    ...quoteAlerts(args.quotes),
    ...invoiceAlerts(args.invoices),
    ...paymentAlerts(args.payments),
  ]
    .filter((item, index, arr) => arr.findIndex((entry) => entry.id === item.id) === index)
    .sort((a, b) => priorityScore(a) - priorityScore(b));

  const summary: AlertSummary = {
    unread: feed.filter((item) => !item.read).length,
    approvals: feed.filter((item) => item.type === 'approval').length,
    collections: feed.filter((item) => item.type === 'collection').length,
    paymentExceptions: feed.filter((item) => item.type === 'payment').length,
  };

  return { feed, summary };
}
