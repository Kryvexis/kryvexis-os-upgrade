import { ModuleWorkspace } from '../components/ModuleWorkspace';

export function ProcurementWorkspacePage() {
  return (
    <ModuleWorkspace
      title="Purchasing"
      items={[
        { title: 'Suppliers', to: '/notifications', icon: '🏭' },
        { title: 'Purchase Orders', to: '/notifications', icon: '🛒' },
        { title: 'Reorders', to: '/products', icon: '⟳' },
        { title: 'Goods Received', to: '/products', icon: '📥' },
        { title: 'Supplier Bills', to: '/invoices', icon: '🧮', wide: true }
      ]}
    />
  );
}
