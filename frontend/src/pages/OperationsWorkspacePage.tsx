import { Link } from 'react-router-dom';
import { Card } from '../components/Card';

const operationsBlocks = [
  { label: 'Tasks', path: '/notifications', blurb: 'Action queue and follow-up workload.' },
  { label: 'Approvals', path: '/quotes', blurb: 'Quotes and exceptions waiting for decision.' },
  { label: 'Deliveries', path: '/inventory', blurb: 'Outbound movement and dispatch coordination.' },
  { label: 'Returns', path: '/inventory', blurb: 'Returned stock and workflow exceptions.' }
] as const;

export function OperationsWorkspacePage() {
  return (
    <div className="page-grid module-workspace-page">
      <Card title="Operations workspace" subtitle="Operational work gets its own module page with direct action blocks instead of being buried under flat links." className="module-hero-card">
        <div className="module-block-grid inventory-module-grid">
          {operationsBlocks.map((block) => (
            <Link key={block.label} to={block.path} className="module-block-card">
              <span className="module-block-icon" />
              <strong>{block.label}</strong>
              <p>{block.blurb}</p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
