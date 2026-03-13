import { ModuleWorkspace } from '../components/ModuleWorkspace';

export function InventoryWorkspacePage() {
  return (
    <ModuleWorkspace
      title="Inventory"
      items={[
        { title: 'Products', to: '/products', icon: 'products' },
        { title: 'Stock', to: '/products', icon: 'stock' },
        { title: 'Movements', to: '/products', icon: 'movements' },
        { title: 'Transfers', to: '/products', icon: 'transfers' }
      ]}
      footerLabel="Low Stock"
      footerValue="Threshold watch"
    />
  );
}
