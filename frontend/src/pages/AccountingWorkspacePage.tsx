import { ModuleWorkspace } from '../components/ModuleWorkspace';

export function AccountingWorkspacePage() {
  return (
    <ModuleWorkspace
      title="Finance Masterpiece"
      items={[
        { title: 'Debtors', to: '/accounting/debtors', icon: '◔' },
        { title: 'Statements', to: '/accounting/statements', icon: '▤' },
        { title: 'Cash Up', to: '/accounting/cash-up', icon: '◫' },
        { title: 'Expenses', to: '/accounting/expenses', icon: '▦' },
        { title: 'Creditors', to: '/accounting/creditors', icon: '◕' },
        { title: 'Exceptions', to: '/accounting/exceptions', icon: '✦' },
        { title: 'Ledger', to: '/accounting/ledger', icon: '⌘' },
        { title: 'Supplier Bills', to: '/accounting/bills', icon: '▣' },
        { title: 'Reconciliation', to: '/accounting/reconciliation', icon: '◌' },
        { title: 'VAT Control', to: '/accounting/vat', icon: '◈' },
        { title: 'Period Close', to: '/accounting/period-close', icon: '◎' }
      ]}
    />
  );
}
