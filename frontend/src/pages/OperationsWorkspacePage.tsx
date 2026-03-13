import { ModuleWorkspace } from '../components/ModuleWorkspace';

export function OperationsWorkspacePage() {
  return (
    <ModuleWorkspace
      eyebrow="Operations workspace"
      title="Operations"
      description="Tasks, approvals, deliveries, and returns grouped into a cleaner operational control surface."
      heroValue="4"
      heroLabel="Operations blocks"
      chips={['4 tasks due', '2 approvals', '3 deliveries queued']}
      items={[
        { title: 'Tasks', subtitle: 'Day-to-day work queue and ownership.', to: '/notifications', icon: '✓', meta: 'Work queue' },
        { title: 'Approvals', subtitle: 'Review gates and approval control.', to: '/notifications', icon: '☑', meta: 'Decision points' },
        { title: 'Deliveries', subtitle: 'Operational movement to customers.', to: '/payments', icon: '🚚', meta: 'Dispatch flow' },
        { title: 'Returns', subtitle: 'Returned goods and corrective flow.', to: '/products', icon: '↩', meta: 'Reverse logistics' }
      ]}
      heroStats={[
        { label: 'Open tasks', value: '4' },
        { label: 'Pending approvals', value: '2', tone: 'warning' },
        { label: 'Deliveries queued', value: '3', tone: 'success' }
      ]}
      footerTitle="Operations watchlist"
      footerRows={[
        { label: 'Warehouse A', value: 'Restock today', hint: 'Threshold breached this morning' },
        { label: 'Dispatch focus', value: 'Durban route', hint: 'Three deliveries scheduled' },
        { label: 'Approval queue', value: 'Q-1045', hint: 'Sales manager sign-off still pending' }
      ]}
    />
  );
}
