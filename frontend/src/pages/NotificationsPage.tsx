import { Panel } from '../components/Panel';
import { RecordHero } from '../components/RecordHero';
import { StatusPill } from '../components/StatusPill';
import { notifications } from '../data/mock';

export function NotificationsPage() {
  return (
    <div className="page-stack">
      <RecordHero title="Notifications" description="Unified smart inbox for approvals, alerts, automations, and follow-up context." actions={['Digest settings']} />
      <Panel title="Inbox feed" action="Mark all seen">
        <div className="list-stack">
          {notifications.map((note) => (
            <div key={note.title} className="list-row large">
              <div>
                <strong>{note.title}</strong>
                <p>{note.meta}</p>
              </div>
              <StatusPill value={note.state} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
