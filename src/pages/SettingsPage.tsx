import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { SettingsSection } from '../components/SettingsSection';
import { roleOptions } from '../layout/navigation';
import { useTheme } from '../theme/ThemeProvider';

const tabs = [
  { key: 'profile', label: 'Profile' },
  { key: 'appearance', label: 'Appearance' },
  { key: 'roles', label: 'Roles & Access' },
  { key: 'notifications', label: 'Notifications' }
] as const;

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme, setTheme } = useTheme();
  const [activeRole, setActiveRole] = useState('admin');
  const currentTab = useMemo(() => searchParams.get('tab') ?? 'profile', [searchParams]);

  return (
    <div className="page-stack">
      <PageHeader title="Settings" description="A real app settings space for user profile, theme, role selection, and workspace preferences." actions={<button className="soft-button primary">Save preferences</button>} />

      <nav className="settings-tabs" aria-label="Settings sections">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`settings-tab ${currentTab === tab.key ? 'active' : ''}`}
            onClick={() => setSearchParams({ tab: tab.key })}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <SettingsSection title="Logged-in user" description="Top-right account area starts here and expands into a full settings space.">
        <div className="settings-grid two-up">
          <div className="profile-card muted-card">
            <span className="avatar-large">A</span>
            <div>
              <strong>Antonie Meyer</strong>
              <p>kryvexissolutions@gmail.com</p>
              <span className="eyebrow">Main Branch · Admin</span>
            </div>
          </div>
          <div className="profile-card muted-card">
            <div>
              <strong>Workspace profile</strong>
              <p>Kryvexis OS starter workspace with responsive shell, role-aware nav, and deployment-ready theme controls.</p>
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Appearance" description="Theme and presentation preferences built into the app from the start.">
        <div className="choice-grid">
          {(['light', 'dark', 'system'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              className={`choice-card ${theme === mode ? 'active' : ''}`}
              onClick={() => setTheme(mode)}
            >
              <strong>{mode[0].toUpperCase() + mode.slice(1)}</strong>
              <p>{mode === 'system' ? 'Match device preference.' : `Use ${mode} interface styling.`}</p>
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Roles & access" description="Preview and switch role-focused workspace modes for testing the shell structure.">
        <div className="choice-grid">
          {roleOptions.map((role) => (
            <button
              key={role.key}
              type="button"
              className={`choice-card ${activeRole === role.key ? 'active' : ''}`}
              onClick={() => setActiveRole(role.key)}
            >
              <strong>{role.label}</strong>
              <p>{role.description}</p>
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Notifications & workflow" description="Starter controls for how users receive alerts, approvals, and activity.">
        <div className="settings-grid three-up">
          <div className="muted-card"><strong>Approvals</strong><p>Email + in-app for urgent requests.</p></div>
          <div className="muted-card"><strong>Activity feed</strong><p>Daily summary for commercial and stock events.</p></div>
          <div className="muted-card"><strong>Branch alerts</strong><p>Low stock and transfer exceptions enabled.</p></div>
        </div>
      </SettingsSection>
    </div>
  );
}
