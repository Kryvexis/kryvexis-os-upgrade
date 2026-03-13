import { Link } from 'react-router-dom';

type WorkspaceItem = {
  title: string;
  subtitle: string;
  to: string;
  icon: string;
  meta?: string;
};

type HeroStat = {
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'warning';
};

export function ModuleWorkspace({
  eyebrow,
  title,
  description,
  heroValue,
  heroLabel,
  chips,
  items,
  heroStats,
  footerTitle,
  footerRows
}: {
  eyebrow: string;
  title: string;
  description: string;
  heroValue: string;
  heroLabel: string;
  chips: string[];
  items: WorkspaceItem[];
  heroStats: HeroStat[];
  footerTitle?: string;
  footerRows?: Array<{ label: string; value: string; hint?: string }>;
}) {
  return (
    <div className="module-page mockup-module-page">
      <section className="module-shell mockup-module-shell">
        <div className="module-shell-head mockup-module-head">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <div className="module-shell-stat mockup-module-stat">
            <strong>{heroValue}</strong>
            <span>{heroLabel}</span>
          </div>
        </div>

        <div className="module-chip-row mockup-module-chip-row">
          {chips.map((chip) => (
            <span key={chip} className="module-chip">{chip}</span>
          ))}
        </div>

        <div className="workspace-block-grid mockup-workspace-grid">
          {items.map((item) => (
            <Link key={item.title} to={item.to} className="workspace-block mockup-workspace-block">
              <span className="workspace-block-icon mockup-workspace-icon">{item.icon}</span>
              <div className="workspace-block-copy">
                <strong>{item.title}</strong>
                <p>{item.subtitle}</p>
                {item.meta ? <span className="workspace-block-meta">{item.meta}</span> : null}
              </div>
            </Link>
          ))}
        </div>

        <div className="module-hero-strip">
          {heroStats.map((stat) => (
            <div key={stat.label} className={`module-hero-card ${stat.tone ?? 'default'}`}>
              <span className="eyebrow">{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      </section>

      {footerTitle && footerRows?.length ? (
        <section className="module-footer-panel">
          <div className="card-header compact-module-footer-head">
            <div>
              <h3>{footerTitle}</h3>
              <p>Keep the high-signal items visible without drilling into every record.</p>
            </div>
          </div>
          <div className="module-footer-grid">
            {footerRows.map((row) => (
              <article key={row.label} className="module-footer-card">
                <span className="eyebrow">{row.label}</span>
                <strong>{row.value}</strong>
                {row.hint ? <p>{row.hint}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
