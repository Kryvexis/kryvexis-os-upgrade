import type { ReactNode } from 'react';

export function SettingsSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="settings-section glass-panel">
      <div className="settings-section-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      <div className="settings-section-body">{children}</div>
    </section>
  );
}
