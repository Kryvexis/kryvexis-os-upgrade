import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { ReportsResponse, RoleKey } from '../types';

type PendingAction = 'close' | 'close-send' | 'resend' | null;

function money(value: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 })
    .format(value)
    .replace('ZAR', 'R')
    .replace(/\u00a0/g, ' ');
}

const emptyReport: ReportsResponse = {
  scope: 'all',
  date: new Date().toISOString().slice(0, 10),
  canViewAllBranches: false,
  visibleBranches: [],
  totals: {
    totalSales: 0,
    target: 0,
    varianceToTarget: 0,
    targetAchievedPct: 0,
    posSales: 0,
    invoiceSales: 0,
    cashSales: 0,
    cardSales: 0,
    eftSales: 0,
    transactions: 0
  },
  sellerBoard: [],
  emailPreview: { subject: 'Daily Sales Summary', body: 'No summary available yet.' },
  emailDispatches: [],
  dayCloseHistory: [],
  branchCloseHistory: [],
  automation: {
    triggerMode: 'manual-close',
    closeTime: '18:00',
    sendToManagers: true,
    sendToExecutives: true,
    managerRecipients: [],
    executiveRecipients: [],
    defaultManagerBranch: 'all',
    branchManagers: []
  },
  closeStatus: {
    date: new Date().toISOString().slice(0, 10),
    state: 'open',
    label: 'Open',
    lastClosedAt: null,
    lastClosedBy: null,
    recordId: null
  },
  sendStatus: {
    state: 'not-ready',
    label: 'Waiting for close',
    lastSentAt: null,
    duplicateBlocked: false,
    lastDispatchId: null
  },
  auditTrail: []
};

export function ReportsPage({ role }: { role: RoleKey }) {
  const [branch, setBranch] = useState('all');
  const [report, setReport] = useState<ReportsResponse | null>(null);
  const [busy, setBusy] = useState<PendingAction>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmAction, setConfirmAction] = useState<PendingAction>(null);

  const canAccess = role === 'manager' || role === 'executive' || role === 'admin';

  async function loadReport(selectedBranch = branch) {
    const payload = await api.reports(role, selectedBranch);
    setReport({ ...emptyReport, ...payload, automation: { ...emptyReport.automation, ...(payload?.automation ?? {}) } });
  }

  useEffect(() => {
    if (!canAccess) return;
    loadReport().catch(() => setReport(emptyReport));
  }, [role]);

  useEffect(() => {
    if (!canAccess) return;
    loadReport(branch).catch(() => setReport(emptyReport));
  }, [branch]);

  const safeReport = report ?? emptyReport;

  const branchOptions = useMemo(() => {
    const names = safeReport.automation.branchManagers.map((item) => item.branch);
    if (safeReport.canViewAllBranches) {
      return ['all', ...names];
    }
    return [safeReport.scope || 'all'];
  }, [safeReport]);

  if (!canAccess) {
    return <div className="loading-state">Reports are available only to managers, executives, and admins.</div>;
  }

  if (!report) {
    return <div className="loading-state">Loading reports...</div>;
  }

  async function runConfirmedAction(action: Exclude<PendingAction, null>) {
    setBusy(action);
    setMessage('');
    setError('');
    try {
      if (action === 'close') {
        await api.runDayClose({ force: safeReport.closeStatus.state === 'closed' });
        setMessage('Day close completed.');
      }
      if (action === 'close-send') {
        await api.runDayClose({ sendEmail: true, force: safeReport.closeStatus.state === 'closed' });
        setMessage('Day close completed and summary email sent.');
      }
      if (action === 'resend') {
        await api.sendSummaryEmail({ resend: true });
        setMessage('Summary email resent.');
      }
      await loadReport(branch);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusy(null);
      setConfirmAction(null);
    }
  }

  return (
    <div className="mock-reports-page">
      <div className="mock-reports-toolbar">
        <label className="stack-field inline-field">
          <span>Branch scope</span>
          <select value={branch} onChange={(event) => setBranch(event.target.value)} disabled={!safeReport.canViewAllBranches}>
            {branchOptions.map((item) => (
              <option key={item} value={item}>{item === 'all' ? 'All branches' : item}</option>
            ))}
          </select>
        </label>
        <button className="ghost-button" type="button" onClick={() => setConfirmAction('close')} disabled={busy !== null}>Run day close</button>
        <button className="solid-button" type="button" onClick={() => setConfirmAction('close-send')} disabled={busy !== null}>Close + send email</button>
        <button className="ghost-button" type="button" onClick={() => setConfirmAction('resend')} disabled={busy !== null || safeReport.closeStatus.state !== 'closed'}>Resend summary</button>
      </div>

      {message ? <div className="banner-note">{message}</div> : null}
      {error ? <div className="banner-note error">{error}</div> : null}

      <div className="mock-reports-kpis">
        <Card className="metric-card" title="Yesterday sales"><strong>{money(safeReport.totals.totalSales)}</strong><p>{safeReport.date}</p></Card>
        <Card className="metric-card" title="Target"><strong>{money(safeReport.totals.target)}</strong><p>{safeReport.totals.targetAchievedPct}% achieved</p></Card>
        <Card className="metric-card" title="Variance"><strong>{money(safeReport.totals.varianceToTarget)}</strong><p>{safeReport.totals.varianceToTarget >= 0 ? 'Above target' : 'Behind target'}</p></Card>
        <Card className="metric-card" title="Transactions"><strong>{safeReport.totals.transactions}</strong><p>Across visible branches</p></Card>
      </div>

      <div className="split-grid">
        <Card title="Branch performance" subtitle="Yesterday totals by branch.">
          <div className="table-wrap">
            <table className="data-grid">
              <thead>
                <tr><th>Branch</th><th>Sales</th><th>Target</th><th>Variance</th></tr>
              </thead>
              <tbody>
                {safeReport.visibleBranches.length ? safeReport.visibleBranches.map((item) => (
                  <tr key={item.branch}>
                    <td>{item.branch}</td>
                    <td>{money(item.totalSales)}</td>
                    <td>{money(item.target)}</td>
                    <td>{money(item.varianceToTarget)}</td>
                  </tr>
                )) : <tr><td colSpan={4}>No branch data available.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Daily summary email preview" subtitle="Message sent after close.">
          <div className="email-preview-box">
            <strong>{safeReport.emailPreview.subject}</strong>
            <pre>{safeReport.emailPreview.body}</pre>
          </div>
        </Card>
      </div>

      {confirmAction ? (
        <div className="modal-scrim" role="presentation" onClick={() => setConfirmAction(null)}>
          <div className="confirm-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h3>Confirm action</h3>
            <p>
              {confirmAction === 'close' && 'This will save the current branch figures as the closed day snapshot.'}
              {confirmAction === 'close-send' && 'This will close the day and send the summary email.'}
              {confirmAction === 'resend' && 'This will send the latest closed summary again.'}
            </p>
            <div className="confirm-modal-actions">
              <button className="ghost-button" type="button" onClick={() => setConfirmAction(null)}>Cancel</button>
              <button className="solid-button" type="button" onClick={() => runConfirmedAction(confirmAction)}>Confirm</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ReportsPage;
