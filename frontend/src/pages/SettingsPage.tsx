import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { AutomationConfig, Settings } from '../types';

function csv(value: string[]) {
  return value.join(', ');
}

function splitCsv(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [automationDraft, setAutomationDraft] = useState<AutomationConfig | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    api.settings().then((payload) => {
      setSettings(payload);
      setAutomationDraft(payload.automation);
    });
  }, []);

  async function saveAutomation() {
    if (!automationDraft) return;
    setStatus('Saving automation settings...');
    try {
      const saved = await api.updateAutomationSettings(automationDraft);
      setAutomationDraft(saved);
      setSettings((current) => current ? { ...current, automation: saved } : current);
      setStatus('Automation settings saved.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to save automation settings');
    }
  }

  if (!settings || !automationDraft) return <div className="loading-state">Loading settings...</div>;

  return (
    <div className="page-grid phase4-settings-page">
      <div className="split-grid">
        <Card title="Appearance" subtitle="Theme, density, sidebar behavior, and mobile shell defaults.">
          <div className="setting-list">
            <div><span>Theme modes</span><strong>{settings.themes.join(', ')}</strong></div>
            <div><span>Density</span><strong>{settings.density.join(', ')}</strong></div>
            <div><span>Payment modes</span><strong>{settings.paymentModes.join(', ')}</strong></div>
          </div>
        </Card>

        <Card title="Business defaults" subtitle="Currency, tax defaults, numbering logic, and support contact.">
          <div className="setting-list">
            <div><span>Currency</span><strong>{settings.business.currency}</strong></div>
            <div><span>Tax default</span><strong>{settings.business.taxDefault}</strong></div>
            <div><span>Payment terms</span><strong>{settings.business.paymentTerms}</strong></div>
            <div><span>Default branch</span><strong>{settings.business.defaultBranch}</strong></div>
            <div><span>Support email</span><strong>{settings.supportEmail}</strong></div>
            <div><span>WhatsApp</span><strong>{settings.whatsapp}</strong></div>
          </div>
        </Card>
      </div>

      <Card title="Daily sales automation" subtitle="Control the cut-off time and who receives the automatic sales summary after cash-up close.">
        <div className="phase4-settings-grid">
          <label className="phase4-field">
            <span>Trigger mode</span>
            <select value={automationDraft.triggerMode} onChange={(event) => setAutomationDraft({ ...automationDraft, triggerMode: event.target.value })}>
              <option value="cash-up close">Cash-up close</option>
              <option value="time-based">Time-based close</option>
              <option value="manual close">Manual close</option>
            </select>
          </label>

          <label className="phase4-field">
            <span>Close time</span>
            <input type="time" value={automationDraft.closeTime} onChange={(event) => setAutomationDraft({ ...automationDraft, closeTime: event.target.value })} />
          </label>

          <label className="phase4-toggle">
            <input type="checkbox" checked={automationDraft.sendToManager} onChange={(event) => setAutomationDraft({ ...automationDraft, sendToManager: event.target.checked })} />
            <div>
              <strong>Send to managers</strong>
              <p>Send each branch summary to its manager.</p>
            </div>
          </label>

          <label className="phase4-toggle">
            <input type="checkbox" checked={automationDraft.sendToExecutive} onChange={(event) => setAutomationDraft({ ...automationDraft, sendToExecutive: event.target.checked })} />
            <div>
              <strong>Send to executives</strong>
              <p>Also send the consolidated summary to the boss/executive list.</p>
            </div>
          </label>

          <label className="phase4-field phase4-field-wide">
            <span>Manager recipients</span>
            <input value={csv(automationDraft.managerEmails)} onChange={(event) => setAutomationDraft({ ...automationDraft, managerEmails: splitCsv(event.target.value) })} />
          </label>

          <label className="phase4-field phase4-field-wide">
            <span>Executive recipients</span>
            <input value={csv(automationDraft.executiveEmails)} onChange={(event) => setAutomationDraft({ ...automationDraft, executiveEmails: splitCsv(event.target.value) })} />
          </label>
        </div>

        <div className="phase4-branch-map">
          {Object.entries(automationDraft.branchManagerMap).map(([branch, email]) => (
            <div key={branch} className="phase4-branch-map-row">
              <span>{branch}</span>
              <strong>{email}</strong>
            </div>
          ))}
        </div>

        <div className="phase4-settings-actions">
          <button type="button" className="ghost-button" onClick={saveAutomation}>Save automation</button>
          <small>{status || `Last run ${automationDraft.lastRunAt} • locked date ${automationDraft.lastLockedDate}`}</small>
        </div>
      </Card>
    </div>
  );
}
