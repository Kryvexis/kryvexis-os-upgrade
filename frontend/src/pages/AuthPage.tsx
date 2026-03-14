import { FormEvent, useMemo, useState } from 'react';
import { api } from '../lib/api';
import logo from '../assets/kryvexis-logo.png';
import type { AuthSession } from '../types';

const starterEmails = [
  'kryvexissolutions@gmail.com',
  'jhb.manager@kryvexis.local',
  'alex@kryvexis.local',
  'rina@kryvexis.local'
];

const storyFrames = [
  'Command your branches with one operating system.',
  'Automate finance, procurement, and inventory with intelligence.',
  'Move from admin software to a live command center.'
];

export function AuthPage({ onAuthenticated }: { onAuthenticated: (session: AuthSession) => void }) {
  const [email, setEmail] = useState('kryvexissolutions@gmail.com');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const frame = useMemo(() => storyFrames[Math.floor((Date.now() / 3000) % storyFrames.length)], []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const session = await api.login(email);
      onAuthenticated(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
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
          <p className="eyebrow">Kryvexis OS</p>
          <img src={logo} alt="Kryvexis" className="entry-logo entry-logo-large" />
          <h1>Built to feel like the future of operations.</h1>
          <p className="entry-copy">{frame}</p>
          <div className="entry-pill-row">
            <span className="entry-pill">Finance intelligence</span>
            <span className="entry-pill">Predictive procurement</span>
            <span className="entry-pill">Stock brain</span>
          </div>
        </div>

        <section className="auth-card auth-card-cinematic card">
          <div className="auth-card-glow" />
          <div className="auth-logo-lockup">
            <img src={logo} alt="Kryvexis" className="entry-logo" />
            <div>
              <strong>Kryvexis OS</strong>
              <p>Enter the command center</p>
            </div>
          </div>

          <form onSubmit={submit} className="stack-field auth-form-stack">
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
              {busy ? 'Opening workspace...' : 'Launch Kryvexis'}
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
                <button key={item} type="button" className="ghost-button entry-chip" onClick={() => setEmail(item)}>{item}</button>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
