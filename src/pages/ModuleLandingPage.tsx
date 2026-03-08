import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';

const defaults = [
  'Overview and KPI strip',
  'Primary tables and saved views',
  'Detail pages with activity timeline',
  'Approval and audit hooks',
  'Test coverage for render and routing'
];

export function ModuleLandingPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="page-stack">
      <PageHeader
        title={title}
        description={description}
        actions={<button className="soft-button">Configure module</button>}
      />

      <section className="dashboard-grid single-column">
        <PanelCard title={`${title} rollout plan`}>
          <p>
            This route is ready for the next build pass. We can now replace this landing page with full lists,
            detail pages, workflows, and tests for the {title.toLowerCase()} domain.
          </p>
          <ul className="clean-list">
            {defaults.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </PanelCard>
      </section>
    </div>
  );
}