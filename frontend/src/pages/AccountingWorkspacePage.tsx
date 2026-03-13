import { ModuleWorkspace } from '../components/ModuleWorkspace';

export function AccountingWorkspacePage() {
  return (
    <ModuleWorkspace
      eyebrow="Accounting workspace"
      title="Accounting"
      description="Debtors, creditors, statements, expenses, and cash-up controls grouped into one finance workspace."
      heroValue="5"
      heroLabel="Accounting blocks"
      chips={['12 overdue accounts', '1 cash-up alert', 'R184,900 aging']}
      items={[
        { title: 'Debtors', subtitle: 'Open balances, reminders, and collections.', to: '/invoices', icon: '💰', meta: 'Receivables' },
        { title: 'Creditors', subtitle: 'Supplier-side obligations and controls.', to: '/notifications', icon: '💸', meta: 'Payables' },
        { title: 'Statements', subtitle: 'Statement generation and account view.', to: '/invoices', icon: '📚', meta: 'Account summaries' },
        { title: 'Expenses', subtitle: 'Expense capture and review.', to: '/notifications', icon: '🧾', meta: 'Spend control' },
        { title: 'Cash Up', subtitle: 'Cash-up reconciliation and exceptions.', to: '/payments', icon: '🧮', meta: 'Till close' }
      ]}
      heroStats={[
        { label: 'Debtor aging', value: 'R184,900', tone: 'warning' },
        { label: 'Receipts today', value: 'R18,400', tone: 'success' },
        { label: 'Open alerts', value: '5' }
      ]}
      footerTitle="Finance watchlist"
      footerRows={[
        { label: 'Collection risk', value: 'INV-2201', hint: 'Acme Retail Group · urgent follow-up' },
        { label: 'Cash-up alert', value: 'Cape Town', hint: 'Variance pending review' },
        { label: 'Payment proof', value: 'PAY-7693', hint: 'Proof still missing' }
      ]}
    />
  );
}
