import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { ReportsResponse, RoleKey } from '../types';

function money(value: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(value).replace('ZAR', 'R').replace(/\u00a0/g, ' ');
}

export function ReportsPage({ role }: { role: RoleKey }) {
  const [branch, setBranch] = useState('all');
  const [report, setReport] = useState<ReportsResponse | null>(null);
  const [busy, setBusy] = useState<'close' | 'send' | null>(null);
  const [message, setMessage] = useState('');

  const canAccess = role === 'manager' || role === 'executive' || role === 'admin';

  async function loadReport(selectedBranch = branch) {
    const data = await api.reports(role, selectedBranch);
    setReport(data);
    if (!data.canViewAllBranches && selectedBranch !== data.scope) {
      setBranch(data.scope);
    }
  }

  useEffect(() => {
    if (!canAccess) return;
    loadReport();
  }, [role]);

  useEffect(() => {
    if (!canAccess) return;
    loadReport(branch);
  }, [branch]);

  const branchOptions = useMemo(() => {
    if (!report) return [];
    const names = report.automation.branchManagers.map((item) => item.branch);
    return report.canViewAllBranches ? ['all', ...names] : [report.scope];
  }, [report]);

  if (!canAccess) {
    return <div className="loading-state">Reports are available only to managers, executives, and admins.</div>;
  }

  if (!report) return <div className="loading-state">Loading reports...</div>;

  async function handleDayClose(sendEmail: boolean) {
    setBusy(sendEmail ? 'send' : 'close');
    setMessage('');
    try {
      await api.runDayClose(sendEmail);
      await loadReport(branch);
      setMessage(sendEmail ? 'Day close completed and summary email dispatched.' : 'Day close completed and saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setBusy(null);
    }
  }

  async function handleSendEmailOnly() {
    setBusy('send');
    setMessage('');
    try {
      await api.sendSummaryEmail();
      await loadReport(branch);
      setMessage('Summary email sent successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Send failed');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="page-grid reports-layout">
      <div className="toolbar-actions reports-toolbar">
        <label className="stack-field inline-field">
          <span>Branch scope</span>
          <select value={branch} onChange={(event) => setBranch(event.target.value)} disabled={!report.canViewAllBranches}>
            {branchOptions.map((item) => (
              <option key={item} value={item}>{item === 'all' ? 'All branches' : item}</option>
            ))}
          </select>
        </label>
        <button className="ghost-button" type="button" onClick={() => handleDayClose(false)} disabled={busy !== null}>
          {busy === 'close' ? 'Running close…' : 'Run day close'}
        </button>
        <button className="solid-button" type="button" onClick={() => handleDayClose(true)} disabled={busy !== null}>
          {busy === 'send' ? 'Sending…' : 'Close + send email'}
        </button>
        <button className="ghost-button" type="button" onClick={handleSendEmailOnly} disabled={busy !== null}>
          Send latest summary only
        </button>
      </div>

      {message ? <div className="banner-note">{message}</div> : null}

      <div className="kpi-grid compact-kpi-grid">
        <Card className="metric-card" title="Yesterday sales"><strong>{money(report.totals.totalSales)}</strong><p>{report.date}</p></Card>
        <Card className="metric-card" title="Target"><strong>{money(report.totals.target)}</strong><p>{report.totals.targetAchievedPct}% achieved</p></Card>
        <Card className="metric-card" title="Variance"><strong>{money(report.totals.varianceToTarget)}</strong><p>{report.totals.varianceToTarget >= 0 ? 'Above target' : 'Behind target'}</p></Card>
        <Card className="metric-card" title="Transactions"><strong>{report.totals.transactions}</strong><p>Across visible branches</p></Card>
      </div>

      <div className="split-grid reports-split">
        <Card title="Branch performance" subtitle="Yesterday totals, target attainment, and basket quality by branch.">
          <div className="table-wrap">
            <table className="data-grid">
              <thead>
                <tr>
                  <th>Branch</th>
                  <th>Sales</th>
                  <th>Target</th>
                  <th>Variance</th>
                  <th>Mix</th>
                  <th>Basket</th>
                </tr>
              </thead>
              <tbody>
                {report.visibleBranches.map((item) => (
                  <tr key={item.branch}>
                    <td>
                      <strong>{item.branch}</strong>
                      <div className="muted-inline">{item.transactions} txns</div>
                    </td>
                    <td>{money(item.totalSales)}</td>
                    <td>{money(item.target)} <span className="muted-inline">({item.targetAchievedPct}%)</span></td>
                    <td>{money(item.varianceToTarget)}</td>
                    <td>POS {money(item.posSales)} / Inv {money(item.invoiceSales)}</td>
                    <td>{money(item.averageBasket)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Seller leaderboard" subtitle="Keep this operational: who is moving the number against their own target?">
          <div className="notification-stack">
            {report.sellerBoard.map((seller) => {
              const pct = seller.target ? Math.round((seller.sales / seller.target) * 100) : 0;
              return (
                <div key={`${seller.name}-${seller.branch}`} className="mini-list-row report-mini-row">
                  <div>
                    <strong>{seller.name}</strong>
                    <p>{seller.branch}</p>
                  </div>
                  <div className="align-right">
                    <strong>{money(seller.sales)}</strong>
                    <p>{pct}% of target</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="split-grid reports-split">
        <Card title="Daily summary email preview" subtitle="This is the message the boss or managers receive after close.">
          <div className="email-preview-box">
            <strong>{report.emailPreview.subject}</strong>
            <pre>{report.emailPreview.body}</pre>
          </div>
        </Card>

        <Card title="Automation status" subtitle="Stored recipient rules and close cadence.">
          <div className="setting-list">
            <div><span>Trigger mode</span><strong>{report.automation.triggerMode}</strong></div>
            <div><span>Close time</span><strong>{report.automation.closeTime}</strong></div>
            <div><span>Managers receive</span><strong>{report.automation.sendToManagers ? 'Yes' : 'No'}</strong></div>
            <div><span>Executives receive</span><strong>{report.automation.sendToExecutives ? 'Yes' : 'No'}</strong></div>
            <div><span>Manager recipients</span><strong>{report.automation.managerRecipients.join(', ')}</strong></div>
            <div><span>Executive recipients</span><strong>{report.automation.executiveRecipients.join(', ')}</strong></div>
          </div>
        </Card>
      </div>

      <div className="split-grid reports-split">
        <Card title="Email dispatch log" subtitle="Last sent summaries and provider status.">
          <div className="notification-stack">
            {report.emailDispatches.length ? report.emailDispatches.map((dispatch) => (
              <div key={dispatch.id} className="mini-list-row report-mini-row">
                <div>
                  <strong>{dispatch.subject}</strong>
                  <p>{new Date(dispatch.sentAt).toLocaleString()}</p>
                </div>
                <div className="align-right">
                  <strong>{dispatch.provider}</strong>
                  <p>{dispatch.status}</p>
                </div>
              </div>
            )) : <div className="loading-state">No summary emails sent yet.</div>}
          </div>
        </Card>

        <Card title="Day close history" subtitle="Saved close snapshots persisted on the backend.">
          <div className="notification-stack">
            {report.dayCloseHistory.length ? report.dayCloseHistory.map((item) => (
              <div key={item.id} className="mini-list-row report-mini-row">
                <div>
                  <strong>{item.date}</strong>
                  <p>{new Date(item.closedAt).toLocaleString()}</p>
                </div>
                <div className="align-right">
                  <strong>{money(item.totalSales)}</strong>
                  <p>{item.trigger}</p>
                </div>
              </div>
            )) : <div className="loading-state">No day close history yet.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
