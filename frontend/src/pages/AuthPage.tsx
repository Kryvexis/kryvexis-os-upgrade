import { FormEvent, useState } from 'react';
import { api } from '../lib/api';

const starterEmails = [
  'kryvexissolutions@gmail.com',
  'jhb.manager@kryvexis.local',
  'alex@kryvexis.local',
  'rina@kryvexis.local'
];

export function AuthPage({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [email, setEmail] = useState('kryvexissolutions@gmail.com');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.login(email);
      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card card">
        <div className="brand-block">
          <span className="brand-mark">K</span>
          <div>
            <strong>Kryvexis OS</strong>
            <p>Sign in to the branch workspace</p>
          </div>
        </div>
        <form onSubmit={submit} className="stack-field" style={{ gap: 14 }}>
          <label className="stack-field">
            <span>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
          </label>
          <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
          {error ? <p className="danger-text">{error}</p> : null}
        </form>
        <div className="auth-helper">
          <strong>Seed users</strong>
          <div className="auth-chip-row">
            {starterEmails.map((item) => (
              <button key={item} type="button" className="ghost-button" onClick={() => setEmail(item)}>{item}</button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
