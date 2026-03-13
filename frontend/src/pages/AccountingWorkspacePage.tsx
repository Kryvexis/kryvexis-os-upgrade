import { ModuleWorkspace } from '../components/ModuleWorkspace';

export function AccountingWorkspacePage() {
  return (
    <ModuleWorkspace
      title="Accounting"
      items={[
        { title: 'Debtors', to: '/invoices', icon: 'debtors' },
        { title: 'Creditors', to: '/notifications', icon: 'creditors' },
        { title: 'Statements', to: '/invoices', icon: 'statements' },
        { title: 'Cash Up', to: '/payments', icon: 'cash-up' },
        { title: 'Expenses', to: '/notifications', icon: 'expenses', emphasis: 'wide' }
      ]}
    />
  );
}
