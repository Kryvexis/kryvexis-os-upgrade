import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { ReportsResponse, RoleKey } from '../types';

export function ReportsPage({ role }: { role: RoleKey }) {
  const [data, setData] = useState<ReportsResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    api.reports(role).then(setData).catch((err: Error) => {
      setError(err.message || 'Failed to load reports');
      setData(null);
    });
  }, [role]);

  if (error) return <div className="loading-state">{error}</div>;
  if (!data) return <div className="loading-state">Loading reports...</div>;

  return (
    <div className="page-grid reports-page">
      <section className="card reports-hero-card">
        <div className="card-header">
          <div>
            <span className="eyebrow">Management only</span>
            <h3>Sales reports</h3>
            <p>Total company sales, branch performance, seller leaderboard, and the daily email summary preview.</p>
          </div>
        </div>

        <div className="reports-summary-grid">
          <article className="soft-panel reports-summary-card">
            <span className="eyebrow">Yesterday</span>
            <strong>{data.totals.yesterdaySales}</strong>
            <p>All branches combined</p>
          </article>
          <article className="soft-panel reports-summary-card">
            <span className="eyebrow">Month to date</span>
            <strong>{data.totals.monthToDateSales}</strong>
            <p>Against target {data.totals.monthlyTarget}</p>
          </article>
          <article className="soft-panel reports-summary-card">
            <span className="eyebrow">Attainment</span>
            <strong>{data.totals.attainmentPercent}%</strong>
            <p>Company target progress</p>
          </article>
        </div>
      </section>

      <section className="reports-grid">
        <article className="card reports-panel-card">
          <div className="card-header">
            <div>
              <h3>Branch totals</h3>
              <p>Yesterday's performance by branch against the daily target.</p>
            </div>
          </div>
          <div className="reports-list">
            {data.branches.map((branch) => (
              <article key={branch.branch} className="reports-list-row">
                <div>
                  <strong>{branch.branch}</strong>
                  <p>{branch.owner}</p>
                </div>
                <div className="reports-list-metrics">
                  <span>{branch.yesterdaySales}</span>
                  <small>{branch.dailyTarget} target</small>
                </div>
                <span className="badge success">{branch.attainmentPercent}%</span>
              </article>
            ))}
          </div>
        </article>

        <article className="card reports-panel-card">
          <div className="card-header">
            <div>
              <h3>Seller leaderboard</h3>
              <p>Month-to-date sales per user against their assigned target.</p>
            </div>
          </div>
          <div className="reports-list">
            {data.sellers.map((seller) => (
              <article key={seller.name} className="reports-list-row">
                <div>
                  <strong>{seller.name}</strong>
                  <p>{seller.branch}</p>
                </div>
                <div className="reports-list-metrics">
                  <span>{seller.sales}</span>
                  <small>{seller.target} target</small>
                </div>
                <span className="badge warning">{seller.attainmentPercent}%</span>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="card reports-email-card">
        <div className="card-header">
          <div>
            <h3>Daily summary email preview</h3>
            <p>This is the automation output managers and executives should receive after daily branch totals are calculated.</p>
          </div>
        </div>

        <div className="reports-email-preview">
          <div className="reports-email-meta">
            <div><span>To</span><strong>{data.emailPreview.recipients.join(', ')}</strong></div>
            <div><span>Subject</span><strong>{data.emailPreview.subject}</strong></div>
          </div>
          <div className="reports-email-body">
            {data.emailPreview.lines.map((line) => <p key={line}>{line}</p>)}
          </div>
        </div>
      </section>
    </div>
  );
}
