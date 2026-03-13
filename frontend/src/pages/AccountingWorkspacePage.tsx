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

export function AccountingWorkspacePage() {
  return (
    <div className="module-page-grid">
      <section className="module-hero-card">
        <div className="module-hero-copy">
          <p className="eyebrow">Accounting workspace</p>
          <h2>Debtors, creditors, cash-up, and statements grouped under one finance surface.</h2>
          <p className="module-subcopy">Use the accounting module as the finance control layer rather than scattering these records around the shell.</p>
        </div>
        <div className="module-chip-row">
          <span className="module-chip">2 debtor actions</span>
          <span className="module-chip">1 cash-up issue</span>
          <span className="module-chip">4 statements ready</span>
        </div>
      </section>
      <section className="module-board">
        <div className="workspace-block-grid two-up plus-single">
          <WorkspaceBlock title="Debtors" body="Collections, aging, and overdue action queues." />
          <WorkspaceBlock title="Creditors" body="Supplier obligations and due-date visibility." />
          <WorkspaceBlock title="Statements" body="Customer and supplier statement control." />
          <WorkspaceBlock title="Expenses" body="Branch spend and approval-linked costs." />
          <WorkspaceBlock title="Cash Up" body="Daily close, variance checks, and finance signoff." />
        </div>
      </section>
    </div>
  );
}
