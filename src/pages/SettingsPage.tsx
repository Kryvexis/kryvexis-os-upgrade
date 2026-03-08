import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { SettingsSection } from '../components/SettingsSection';
import { roleOptions } from '../layout/navigation';
import { useTheme } from '../theme/ThemeProvider';
import { usePreferences } from '../preferences/PreferencesProvider';

const tabs = [
  { key: 'profile', label: 'Profile' },
  { key: 'appearance', label: 'Appearance' },
  { key: 'roles', label: 'Roles & Access' },
  { key: 'notifications', label: 'Notifications' }
] as const;

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme, setTheme } = useTheme();
  const { activeRole, setActiveRole, branchName, setBranchName } = usePreferences();
  const currentTab = useMemo(() => searchParams.get('tab') ?? 'profile', [searchParams]);

  return (
    <div className="page-stack">
      <PageHeader title="Settings" description="Workspace preferences, access modes, branch context, and notification controls." actions={<button className="soft-button primary">Save preferences</button>} />

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

      {currentTab === 'profile' ? (
        <>
          <SettingsSection title="Logged-in user" description="Top-right account area expanded into a real profile workspace.">
            <div className="settings-grid two-up">
              <div className="profile-card muted-card">
                <span className="avatar-large">A</span>
                <div>
                  <strong>Antonie Meyer</strong>
                  <p>kryvexissolutions@gmail.com</p>
                  <span className="eyebrow">{branchName} · {roleOptions.find((role) => role.key === activeRole)?.label}</span>
                </div>
              </div>
              <div className="profile-card muted-card">
                <div>
                  <strong>Workspace profile</strong>
                  <p>Kryvexis OS workspace with responsive shell, role-aware nav, notifications center, and modular business pages.</p>
                </div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Branch & workflow" description="Set working context for branch-aware operations.">
            <div className="settings-grid two-up">
              <div className="muted-card">
                <strong>Active branch</strong>
                <div className="branch-switcher">
                  {['Main Branch', 'Cape Town', 'Johannesburg'].map((branch) => (
                    <button
                      key={branch}
                      type="button"
                      className={`settings-tab ${branchName === branch ? 'active' : ''}`}
                      onClick={() => setBranchName(branch)}
                    >
                      {branch}
                    </button>
                  ))}
                </div>
              </div>
              <div className="settings-grid three-up">
                <div className="muted-card"><strong>Default role</strong><p>{roleOptions.find((role) => role.key === activeRole)?.label}</p></div>
                <div className="muted-card"><strong>Workspace</strong><p>Desktop + mobile ready</p></div>
                <div className="muted-card"><strong>Status</strong><p>Shell configured</p></div>
              </div>
            </div>
          </SettingsSection>
        </>
      ) : null}

      {currentTab === 'appearance' ? (
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
      ) : null}

      {currentTab === 'roles' ? (
        <SettingsSection title="Roles & access" description="Switch role-focused workspace modes for testing visibility and menu behavior.">
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
      ) : null}

      {currentTab === 'notifications' ? (
        <SettingsSection title="Notifications & workflow alerts" description="Starter controls for reminders, approvals, and branch alerts.">
          <div className="settings-grid three-up">
            <div className="muted-card"><strong>Approvals</strong><p>Email + in-app for urgent requests.</p></div>
            <div className="muted-card"><strong>Activity feed</strong><p>Daily summary for commercial and stock events.</p></div>
            <div className="muted-card"><strong>Branch alerts</strong><p>Low stock and transfer exceptions enabled.</p></div>
          </div>
        </SettingsSection>
      ) : null}
    </div>
  );
}
