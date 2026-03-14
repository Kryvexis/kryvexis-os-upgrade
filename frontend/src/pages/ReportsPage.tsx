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
  scope: 'Johannesburg',
  date: new Date().toISOString().slice(0, 10),
  canViewAllBranches: true,
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
    managerRecipients: ['manager@kryvexis.local'],
    executiveRecipients: ['boss@kryvexis.local'],
    defaultManagerBranch: 'Johannesburg',
    branchManagers: [
      { branch: 'Johannesburg', manager: 'Nadine Smit', email: 'jhb.manager@kryvexis.local' },
      { branch: 'Cape Town', manager: 'Rina Patel', email: 'cpt.manager@kryvexis.local' },
      { branch: 'Durban', manager: 'Tariq Naidoo', email: 'dbn.manager@kryvexis.local' }
    ]
  },
  closeStatus: { date: new Date().toISOString().slice(0, 10), state: 'open', label: 'Open', lastClosedAt: null, lastClosedBy: null, recordId: null },
  sendStatus: { state: 'not-ready', label: 'Waiting for close', lastSentAt: null, duplicateBlocked: false, lastDispatchId: null },
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
    try {
      const data = await api.reports(role, selectedBranch);
      const safe = {
        ...emptyReport,
        ...data,
        automation: {
          ...emptyReport.automation,
          ...(data?.automation ?? {})
        }
      };
      setReport(safe);
      if (selectedBranch !== safe.scope && selectedBranch !== 'all' && !safe.canViewAllBranches) {
        setBranch(safe.scope);
      }
    } catch {
      setReport(emptyReport);
    }
  }

  useEffect(() => {
    if (!canAccess) return;
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    if (!canAccess) return;
    loadReport(branch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch]);

  const branchOptions = useMemo(() => {
    const branchManagers = report?.automation?.branchManagers ?? emptyReport.automation.branchManagers;
    const names = branchManagers.map((item) => item.branch);
    const safeScope = report?.scope ?? emptyReport.scope;
    return Array.from(new Set(['all', safeScope, ...names]));
  }, [report]);

  if (!canAccess) {
    return <div className="loading-state">Reports are available only to managers, executives, and admins.</div>;
  }

  if (!report) return <div className="loading-state">Loading reports...</div>;

  async function runConfirmedAction(action: Exclude<PendingAction, null>) {
    setBusy(action);
    setMessage('');
    setError('');
    try {
      if (action === 'close') {
        await api.runDayClose({ force: report.closeStatus.state === 'closed' });
        setMessage(report.closeStatus.state === 'closed' ? 'Day close rerun and snapshot replaced.' : 'Day close completed and snapshot saved.');
      }
      if (action === 'close-send') {
        await api.runDayClose({ sendEmail: true, force: report.closeStatus.state === 'closed' });
        setMessage(report.closeStatus.state === 'closed' ? 'Day close rerun and summary email resent.' : 'Day close completed and summary email sent.');
      }
      if (action === 'resend') {
        await api.sendSummaryEmail({ resend: true });
        setMessage('Summary email resent from the latest closed snapshot.');
      }
      await loadReport(branch);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusy(null);
      setConfirmAction(null);
    }
  }

  const statusTone = report.closeStatus.state === 'closed' ? 'ok' : 'warning';
  const sendTone = report.sendStatus.state === 'sent' ? 'ok' : report.sendStatus.state === 'pending' ? 'warning' : 'neutral';

  return (
    <div className="page-grid reports-layout">
      <div className="toolbar-actions reports-toolbar">
        <label className="stack-field inline-field">
          <span>Branch scope</span>
          <select value={branch} onChange={(event) => setBranch(event.target.value)}>
            {branchOptions.map((item) => (
              <option key={item} value={item}>{item === 'all' ? 'All branches' : item}</option>
            ))}
          </select>
        </label>
        <button className="ghost-button" type="button" onClick={() => setConfirmAction('close')} disabled={busy !== null}>
          {busy === 'close' ? 'Running close…' : 'Run day close'}
        </button>
        <button className="solid-button" type="button" onClick={() => setConfirmAction('close-send')} disabled={busy !== null}>
          {busy === 'close-send' ? 'Closing…' : 'Close + send email'}
        </button>
        <button className="ghost-button" type="button" onClick={() => setConfirmAction('resend')} disabled={busy !== null || report.closeStatus.state !== 'closed'}>
          {busy === 'resend' ? 'Resending…' : 'Resend summary'}
        </button>
      </div>

      <div className="status-strip-grid">
        <div className={`status-strip-card ${statusTone}`}>
          <span>Close status</span>
          <strong>{report.closeStatus.label}</strong>
          <p>{report.closeStatus.lastClosedAt ? `Last close ${new Date(report.closeStatus.lastClosedAt).toLocaleString()}` : 'No saved close yet'}</p>
        </div>
        <div className={`status-strip-card ${sendTone}`}>
          <span>Email status</span>
          <strong>{report.sendStatus.label}</strong>
          <p>{report.sendStatus.lastSentAt ? `Last email ${new Date(report.sendStatus.lastSentAt).toLocaleString()}` : 'Waiting for first summary email'}</p>
        </div>
      </div>

      {message ? <div className="banner-note">{message}</div> : null}
      {error ? <div className="banner-note error">{error}</div> : null}

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
                {report.visibleBranches.length ? report.visibleBranches.map((item) => (
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
                )) : (
                  <tr><td colSpan={6}>No branch figures available yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Seller leaderboard" subtitle="Keep this operational: who is moving the number against their own target?">
          <div className="notification-stack">
            {report.sellerBoard.length ? report.sellerBoard.map((seller) => {
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
            }) : <div className="loading-state">No seller data available yet.</div>}
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

        <Card title="Automation status" subtitle="Stored recipient rules and live delivery readiness.">
          <div className="setting-list">
            <div><span>Selected branch</span><strong>{branch === 'all' ? 'All branches' : branch}</strong></div>
            <div><span>Trigger mode</span><strong>{report.automation.triggerMode}</strong></div>
            <div><span>Close time</span><strong>{report.automation.closeTime}</strong></div>
            <div><span>Managers receive</span><strong>{report.automation.sendToManagers ? 'Yes' : 'No'}</strong></div>
            <div><span>Executives receive</span><strong>{report.automation.sendToExecutives ? 'Yes' : 'No'}</strong></div>
            <div><span>Manager recipients</span><strong>{report.automation.managerRecipients.join(', ')}</strong></div>
            <div><span>Executive recipients</span><strong>{report.automation.executiveRecipients.join(', ')}</strong></div>
          </div>
        </Card>
      </div>

      {confirmAction ? (
        <div className="modal-scrim" role="presentation" onClick={() => setConfirmAction(null)}>
          <div className="confirm-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h3>
              {confirmAction === 'close' ? 'Confirm day close' : confirmAction === 'close-send' ? 'Confirm close and send' : 'Confirm resend'}
            </h3>
            <p>
              {confirmAction === 'close' && report.closeStatus.state === 'closed'
                ? 'This day is already closed. Confirming again will replace the saved close snapshot for this date.'
                : null}
              {confirmAction === 'close' && report.closeStatus.state !== 'closed'
                ? 'This will lock the current figures into the close history for the selected date.'
                : null}
              {confirmAction === 'close-send' && report.closeStatus.state === 'closed'
                ? 'This day is already closed. Confirming again will replace the close snapshot and send a fresh summary email.'
                : null}
              {confirmAction === 'close-send' && report.closeStatus.state !== 'closed'
                ? 'This will lock the day and send the branch summary email immediately.'
                : null}
              {confirmAction === 'resend'
                ? 'This will send the latest closed summary again and keep the original close record intact.'
                : null}
            </p>
            <div className="confirm-modal-actions">
              <button className="ghost-button" type="button" onClick={() => setConfirmAction(null)}>Cancel</button>
              <button className="solid-button" type="button" onClick={() => runConfirmedAction(confirmAction)}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ReportsPage;
