type ActivityItem = {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
};

export function ActivityTimeline({ title = 'Activity timeline', items }: { title?: string; items: ActivityItem[] }) {
  return (
    <section className="panel-card glass-panel">
      <div className="panel-heading">
        <h3>{title}</h3>
      </div>
      <div className="timeline">
        {items.map((item) => (
          <article key={item.id} className="timeline-item">
            <div className="timeline-dot" />
            <div>
              <strong>{item.actor}</strong>
              <p>
                {item.action} <span className="timeline-target">{item.target}</span>
              </p>
              <small>{item.time}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
