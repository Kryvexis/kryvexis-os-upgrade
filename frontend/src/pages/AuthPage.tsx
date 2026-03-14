import { FormEvent, useMemo, useState } from 'react';
import { api } from '../lib/api';
import logo from '../assets/kryvexis-logo.png';
import type { AuthSession, RoleKey } from '../types';

const starterEmails = [
  'kryvexissolutions@gmail.com',
  'jhb.manager@kryvexis.local',
  'alex@kryvexis.local',
  'rina@kryvexis.local'
];

const storyFrames = [
  'A command center that feels switched on before you touch a single module.',
  'Finance, procurement, and stock control moving in one connected pulse.',
  'Built to feel iconic on mobile and unmistakably Kryvexis on first launch.'
];

const roleOptions: { value: RoleKey; label: string }[] = [
  { value: 'manager', label: 'Manager' },
  { value: 'sales', label: 'Sales' },
  { value: 'finance', label: 'Finance' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'procurement', label: 'Procurement' },
  { value: 'operations', label: 'Operations' }
];

const branchOptions = [
  { value: 'JHB', label: 'Johannesburg' },
  { value: 'CPT', label: 'Cape Town' },
  { value: 'DBN', label: 'Durban' }
];

export function AuthPage({ onAuthenticated }: { onAuthenticated: (session: AuthSession) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('kryvexissolutions@gmail.com');
  const [fullName, setFullName] = useState('');
  const [roleKey, setRoleKey] = useState<RoleKey>('manager');
  const [branchId, setBranchId] = useState('JHB');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const frame = useMemo(() => storyFrames[Math.floor((Date.now() / 3000) % storyFrames.length)], []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const session = mode === 'login'
        ? await api.login(email)
        : await api.signup({ fullName, email, roleKey, branchId });
      onAuthenticated(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : `${mode} failed`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="entry-screen auth-screen">
      <div className="entry-ambient entry-ambient-a" />
      <div className="entry-ambient entry-ambient-b" />
      <section className="entry-stage">
        <div className="entry-hero">
          <img src={logo} alt="Kryvexis" className="entry-logo entry-logo-large" />
          <h1>Secure access before system ignition.</h1>
          <p className="entry-copy">{frame}</p>
          <div className="entry-pill-row">
            <span className="entry-pill">Role-aware access</span>
            <span className="entry-pill">Branch-aware sessions</span>
            <span className="entry-pill">Command center ready</span>
          </div>
        </div>

        <section className="auth-card auth-card-cinematic card">
          <div className="auth-card-glow" />
          <div className="auth-logo-lockup">
            <img src={logo} alt="Kryvexis" className="entry-logo" />
            <div>
              <strong>Kryvexis OS</strong>
              <p>{mode === 'login' ? 'Sign in to the operating core' : 'Create an operator account and continue'}</p>
            </div>
          </div>

          <div className="auth-chip-row cinematic-chip-row" style={{ marginBottom: 14 }}>
            <button type="button" className={`ghost-button entry-chip ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Login</button>
            <button type="button" className={`ghost-button entry-chip ${mode === 'signup' ? 'active' : ''}`} onClick={() => setMode('signup')}>Sign up</button>
          </div>

          <form onSubmit={submit} className="stack-field auth-form-stack">
            {mode === 'signup' ? (
              <>
                <label className="stack-field">
                  <span>Full name</span>
                  <input className="entry-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Antonie Meyer" autoComplete="name" />
                </label>
                <div className="split-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label className="stack-field">
                    <span>Role</span>
                    <select className="entry-input" value={roleKey} onChange={(e) => setRoleKey(e.target.value as RoleKey)}>
                      {roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                  <label className="stack-field">
                    <span>Branch</span>
                    <select className="entry-input" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                      {branchOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                </div>
              </>
            ) : null}
            <label className="stack-field">
              <span>Work email</span>
              <input
                className="entry-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                autoComplete="email"
              />
            </label>
            <button className="entry-primary-button" type="submit" disabled={busy}>
              {busy ? (mode === 'login' ? 'Launching command core...' : 'Creating operator account...') : (mode === 'login' ? 'Launch Kryvexis' : 'Create account and continue')}
            </button>
            {error ? <p className="danger-text">{error}</p> : null}
          </form>

          <div className="auth-helper">
            <div className="auth-helper-head">
              <strong>Quick access</strong>
              <span>Passwordless demo sign-in</span>
            </div>
            <div className="auth-chip-row cinematic-chip-row">
              {starterEmails.map((item) => (
                <button key={item} type="button" className="ghost-button entry-chip" onClick={() => { setMode('login'); setEmail(item); }}>{item}</button>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
