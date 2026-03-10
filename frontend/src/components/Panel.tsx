import { PropsWithChildren } from 'react';

export function Panel({ title, action, children }: PropsWithChildren<{ title: string; action?: string }>) {
  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Phase 1</p>
          <h3>{title}</h3>
        </div>
        {action ? <button className="ghost-button">{action}</button> : null}
      </header>
      {children}
    </section>
  );
}
