function WorkspaceBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="workspace-block static-block">
      <div className="workspace-icon" />
      <div className="workspace-block-copy">
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </div>
  );
}

export function OperationsWorkspacePage() {
  return (
    <div className="module-page-grid">
      <section className="module-hero-card">
        <div className="module-hero-copy">
          <p className="eyebrow">Operations workspace</p>
          <h2>Tasks, approvals, deliveries, and returns grouped under one execution module.</h2>
          <p className="module-subcopy">This is the handoff layer where the business turns approvals and records into real movement.</p>
        </div>
        <div className="module-chip-row">
          <span className="module-chip">5 open tasks</span>
          <span className="module-chip">2 delivery issues</span>
          <span className="module-chip">1 return pending</span>
        </div>
      </section>
      <section className="module-board">
        <div className="workspace-block-grid two-up">
          <WorkspaceBlock title="Tasks" body="Daily action ownership and branch follow-through." />
          <WorkspaceBlock title="Approvals" body="Operational signoff and handoff control." />
          <WorkspaceBlock title="Deliveries" body="Dispatch progress and customer delivery visibility." />
          <WorkspaceBlock title="Returns" body="Return intake, inspection, and next-action handling." />
        </div>
      </section>
    </div>
  );
}
