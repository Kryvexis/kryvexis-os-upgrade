import { ModuleWorkspace } from '../components/ModuleWorkspace';

export function InventoryWorkspacePage() {
  return (
    <ModuleWorkspace
      eyebrow="Inventory workspace"
      title="Inventory"
      description="Products, stock pressure, movements, and transfers grouped into one cleaner operating surface."
      heroValue="5"
      heroLabel="Inventory blocks"
      chips={['1 low stock', '2 healthy SKUs', '43 units on hand']}
      items={[
        { title: 'Products', subtitle: 'SKU records, pricing anchors, and item detail.', to: '/products', icon: '📦', meta: 'Master SKUs' },
        { title: 'Stock', subtitle: 'On-hand levels, thresholds, and coverage.', to: '/products', icon: '🏷', meta: 'Coverage view' },
        { title: 'Movements', subtitle: 'Recent movement summaries and internal flow.', to: '/products', icon: '⇄', meta: 'Movement log' },
        { title: 'Transfers', subtitle: 'Inter-branch stock handoff visibility.', to: '/products', icon: '↔', meta: 'Branch flow' },
        { title: 'Low stock', subtitle: 'Threshold breaches and reorder pressure.', to: '/products', icon: '⚠', meta: 'Watch closely' }
      ]}
      heroStats={[
        { label: 'Low stock items', value: '1', tone: 'warning' },
        { label: 'Healthy SKUs', value: '2', tone: 'success' },
        { label: 'Top supplier', value: 'Prime Devices' }
      ]}
      footerTitle="Inventory watchlist"
      footerRows={[
        { label: 'Low stock', value: 'Thermal Roll Box', hint: 'Cape Town · reorder at 12' },
        { label: 'Fast mover', value: 'Kryvexis Label Printer', hint: 'Growing sales velocity this week' },
        { label: 'Transfer focus', value: 'Johannesburg → Durban', hint: 'Scanner dock handoff under review' }
      ]}
    />
  );
}
