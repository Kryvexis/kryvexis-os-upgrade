import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { ActionCenterResponse, ActionRecommendation, RoleKey } from '../types';

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>; };
const emptyState: ActionCenterResponse = {
  generatedAt: new Date().toISOString(),
  topFocus: [],
  quickWins: [],
  recommendationFeed: [],
  domainSummaries: [],
  branchSnapshots: [],
  auditHighlights: [],
  availableBranches: ['all'],
  laneSummary: { all: 0, 'top-focus': 0, 'quick-win': 0, blocked: 0, watch: 0 }
};
function priorityTone(priority: string) { if (priority === 'critical') return 'critical'; if (priority === 'high') return 'high'; if (priority === 'medium') return 'medium'; return 'low'; }
function groupByDomain(items: ActionRecommendation[]) { return items.reduce<Record<string, ActionRecommendation[]>>((acc, item) => { acc[item.domain] = [...(acc[item.domain] || []), item]; return acc; }, {}); }
const laneOptions = [
  ['all', 'All lanes'],
  ['top-focus', 'Top focus'],
  ['quick-win', 'Quick wins'],
  ['blocked', 'Blocked'],
  ['watch', 'Watch list']
] as const;

export function ActionCenterPage({ role }: { role: RoleKey }) {
  const [data, setData] = useState<ActionCenterResponse>(emptyState);
  const [installPrompt, setInstallPrompt] = useState<InstallEvent | null>(null);
  const [installReady, setInstallReady] = useState(false);
  const [branch, setBranch] = useState('all');
  const [lane, setLane] = useState('all');

  useEffect(() => {
    let active = true;
    api.actionCenter(role, branch, lane).then((result) => { if (active) setData({ ...emptyState, ...result }); }).catch(() => { if (active) setData(emptyState); });
    return () => { active = false; };
  }, [role, branch, lane]);

  useEffect(() => {
    const handler = (event: Event) => { event.preventDefault?.(); setInstallPrompt(event as InstallEvent); setInstallReady(true); };
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice.catch(() => null);
    if (choice?.outcome === 'accepted') {
      setInstallReady(false);
      setInstallPrompt(null);
    }
  }

  const grouped = useMemo(() => groupByDomain(data.recommendationFeed), [data.recommendationFeed]);
  const hottestBranch = [...data.branchSnapshots].sort((a, b) => (b.heat || 0) - (a.heat || 0))[0];

  return (
    <div className="action-center-page">
      <section className="action-center-hero action-center-hero-v2">
        <div>
          <p className="eyebrow">Unified Action Center v3</p>
          <h2>One calm surface. Real transaction pressure underneath.</h2>
          <p className="muted">Finance, procurement, inventory, and live transaction queues now land in one ranked operating inbox with branch and lane filters.</p>
          <div className="action-hero-cta-row">
            <Link to="/quotes" className="ghost-button">Open quote pipeline</Link>
            <Link to="/payments" className="ghost-button">Open payment queue</Link>
            {installReady ? <button type="button" className="solid-button" onClick={handleInstall}>Install phone app</button> : null}
          </div>
        </div>
        <div className="action-center-stats action-center-stats-v2">
          {data.domainSummaries.map((item) => (
            <article key={item.domain} className="action-center-stat-card">
              <span>{item.domain}</span>
              <strong>{item.count}</strong>
              <p>{item.urgent} urgent • {item.impact}</p>
            </article>
          ))}
          {hottestBranch ? (
            <article className="action-center-stat-card action-center-heat-card">
              <span>Branch heat</span>
              <strong>{hottestBranch.branch}</strong>
              <p>{hottestBranch.approvals} approvals • {hottestBranch.collections} collections • {hottestBranch.exceptions} exceptions</p>
            </article>
          ) : null}
        </div>
      </section>

      <div className="toolbar-actions reports-toolbar">
        <label className="stack-field inline-field">
          <span>Branch</span>
          <select value={branch} onChange={(event) => setBranch(event.target.value)}>
            {(data.availableBranches || ['all']).map((item) => <option key={item} value={item}>{item === 'all' ? 'All branches' : item}</option>)}
          </select>
        </label>
        <label className="stack-field inline-field">
          <span>Lane</span>
          <select value={lane} onChange={(event) => setLane(event.target.value)}>
            {laneOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <div className="record-link-strip">
          {laneOptions.map(([value, label]) => (
            <span key={value} className="record-chip muted-chip">{label}: {data.laneSummary?.[value] ?? 0}</span>
          ))}
        </div>
      </div>

      <div className="action-center-layout">
        <Card title="Top focus" subtitle="The highest-impact work to move right now" className="action-center-primary">
          <div className="action-rec-list">
            {data.topFocus.map((item) => (
              <article key={item.id} className={`action-rec-card tone-${priorityTone(item.priority)}`}>
                <div className="action-rec-topline">
                  <span className="action-domain-pill">{item.domain}</span>
                  <span className={`action-priority-pill tone-${priorityTone(item.priority)}`}>{item.priority}</span>
                </div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
                <small>{item.reason}</small>
                <div className="action-rec-meta"><span>{item.branch}</span><span>{item.owner}</span><span>Score {item.score}</span><span>{item.impact}</span></div>
                <Link to={item.recordPath} className="action-rec-link">{item.actionLabel}</Link>
              </article>
            ))}
            {!data.topFocus.length ? <p className="muted">No critical actions are waiting right now.</p> : null}
          </div>
        </Card>

        <div className="action-center-side-stack">
          <Card title="Quick wins" subtitle="Fast actions the system can already justify">
            <div className="action-mini-list">
              {data.quickWins.map((item) => (<Link key={item.id} to={item.recordPath} className="action-mini-row"><strong>{item.title}</strong><span>{item.actionLabel}</span></Link>))}
              {!data.quickWins.length ? <p className="muted">No one-click wins surfaced yet.</p> : null}
            </div>
          </Card>
          <Card title="Branch pressure" subtitle="Where the operating load is building">
            <div className="branch-pressure-list">
              {data.branchSnapshots.map((item) => (
                <div key={item.branch} className="branch-pressure-row"><strong>{item.branch}</strong><p>{item.approvals} approvals • {item.collections} collections • {item.exceptions} exceptions</p></div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="action-center-domain-grid">
        {Object.entries(grouped).map(([domain, items]) => (
          <Card key={domain} title={domain} subtitle="Why the brain is surfacing these actions">
            <div className="action-mini-list">
              {items.slice(0, 5).map((item) => (
                <Link key={item.id} to={item.recordPath} className="action-domain-row">
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.reason}</p>
                  </div>
                  <span>{item.actionLabel}</span>
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
