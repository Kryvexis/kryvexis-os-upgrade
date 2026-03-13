import { ModuleWorkspace } from '../components/ModuleWorkspace';

export function SalesWorkspacePage() {
  return (
    <ModuleWorkspace
      eyebrow="Sales workspace"
      title="Sales"
      description="Module first, records second. Open the commercial blocks the way your mockup is structured."
      heroValue="4"
      heroLabel="Core sales blocks"
      chips={['6 approvals waiting', '4 unread alerts', 'R45,230 due']}
      items={[
        { title: 'Customers', subtitle: 'Accounts, credit posture, and next actions.', to: '/customers', icon: '👥', meta: 'Master records' },
        { title: 'Quotes', subtitle: 'Drafts, approvals, and quote-to-invoice flow.', to: '/quotes', icon: '🧾', meta: 'Pipeline control' },
        { title: 'Invoices', subtitle: 'Issued invoices, reminders, and collections.', to: '/invoices', icon: '📄', meta: 'Receivables' },
        { title: 'Payments', subtitle: 'Receipts, proof checks, and allocations.', to: '/payments', icon: '💳', meta: 'Cash application' }
      ]}
      heroStats={[
        { label: 'Open invoices', value: 'R45,230', tone: 'warning' },
        { label: 'Pending approvals', value: '6' },
        { label: 'Top client', value: 'Acme Retail Group', tone: 'success' }
      ]}
      footerTitle="Sales watchlist"
      footerRows={[
        { label: 'Collections risk', value: 'Acme Retail Group', hint: 'Invoice INV-2201 overdue' },
        { label: 'Largest open quote', value: 'Q-1045', hint: 'Urban Build Supply · pending approval' },
        { label: 'Follow-up focus', value: 'Northline Foods', hint: 'Awaiting quote confirmation' }
      ]}
    />
  );
}
