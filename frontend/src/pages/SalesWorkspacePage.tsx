import { ModuleWorkspace } from '../components/ModuleWorkspace';

export function SalesWorkspacePage() {
  return (
    <ModuleWorkspace
      title="Sales"
      items={[
        { title: 'Customers', to: '/customers', icon: 'customers' },
        { title: 'Quotes', to: '/quotes', icon: 'quotes' },
        { title: 'Invoices', to: '/invoices', icon: 'invoices' },
        { title: 'Payments', to: '/payments', icon: 'payments' }
      ]}
    />
  );
}
