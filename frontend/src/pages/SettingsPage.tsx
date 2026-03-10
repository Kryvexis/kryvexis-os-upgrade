import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { Settings } from '../types';
export function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  useEffect(() => { api.settings().then(setSettings); }, []);
  if (!settings) return <div className="loading-state">Loading settings...</div>;
  return <div className="split-grid"><Card title="Appearance" subtitle="Theme, density, sidebar behavior, and mobile shell defaults."><div className="setting-list"><div><span>Theme modes</span><strong>{settings.themes.join(', ')}</strong></div><div><span>Density</span><strong>{settings.density.join(', ')}</strong></div><div><span>Payment modes</span><strong>{settings.paymentModes.join(', ')}</strong></div></div></Card><Card title="Business defaults" subtitle="Currency, tax defaults, numbering logic, and support contact."><div className="setting-list"><div><span>Currency</span><strong>{settings.business.currency}</strong></div><div><span>Tax default</span><strong>{settings.business.taxDefault}</strong></div><div><span>Payment terms</span><strong>{settings.business.paymentTerms}</strong></div><div><span>Default branch</span><strong>{settings.business.defaultBranch}</strong></div><div><span>Support email</span><strong>{settings.supportEmail}</strong></div><div><span>WhatsApp</span><strong>{settings.whatsapp}</strong></div></div></Card></div>;
}
