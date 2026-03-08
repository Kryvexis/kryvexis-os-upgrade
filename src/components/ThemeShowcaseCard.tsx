import { useTheme } from '../theme/ThemeProvider';

export function ThemeShowcaseCard() {
  const { theme, resolvedTheme } = useTheme();

  return (
    <section className="panel-card glass-panel">
      <div className="panel-heading">
        <h3>Experience layer</h3>
      </div>
      <div className="panel-body build-status">
        <div>
          <span className="status-dot live" />
          <strong>{resolvedTheme === 'dark' ? 'Dark mode ready' : 'Light mode ready'}</strong>
        </div>
        <p>Theme mode is set to {theme}. Mobile navigation and role-aware layout foundations are active in this package.</p>
      </div>
    </section>
  );
}
