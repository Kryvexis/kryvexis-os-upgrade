import type { PropsWithChildren, ReactNode } from 'react';
type CardProps = PropsWithChildren<{ title?: string; subtitle?: string; actions?: ReactNode; className?: string; }>;
export function Card({ title, subtitle, actions, className = '', children }: CardProps) {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || subtitle || actions) && (
        <header className="card-header">
          <div>{title ? <h3>{title}</h3> : null}{subtitle ? <p>{subtitle}</p> : null}</div>
          {actions ? <div className="card-actions">{actions}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}
