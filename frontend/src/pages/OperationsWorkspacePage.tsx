import { ModuleWorkspace } from '../components/ModuleWorkspace';

export function OperationsWorkspacePage() {
  return (
    <ModuleWorkspace
      title="Operations"
      items={[
        { title: 'Tasks', to: '/notifications', icon: '✓' },
        { title: 'Approvals', to: '/notifications', icon: '☑' },
        { title: 'Deliveries', to: '/payments', icon: '↗' },
        { title: 'Returns', to: '/products', icon: '↩' }
      ]}
    />
  );
}
