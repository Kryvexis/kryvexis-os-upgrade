import { ModuleWorkspace } from '../components/ModuleWorkspace';

export function InventoryWorkspacePage() {
  return (
    <ModuleWorkspace
      title="Inventory"
      items={[
        { title: 'Products', to: '/products', icon: '▥' },
        { title: 'Stock', to: '/products', icon: '▤' },
        { title: 'Movements', to: '/products', icon: '◫' },
        { title: 'Transfers', to: '/products', icon: '⇄' },
        { title: 'Low Stock', to: '/products', icon: '⚠', wide: true }
      ]}
    />
  );
}
