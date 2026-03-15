import { ModuleWorkspace } from '../components/ModuleWorkspace';

export function SalesWorkspacePage() {
  return (
    <ModuleWorkspace
      title="Sales"
      items={[
        { title: 'Sales Desk / POS', to: '/sales/pos', icon: '🛒' },
        { title: 'Customers', to: '/customers', icon: '👥' },
        { title: 'Quotes', to: '/quotes', icon: '🧾' },
        { title: 'Invoices', to: '/invoices', icon: '📄' },
        { title: 'Payments', to: '/payments', icon: '💳' }
      ]}
    />
  );
}
