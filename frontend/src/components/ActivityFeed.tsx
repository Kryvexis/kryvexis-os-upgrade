import { Link } from 'react-router-dom';
import type { ActivityEntry } from '../types';

export function ActivityFeed({ items }: { items: ActivityEntry[] }) {
  if (!items.length) {
    return <div className="loading-state">No activity logged yet.</div>;
  }

  return (
    <div className="activity-feed">
      {items.map((item) => (
        <article key={item.id} className="activity-item">
          <div className="activity-copy">
            <div className="activity-headline-row">
              <strong>{item.title}</strong>
              {item.status ? <span className="badge neutral">{item.status}</span> : null}
            </div>
            <p>{item.detail}</p>
            <div className="activity-meta">
              <span>{item.actor}</span>
              <span>{item.timestamp}</span>
            </div>
          </div>
          {item.recordPath ? (
            <Link className="action-link" to={item.recordPath}>
              Open record
            </Link>
          ) : null}
        </article>
      ))}
    </div>
  );
}
