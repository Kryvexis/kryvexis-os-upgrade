import { ModuleWorkspace } from '../components/ModuleWorkspace';

export function ProcurementWorkspacePage() {
  return (
    <ModuleWorkspace
      eyebrow="Purchasing workspace"
      title="Purchasing"
      description="POs, suppliers, reorders, and goods received live under one procurement module instead of flat sidebar links."
      heroValue="5"
      heroLabel="Procurement blocks"
      chips={['1 pending PO', '3 suppliers', 'R18,240 in approvals']}
      items={[
        { title: 'Suppliers', subtitle: 'Commercial partners, lead times, and contacts.', to: '/notifications', icon: '🏭', meta: 'Vendor base' },
        { title: 'Purchase Orders', subtitle: 'PO queue, approvals, and issue-to-receipt flow.', to: '/notifications', icon: '🛒', meta: 'Core procurement flow' },
        { title: 'Reorders', subtitle: 'Threshold-driven reorder candidates and follow-up.', to: '/products', icon: '⟳', meta: 'Demand triggers' },
        { title: 'Goods Received', subtitle: 'Inbound stock acknowledgement and receiving control.', to: '/products', icon: '📥', meta: 'Receiving desk' },
        { title: 'Supplier Bills', subtitle: 'Bills matched against deliveries and PO references.', to: '/invoices', icon: '🧮', meta: 'Invoice matching' }
      ]}
      heroStats={[
        { label: 'Pending POs', value: '1', tone: 'warning' },
        { label: 'Suppliers', value: '3' },
        { label: 'Goods due today', value: '2 receipts', tone: 'success' }
      ]}
      footerTitle="PO watchlist"
      footerRows={[
        { label: 'PO-3101', value: 'Cape Paper Supply', hint: 'Pending approval · R18,240' },
        { label: 'Goods received', value: 'Scanner Dock batch', hint: 'Durban branch inbound today' },
        { label: 'Supplier focus', value: 'Prime Devices', hint: 'Lead time check due this week' }
      ]}
    />
  );
}
