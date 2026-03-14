import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { Settings } from '../types';

const fallback: Settings = {
  themes: ['dark', 'light', 'system'],
  paymentModes: ['cash', 'eft', 'card'],
  density: ['comfortable', 'compact'],
  supportEmail: 'kryvexissolutions@gmail.com',
  whatsapp: '+27686282874',
  business: { currency: 'ZAR', taxDefault: '15%', paymentTerms: '30 days', defaultBranch: 'Johannesburg' },
  automation: {
    triggerMode: 'manual-close',
    closeTime: '18:00',
    sendToManagers: true,
    sendToExecutives: true,
    managerRecipients: ['manager@kryvexis.local'],
    executiveRecipients: ['boss@kryvexis.local'],
    defaultManagerBranch: 'Johannesburg',
    branchManagers: [
      { branch: 'Johannesburg', manager: 'Nadine Smit', email: 'jhb.manager@kryvexis.local' },
      { branch: 'Cape Town', manager: 'Rina Patel', email: 'cpt.manager@kryvexis.local' },
      { branch: 'Durban', manager: 'Tariq Naidoo', email: 'dbn.manager@kryvexis.local' }
    ]
  }
};

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(fallback);
  const [selectedBranch, setSelectedBranch] = useState(fallback.business.defaultBranch);

  useEffect(() => {
    api.settings().then((data) => {
      const merged: Settings = {
        ...fallback,
        ...data,
        business: { ...fallback.business, ...(data.business ?? {}) },
        automation: data.automation
          ? {
              ...fallback.automation!,
              ...data.automation,
              branchManagers: data.automation.branchManagers?.length
                ? data.automation.branchManagers
                : fallback.automation!.branchManagers
            }
          : fallback.automation
      };
      setSettings(merged);
      setSelectedBranch(merged.business.defaultBranch);
    }).catch(() => {
      setSettings(fallback);
      setSelectedBranch(fallback.business.defaultBranch);
    });
  }, []);

  const branchOptions = useMemo(() => {
    const mapped = settings.automation?.branchManagers?.map((item) => item.branch) ?? [];
    const combined = [settings.business.defaultBranch, ...(settings.automation?.defaultManagerBranch ? [settings.automation.defaultManagerBranch] : []), ...mapped];
    return Array.from(new Set(combined.filter(Boolean)));
  }, [settings]);

  const activeBranchManager = settings.automation?.branchManagers?.find((item) => item.branch === selectedBranch);

  return (
    <div className="split-grid mockup-secondary-page">
      <Card title="Business defaults" subtitle="Core operating defaults for Kryvexis OS.">
        <div className="setting-list">
          <div><span>Currency</span><strong>{settings.business.currency}</strong></div>
          <div><span>Tax default</span><strong>{settings.business.taxDefault}</strong></div>
          <div><span>Payment terms</span><strong>{settings.business.paymentTerms}</strong></div>
          <div><span>Default branch</span><strong>{settings.business.defaultBranch}</strong></div>
        </div>
      </Card>

      <Card title="Support & appearance" subtitle="What operators see and how they get help.">
        <div className="setting-list">
          <div><span>Theme modes</span><strong>{settings.themes.join(', ')}</strong></div>
          <div><span>Density</span><strong>{settings.density.join(', ')}</strong></div>
          <div><span>Support email</span><strong>{settings.supportEmail}</strong></div>
          <div><span>WhatsApp</span><strong>{settings.whatsapp}</strong></div>
        </div>
      </Card>

      <Card title="Branch selector" subtitle="Choose the branch context for report routing and operating defaults.">
        <label className="stack-field">
          <span>Active branch</span>
          <select value={selectedBranch} onChange={(event) => setSelectedBranch(event.target.value)}>
            {branchOptions.map((branch) => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </label>

        <div className="setting-list" style={{ marginTop: '14px' }}>
          <div><span>Selected branch</span><strong>{selectedBranch}</strong></div>
          <div><span>Manager scope</span><strong>{settings.automation?.defaultManagerBranch ?? selectedBranch}</strong></div>
          <div><span>Branch manager</span><strong>{activeBranchManager?.manager ?? 'Not assigned'}</strong></div>
          <div><span>Manager email</span><strong>{activeBranchManager?.email ?? 'No email configured'}</strong></div>
        </div>
      </Card>

      <Card title="Automation recipients" subtitle="Daily close recipients and routing by branch.">
        <div className="setting-list">
          <div><span>Trigger mode</span><strong>{settings.automation?.triggerMode ?? 'manual-close'}</strong></div>
          <div><span>Close time</span><strong>{settings.automation?.closeTime ?? '18:00'}</strong></div>
          <div><span>Managers receive</span><strong>{settings.automation?.sendToManagers ? 'Yes' : 'No'}</strong></div>
          <div><span>Executives receive</span><strong>{settings.automation?.sendToExecutives ? 'Yes' : 'No'}</strong></div>
          <div><span>Manager recipients</span><strong>{settings.automation?.managerRecipients.join(', ') || '—'}</strong></div>
          <div><span>Executive recipients</span><strong>{settings.automation?.executiveRecipients.join(', ') || '—'}</strong></div>
        </div>
      </Card>
    </div>
  );
}
