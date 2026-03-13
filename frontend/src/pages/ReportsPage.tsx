import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import type { ReportsResponse, RoleKey } from '../types';

function roleDefaultBranch(role: RoleKey) {
  if (role === 'manager') return 'Johannesburg';
  return 'All branches';
}

export function ReportsPage({ role }: { role: RoleKey }) {
  const [selectedBranch, setSelectedBranch] = useState(roleDefaultBranch(role));
  const [data, setData] = useState<ReportsResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setSelectedBranch(roleDefaultBranch(role));
  }, [role]);

  useEffect(() => {
    setError('');
    api.reports(role, selectedBranch).then(setData).catch((err: Error) => {
      setError(err.message || 'Failed to load reports');
      setData(null);
    });
  }, [role, selectedBranch]);

  const topDispatch = useMemo(() => data?.emailDispatches[0] ?? null, [data]);

  if (error) return <div className="loading-state">{error}</div>;
  if (!data) return <div className="loading-state">Loading reports...</div>;

  return (
    <div className="page-grid reports-page phase3-reports-page">
      <section className="card reports-hero-card">
        <div className="card-header reports-hero-header">
          <div>
            <span className="eyebrow">Management only</span>
            <h3>Sales reports and daily branch summaries</h3>
            <p>Track company or branch totals, compare reps against target, and preview the automated daily email that goes to managers and executives.</p>
          </div>
          <div className="reports-filter-box">
            <label htmlFor="reports-branch">View</label>
            <select
              id="reports-branch"
              value={selectedBranch}
              onChange={(event) => setSelectedBranch(event.target.value)}
              disabled={role === 'manager'}
            >
              {data.availableBranches.map((branch) => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
            <small>Generated {data.generatedAt}</small>
          </div>
        </div>

        <div className="reports-summary-grid">
          <article className="soft-panel reports-summary-card">
            <span className="eyebrow">Yesterday</span>
            <strong>{data.totals.yesterdaySales}</strong>
            <p>{data.selectedBranch}</p>
          </article>
          <article className="soft-panel reports-summary-card">
            <span className="eyebrow">Month to date</span>
            <strong>{data.totals.monthToDateSales}</strong>
            <p>Against target {data.totals.monthlyTarget}</p>
          </article>
          <article className="soft-panel reports-summary-card">
            <span className="eyebrow">Attainment</span>
            <strong>{data.totals.attainmentPercent}%</strong>
            <p>Target progress</p>
          </article>
        </div>
      </section>

      <section className="reports-grid phase3-reports-grid">
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
                <span className={`badge ${branch.attainmentPercent >= 100 ? 'success' : 'warning'}`}>{branch.attainmentPercent}%</span>
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
              <article key={`${seller.name}-${seller.branch}`} className="reports-list-row">
                <div>
                  <strong>{seller.name}</strong>
                  <p>{seller.branch}</p>
                </div>
                <div className="reports-list-metrics">
                  <span>{seller.sales}</span>
                  <small>{seller.target} target</small>
                </div>
                <span className={`badge ${seller.attainmentPercent >= 100 ? 'success' : 'warning'}`}>{seller.attainmentPercent}%</span>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="reports-grid phase3-reports-grid">
        <article className="card reports-panel-card">
          <div className="card-header">
            <div>
              <h3>Daily aggregation</h3>
              <p>What the nightly job stores per branch before the email summary is sent.</p>
            </div>
          </div>
          <div className="phase3-summary-table">
            <div className="phase3-summary-header">
              <span>Branch</span>
              <span>Total</span>
              <span>POS</span>
              <span>Invoices</span>
              <span>Variance</span>
            </div>
            {data.dailySummaries.map((row) => (
              <div key={`${row.date}-${row.branch}`} className="phase3-summary-row">
                <div>
                  <strong>{row.branch}</strong>
                  <p>{row.transactions} tx • {row.owner}</p>
                </div>
                <span>{row.salesTotal}</span>
                <span>{row.posSales}</span>
                <span>{row.invoiceSales}</span>
                <span className={row.variance.startsWith('-') ? 'negative' : 'positive'}>{row.variance}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card reports-panel-card">
          <div className="card-header">
            <div>
              <h3>Email dispatch log</h3>
              <p>Audit trail for the automatic branch-summary emails.</p>
            </div>
          </div>
          <div className="reports-list">
            {data.emailDispatches.map((item) => (
              <article key={item.id} className="reports-list-row">
                <div>
                  <strong>{item.audience}</strong>
                  <p>{item.summary}</p>
                </div>
                <div className="reports-list-metrics">
                  <span>{item.sentAt}</span>
                  <small>{item.recipients.join(', ')}</small>
                </div>
                <span className={`badge ${item.status === 'Delivered' ? 'success' : 'warning'}`}>{item.status}</span>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="card reports-email-card phase3-email-card">
        <div className="card-header">
          <div>
            <h3>Daily summary email preview</h3>
            <p>This is the message template the system sends once the daily sales figures are calculated and locked for the day.</p>
          </div>
          {topDispatch ? <span className="badge success">Last send {topDispatch.sentAt}</span> : null}
        </div>

        <div className="reports-email-preview">
          <div className="reports-email-meta phase3-email-meta">
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
