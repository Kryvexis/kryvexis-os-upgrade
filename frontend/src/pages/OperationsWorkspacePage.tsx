import { ModuleWorkspace } from '../components/ModuleWorkspace';

export function OperationsWorkspacePage() {
  return (
    <ModuleWorkspace
      title="Operations"
      items={[
        { title: 'Tasks', to: '/notifications', icon: 'tasks' },
        { title: 'Approvals', to: '/notifications', icon: 'approvals' },
        { title: 'Deliveries', to: '/payments', icon: 'deliveries' },
        { title: 'Returns', to: '/products', icon: 'returns' }
      ]}
    />
  );
}
