import { Panel } from '../components/Panel';
import { RecordHero } from '../components/RecordHero';

export function SettingsPage() {
  return (
    <div className="page-stack">
      <RecordHero title="Settings" description="Theme, density, branch defaults, numbering logic, and user preferences foundation." actions={['Save preferences']} />
      <section className="two-column-grid">
        <Panel title="Appearance" action="Theme sync">
          <div className="settings-list">
            <div className="setting-row"><span>Theme</span><strong>Dark / Light / System</strong></div>
            <div className="setting-row"><span>Density</span><strong>Comfortable</strong></div>
            <div className="setting-row"><span>Sidebar</span><strong>Pinned</strong></div>
          </div>
        </Panel>
        <Panel title="Business defaults" action="Edit">
          <div className="settings-list">
            <div className="setting-row"><span>Currency</span><strong>ZAR</strong></div>
            <div className="setting-row"><span>Payments</span><strong>EFT + Cash</strong></div>
            <div className="setting-row"><span>Support contact</span><strong>kryvexissolutions@gmail.com</strong></div>
          </div>
        </Panel>
      </section>
    </div>
  );
}
