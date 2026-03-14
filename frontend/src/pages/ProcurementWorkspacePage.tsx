import { ModuleWorkspace } from '../components/ModuleWorkspace';

export function ProcurementWorkspacePage() {
  return (
    <ModuleWorkspace
      title="Procurement"
      items={[
        { title: 'Procurement Brain', to: '/procurement/brain', icon: '🧠' },
        { title: 'Reorder Candidates', to: '/procurement/reorders', icon: '⟳' },
        { title: 'Supplier Scorecards', to: '/procurement/suppliers', icon: '🏭' },
        { title: 'PO Recommendations', to: '/procurement/purchase-orders', icon: '🛒' },
        { title: 'Procurement Exceptions', to: '/procurement/exceptions', icon: '⚠️', wide: true }
      ]}
    />
  );
}
