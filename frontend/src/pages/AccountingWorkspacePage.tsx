import { ModuleWorkspace } from '../components/ModuleWorkspace';

export function AccountingWorkspacePage() {
  return (
    <ModuleWorkspace
      title="Accounting"
      items={[
        { title: 'Debtors', to: '/invoices', icon: '◔' },
        { title: 'Creditors', to: '/notifications', icon: '◕' },
        { title: 'Statements', to: '/invoices', icon: '▤' },
        { title: 'Cash Up', to: '/payments', icon: '◫' },
        { title: 'Expenses', to: '/notifications', icon: '▦' },
        { title: 'Cash Up', to: '/payments', icon: '◫' }
      ]}
    />
  );
}
