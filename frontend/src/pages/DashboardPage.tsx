import { Panel } from '../components/Panel';
import { RecordHero } from '../components/RecordHero';
import { StatCard } from '../components/StatCard';
import { StatusPill } from '../components/StatusPill';
import { dashboardKpis, notifications, quotes, taskList } from '../data/mock';

export function DashboardPage() {
  return (
    <div className="page-stack">
      <RecordHero
        title="Operational visibility without the ERP clutter"
        description="Phase 1 delivers the premium shell, role-aware dashboard, customer and sales records, products, payments, notifications, and settings foundation."
        actions={['Create quote', 'Issue invoice']}
      />

      <section className="stats-grid">
        {dashboardKpis.map((item) => <StatCard key={item.label} item={item} />)}
      </section>

      <section className="two-column-grid">
        <Panel title="Approval and collection pressure" action="View queue">
          <div className="list-stack">
            {quotes.map((quote) => (
              <div key={quote.id} className="list-row">
                <div>
                  <strong>{quote.id}</strong>
                  <p>{quote.customer}</p>
                </div>
                <div>
                  <p>{quote.value}</p>
                  <StatusPill value={quote.status} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Notifications and automations" action="Inbox">
          <div className="list-stack">
            {notifications.map((note) => (
              <div key={note.title} className="list-row">
                <div>
                  <strong>{note.title}</strong>
                  <p>{note.meta}</p>
                </div>
                <StatusPill value={note.state} />
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <Panel title="Role-aware next actions" action="All tasks">
        <div className="task-grid">
          {taskList.map((task) => (
            <article key={task.task} className="task-card">
              <p className="eyebrow">{task.due}</p>
              <h4>{task.task}</h4>
              <p className="muted">Owner: {task.owner}</p>
              <StatusPill value={task.state} />
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}
