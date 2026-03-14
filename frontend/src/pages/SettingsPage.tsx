import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { AutomationSettings, Settings } from '../types';

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [automation, setAutomation] = useState<AutomationSettings | null>(null);
  const [saved, setSaved] = useState('');

  useEffect(() => {
    api.settings().then((data) => {
      setSettings(data);
      setAutomation(data.automation || null);
    });
  }, []);

  if (!settings || !automation) return <div className="loading-state">Loading settings...</div>;

  async function saveAutomation() {
    const updated = await api.updateAutomationSettings(automation);
    setAutomation(updated);
    setSaved('Automation settings saved.');
    window.setTimeout(() => setSaved(''), 2400);
  }

  return (
    <div className="page-grid">
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

      <Card title="Automation + recipients" subtitle="Controls for day close cadence and who receives the daily branch summary.">
        <div className="automation-form-grid">
          <label className="stack-field">
            <span>Trigger mode</span>
            <select value={automation.triggerMode} onChange={(event) => setAutomation({ ...automation, triggerMode: event.target.value })}>
              <option value="manual-close">Manual close</option>
              <option value="scheduled-close">Scheduled close</option>
            </select>
          </label>

          <label className="stack-field">
            <span>Close time</span>
            <input type="time" value={automation.closeTime} onChange={(event) => setAutomation({ ...automation, closeTime: event.target.value })} />
          </label>

          <label className="stack-field">
            <span>Manager branch scope</span>
            <select value={automation.defaultManagerBranch} onChange={(event) => setAutomation({ ...automation, defaultManagerBranch: event.target.value })}>
              {automation.branchManagers.map((item) => <option key={item.branch} value={item.branch}>{item.branch}</option>)}
            </select>
          </label>

          <label className="toggle-row">
            <input type="checkbox" checked={automation.sendToManagers} onChange={(event) => setAutomation({ ...automation, sendToManagers: event.target.checked })} />
            <span>Send to managers</span>
          </label>

          <label className="toggle-row">
            <input type="checkbox" checked={automation.sendToExecutives} onChange={(event) => setAutomation({ ...automation, sendToExecutives: event.target.checked })} />
            <span>Send to executives</span>
          </label>

          <label className="stack-field form-span-2">
            <span>Manager recipients</span><small className="field-help">Separate multiple emails with commas.</small>
            <textarea value={automation.managerRecipients.join(', ')} onChange={(event) => setAutomation({ ...automation, managerRecipients: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} />
          </label>

          <label className="stack-field form-span-2">
            <span>Executive recipients</span><small className="field-help">Separate multiple emails with commas.</small>
            <textarea value={automation.executiveRecipients.join(', ')} onChange={(event) => setAutomation({ ...automation, executiveRecipients: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} />
          </label>
        </div>

        <div className="toolbar-actions">
          <button className="solid-button" type="button" onClick={saveAutomation}>Save automation settings</button>
          {saved ? <span className="status-pill ok">{saved}</span> : null}
        </div>
      </Card>

      <Card title="Branch manager map" subtitle="Used by the daily summary recipient rules.">
        <div className="table-wrap">
          <table className="data-grid">
            <thead>
              <tr>
                <th>Branch</th>
                <th>Manager</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {automation.branchManagers.map((item) => (
                <tr key={item.branch}>
                  <td>{item.branch}</td>
                  <td>{item.manager}</td>
                  <td>{item.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
