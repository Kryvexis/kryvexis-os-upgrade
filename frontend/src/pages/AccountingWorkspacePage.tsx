import { ModuleWorkspace } from '../components/ModuleWorkspace';

export function AccountingWorkspacePage() {
  return (
    <ModuleWorkspace
      title="Accounting Intelligence"
      items={[
        { title: 'Debtors', to: '/accounting/debtors', icon: '◔' },
        { title: 'Statements', to: '/accounting/statements', icon: '▤' },
        { title: 'Cash Up', to: '/accounting/cash-up', icon: '◫' },
        { title: 'Expenses', to: '/accounting/expenses', icon: '▦' },
        { title: 'Creditors', to: '/accounting/creditors', icon: '◕' },
        { title: 'Exceptions', to: '/accounting/exceptions', icon: '✦' }
      ]}
    />
  );
}
