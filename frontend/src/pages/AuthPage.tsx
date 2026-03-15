import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import logo from '../assets/kryvexis-logo-entry.png';
import type { AuthSession, CompanyOnboardingPayload } from '../types';

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

const branchIdPresets = ['JHB', 'CPT', 'DBN', 'PTA', 'BLO'];

type Mode = 'login' | 'signup';

type SignupForm = {
  companyName: string;
  adminName: string;
  email: string;
  phone: string;
  businessType: string;
  currency: string;
  branchCount: number;
  primaryBranchId: string;
  branches: { id: string; name: string }[];
  logoDataUrl?: string;
  logoFileName?: string;
};

const defaultForm = (): SignupForm => ({
  companyName: '',
  adminName: '',
  email: '',
  phone: '',
  businessType: 'Retail',
  currency: 'ZAR',
  branchCount: 1,
  primaryBranchId: 'JHB',
  branches: [{ id: 'JHB', name: 'Main Branch' }],
  logoDataUrl: undefined,
  logoFileName: undefined
});

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read the selected logo file'));
    reader.readAsDataURL(file);
  });
}

export function AuthPage({ onAuthenticated }: { onAuthenticated: (session: AuthSession) => void }) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('kryvexissolutions@gmail.com');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [signup, setSignup] = useState<SignupForm>(defaultForm());
  const frame = useMemo(() => storyFrames[Math.floor((Date.now() / 3000) % storyFrames.length)], []);

  useEffect(() => {
    setSignup((current) => {
      const nextBranches = Array.from({ length: current.branchCount }, (_, index) => {
        const existing = current.branches[index];
        const fallbackId = branchIdPresets[index] || `BR${index + 1}`;
        return {
          id: existing?.id || fallbackId,
          name: existing?.name || (index === 0 ? 'Main Branch' : `Branch ${index + 1}`)
        };
      });
      const primaryExists = nextBranches.some((item) => item.id === current.primaryBranchId);
      return {
        ...current,
        branches: nextBranches,
        primaryBranchId: primaryExists ? current.primaryBranchId : nextBranches[0]?.id || 'JHB'
      };
    });
  }, [signup.branchCount]);

  function updateSignup<K extends keyof SignupForm>(key: K, value: SignupForm[K]) {
    setSignup((current) => ({ ...current, [key]: value }));
  }

  function updateBranch(index: number, field: 'id' | 'name', value: string) {
    setSignup((current) => ({
      ...current,
      branches: current.branches.map((branch, branchIndex) => {
        if (branchIndex != index) return branch;
        return {
          ...branch,
          [field]: field === 'id' ? value.toUpperCase().replace(/\s+/g, '-') : value
        };
      })
    }));
  }

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const logoDataUrl = await fileToDataUrl(file);
      setSignup((current) => ({ ...current, logoDataUrl, logoFileName: file.name }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load logo');
    }
  }

  async function submitLogin(event: FormEvent) {
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

  async function submitSignup(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload: CompanyOnboardingPayload = {
        companyName: signup.companyName.trim(),
        adminName: signup.adminName.trim(),
        email: signup.email.trim().toLowerCase(),
        phone: signup.phone.trim(),
        businessType: signup.businessType.trim(),
        currency: signup.currency,
        branchCount: signup.branchCount,
        primaryBranchId: signup.primaryBranchId,
        branches: signup.branches.map((branch, index) => ({
          id: (branch.id || branchIdPresets[index] || `BR${index + 1}`).trim().toUpperCase(),
          name: toTitleCase(branch.name || `Branch ${index + 1}`)
        })),
        logoDataUrl: signup.logoDataUrl,
        logoFileName: signup.logoFileName
      };
      const session = await api.signupCompany(payload);
      onAuthenticated(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="entry-screen auth-screen onboarding-auth-screen">
      <div className="entry-ambient entry-ambient-a" />
      <div className="entry-ambient entry-ambient-b" />
      <section className="entry-stage onboarding-stage">
        <div className="entry-hero">
          <img src={logo} alt="Kryvexis" className="entry-logo entry-logo-large entry-logo-clean" />
          <h1>Launch the company, not just the user.</h1>
          <p className="entry-copy">{frame}</p>
          <div className="entry-pill-row">
            <span className="entry-pill">Company onboarding</span>
            <span className="entry-pill">Multi-branch ready</span>
            <span className="entry-pill">Quote &amp; invoice branding</span>
          </div>
        </div>

        <section className="auth-card auth-card-cinematic card auth-card-wide">
          <div className="auth-card-glow" />
          <div className="auth-mode-switch" role="tablist" aria-label="Authentication mode">
            <button type="button" className={mode === 'login' ? 'mode-tab active' : 'mode-tab'} onClick={() => setMode('login')}>Sign in</button>
            <button type="button" className={mode === 'signup' ? 'mode-tab active' : 'mode-tab'} onClick={() => setMode('signup')}>Create company</button>
          </div>

          {mode === 'login' ? (
            <>
              <div className="auth-logo-lockup compact-lockup">
                <img src={logo} alt="Kryvexis" className="entry-logo entry-logo-clean" />
                <div>
                  <strong>Welcome back</strong>
                  <p>Sign in to the operating core</p>
                </div>
              </div>

              <form onSubmit={submitLogin} className="stack-field auth-form-stack">
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
                  {busy ? 'Launching command core...' : 'Launch Kryvexis'}
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
            </>
          ) : (
            <form onSubmit={submitSignup} className="stack-field auth-form-stack onboarding-form">
              <div className="auth-signup-grid">
                <label className="stack-field">
                  <span>Company name</span>
                  <input className="entry-input" value={signup.companyName} onChange={(e) => updateSignup('companyName', e.target.value)} placeholder="Kryvexis Retail Group" required />
                </label>
                <label className="stack-field">
                  <span>Admin full name</span>
                  <input className="entry-input" value={signup.adminName} onChange={(e) => updateSignup('adminName', e.target.value)} placeholder="Antonie Meyer" required />
                </label>
                <label className="stack-field">
                  <span>Admin email</span>
                  <input className="entry-input" value={signup.email} onChange={(e) => updateSignup('email', e.target.value)} placeholder="owner@company.com" autoComplete="email" required />
                </label>
                <label className="stack-field">
                  <span>Phone</span>
                  <input className="entry-input" value={signup.phone} onChange={(e) => updateSignup('phone', e.target.value)} placeholder="+27 68 628 2874" />
                </label>
                <label className="stack-field">
                  <span>Business type</span>
                  <input className="entry-input" value={signup.businessType} onChange={(e) => updateSignup('businessType', e.target.value)} placeholder="Retail / Distribution" />
                </label>
                <label className="stack-field">
                  <span>Currency</span>
                  <select className="entry-input" value={signup.currency} onChange={(e) => updateSignup('currency', e.target.value)}>
                    <option value="ZAR">ZAR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </label>
                <label className="stack-field">
                  <span>How many branches?</span>
                  <input className="entry-input" type="number" min={1} max={12} value={signup.branchCount} onChange={(e) => updateSignup('branchCount', Math.min(12, Math.max(1, Number(e.target.value) || 1)))} />
                </label>
                <label className="stack-field">
                  <span>Primary branch ID</span>
                  <select className="entry-input" value={signup.primaryBranchId} onChange={(e) => updateSignup('primaryBranchId', e.target.value)}>
                    {signup.branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>{branch.id}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="branch-builder card subtle-card">
                <div className="branch-builder-head">
                  <strong>Branch setup</strong>
                  <span>Name the branches you want ready from day one.</span>
                </div>
                <div className="branch-builder-list">
                  {signup.branches.map((branch, index) => (
                    <div key={`${branch.id}-${index}`} className="branch-builder-row">
                      <label className="stack-field">
                        <span>Branch ID</span>
                        <input className="entry-input" value={branch.id} onChange={(e) => updateBranch(index, 'id', e.target.value)} placeholder={`BR${index + 1}`} />
                      </label>
                      <label className="stack-field branch-name-field">
                        <span>Branch name</span>
                        <input className="entry-input" value={branch.name} onChange={(e) => updateBranch(index, 'name', e.target.value)} placeholder={`Branch ${index + 1}`} />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="logo-upload-card card subtle-card">
                <div>
                  <strong>Document logo</strong>
                  <p>This logo is used on quotes and invoices, not the app icon.</p>
                </div>
                <label className="logo-upload-field">
                  <span>{signup.logoFileName ? `Selected: ${signup.logoFileName}` : 'Upload PNG / JPG / SVG'}</span>
                  <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoChange} />
                </label>
                {signup.logoDataUrl ? <img src={signup.logoDataUrl} alt="Document logo preview" className="signup-logo-preview" /> : null}
              </div>

              <button className="entry-primary-button" type="submit" disabled={busy}>
                {busy ? 'Creating company workspace...' : 'Create company workspace'}
              </button>
              {error ? <p className="danger-text">{error}</p> : null}
            </form>
          )}
        </section>
      </section>
    </main>
  );
}
