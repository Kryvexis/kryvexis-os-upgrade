import { useTheme } from '../theme/ThemeProvider';

const themeLabelMap = {
  light: 'Light',
  dark: 'Dark',
  system: 'System'
} as const;

type TopbarProps = {
  subtitle: string;
  onMenuClick: () => void;
};

export function Topbar({ subtitle, onMenuClick }: TopbarProps) {
  const { theme, cycleTheme } = useTheme();

  return (
    <header className="topbar glass-panel">
      <div className="topbar-title-row">
        <button className="icon-button mobile-only" type="button" onClick={onMenuClick} aria-label="Open navigation menu">
          ☰
        </button>
        <div>
          <p className="eyebrow">Business Operating System</p>
          <h2>{subtitle}</h2>
        </div>
      </div>

      <div className="topbar-actions">
        <label className="search-shell" aria-label="Search workspace">
          <span>⌘K</span>
          <input placeholder="Search customers, invoices, stock, actions..." />
        </label>
        <button className="soft-button" type="button" onClick={cycleTheme} aria-label={`Change theme mode. Current mode ${themeLabelMap[theme]}`}>
          Theme: {themeLabelMap[theme]}
        </button>
        <button className="soft-button" type="button">Notifications</button>
        <button className="soft-button primary desktop-only" type="button">Quick Create</button>
      </div>
    </header>
  );
}
