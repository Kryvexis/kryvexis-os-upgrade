import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { Settings } from '../types';

const fallback: Settings = {
  themes: ['dark', 'light', 'system'],
  paymentModes: ['cash', 'eft', 'card'],
  density: ['comfortable', 'compact'],
  supportEmail: 'kryvexissolutions@gmail.com',
  whatsapp: '+27686282874',
  business: { currency: 'ZAR', taxDefault: '15%', paymentTerms: '30 days', defaultBranch: 'Johannesburg' }
};

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(fallback);
  useEffect(() => {
    api.settings().then(setSettings).catch(() => setSettings(fallback));
  }, []);

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
    </div>
  );
}
