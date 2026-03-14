import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { ActionCenterResponse, ActionRecommendation, RoleKey } from '../types';

const emptyState: ActionCenterResponse = {
  generatedAt: new Date().toISOString(),
  topFocus: [],
  quickWins: [],
  recommendationFeed: [],
  domainSummaries: [],
  branchSnapshots: [],
  auditHighlights: []
};

function priorityTone(priority: string) {
  if (priority === 'critical') return 'critical';
  if (priority === 'high') return 'high';
  if (priority === 'medium') return 'medium';
  return 'low';
}

function groupByDomain(items: ActionRecommendation[]) {
  return items.reduce<Record<string, ActionRecommendation[]>>((acc, item) => {
    acc[item.domain] = [...(acc[item.domain] || []), item];
    return acc;
  }, {});
}

export function ActionCenterPage({ role }: { role: RoleKey }) {
  const [data, setData] = useState<ActionCenterResponse>(emptyState);

  useEffect(() => {
    let active = true;
    api.actionCenter(role).then((result) => {
      if (active) setData(result);
    }).catch(() => {
      if (active) setData(emptyState);
    });
    return () => {
      active = false;
    };
  }, [role]);

  const grouped = useMemo(() => groupByDomain(data.recommendationFeed), [data.recommendationFeed]);

  return (
    <div className="action-center-page">
      <section className="action-center-hero">
        <div>
          <p className="eyebrow">Unified Action Center</p>
          <h2>One calm surface. Ranked decisions underneath.</h2>
          <p className="muted">Kryvexis turns accounting, procurement, and inventory signals into the next best actions for today.</p>
        </div>
        <div className="action-center-stats">
          {data.domainSummaries.map((item) => (
            <article key={item.domain} className="action-center-stat-card">
              <span>{item.domain}</span>
              <strong>{item.count}</strong>
              <p>{item.urgent} urgent • {item.impact}</p>
            </article>
          ))}
        </div>
      </section>

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
                <div className="action-rec-meta">
                  <span>{item.branch}</span>
                  <span>{item.owner}</span>
                  <span>Score {item.score}</span>
                  <span>{item.impact}</span>
                </div>
                <Link to={item.recordPath} className="action-rec-link">{item.actionLabel}</Link>
              </article>
            ))}
            {!data.topFocus.length ? <p className="muted">No critical actions are waiting right now.</p> : null}
          </div>
        </Card>

        <div className="action-center-side-stack">
          <Card title="Quick wins" subtitle="Fast actions the system can already justify">
            <div className="action-mini-list">
              {data.quickWins.map((item) => (
                <Link key={item.id} to={item.recordPath} className="action-mini-row">
                  <strong>{item.title}</strong>
                  <span>{item.actionLabel}</span>
                </Link>
              ))}
              {!data.quickWins.length ? <p className="muted">No one-click wins surfaced yet.</p> : null}
            </div>
          </Card>

          <Card title="Branch pressure" subtitle="Where the operating load is building">
            <div className="branch-pressure-list">
              {data.branchSnapshots.map((item) => (
                <div key={item.branch} className="branch-pressure-row">
                  <strong>{item.branch}</strong>
                  <p>{item.approvals} approvals • {item.collections} collections • {item.exceptions} exceptions</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="action-center-domain-grid">
        {Object.entries(grouped).map(([domain, items]) => (
          <Card key={domain} title={domain} subtitle="Why the brain is surfacing these actions">
            <div className="action-mini-list">
              {items.slice(0, 4).map((item) => (
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
