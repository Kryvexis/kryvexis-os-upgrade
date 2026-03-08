import type { ReactNode } from 'react';

export function PanelCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel-card glass-panel">
      <div className="panel-heading">
        <h3>{title}</h3>
      </div>
      <div className="panel-body">{children}</div>
    </section>
  );
}