import { ModuleWorkspace } from '../components/ModuleWorkspace';

export function ProcurementWorkspacePage() {
  return (
    <ModuleWorkspace
      title="Purchasing"
      items={[
        { title: 'Suppliers', to: '/notifications', icon: 'suppliers' },
        { title: 'Purchase Orders', to: '/notifications', icon: 'purchase-orders' },
        { title: 'Reorders', to: '/products', icon: 'reorders' },
        { title: 'Goods Received', to: '/products', icon: 'goods-received' }
      ]}
    />
  );
}
