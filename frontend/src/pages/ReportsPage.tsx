import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { ReportsResponse, RoleKey } from '../types';

type PendingAction = 'close' | 'close-send' | 'resend' | null;

type BranchManager = { branch: string; manager?: string; email?: string };

function money(value: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 })
    .format(value)
    .replace('ZAR', 'R')
    .replace(/\u00a0/g, ' ');
}

function safeArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

export function ReportsPage({ role }: { role: RoleKey }) {
  const [branch, setBranch] = useState('all');
  const [report, setReport] = useState<ReportsResponse | null>(null);
  const [busy, setBusy] = useState<PendingAction>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
    loadReport().catch((err) => setError(err instanceof Error ? err.message : 'Failed to load reports'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    if (!canAccess) return;
    loadReport(branch).catch((err) => setError(err instanceof Error ? err.message : 'Failed to load reports'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch]);

  const normalized = useMemo(() => {
    if (!report) return null;

    const automation = (report as ReportsResponse & { automation?: any }).automation ?? {};
    const branchManagers = safeArray<BranchManager>(automation.branchManagers);

    return {
      ...report,
      visibleBranches: safeArray(report.visibleBranches),
      sellerBoard: safeArray(report.sellerBoard),
      auditTrail: safeArray((report as ReportsResponse & { auditTrail?: any[] }).auditTrail),
      emailDispatches: safeArray((report as ReportsResponse & { emailDispatches?: any[] }).emailDispatches),
      dayCloseHistory: safeArray((report as ReportsResponse & { dayCloseHistory?: any[] }).dayCloseHistory),
      branchCloseHistory: safeArray((report as ReportsResponse & { branchCloseHistory?: any[] }).branchCloseHistory),
      emailPreview: report.emailPreview ?? { subject: 'Daily Sales Summary', body: 'Summary preview unavailable.' },
      closeStatus: (report as ReportsResponse & { closeStatus?: any }).closeStatus ?? { state: 'open', label: 'Open', lastClosedAt: null },
      sendStatus: (report as ReportsResponse & { sendStatus?: any }).sendStatus ?? { state: 'pending', label: 'Pending send', lastSentAt: null, duplicateBlocked: false },
      automation: {
        triggerMode: automation.triggerMode ?? 'manual-close',
        closeTime: automation.closeTime ?? '18:00',
        sendToManagers: Boolean(automation.sendToManagers),
        sendToExecutives: Boolean(automation.sendToExecutives),
        managerRecipients: safeArray<string>(automation.managerRecipients),
        executiveRecipients: safeArray<string>(automation.executiveRecipients),
        branchManagers
      },
      branchManagers
    };
  }, [report]);

  const branchOptions = useMemo(() => {
    if (!normalized) return [];
    const names = normalized.branchManagers.map((item) => item.branch);
    return normalized.canViewAllBranches ? ['all', ...names] : [normalized.scope];
  }, [normalized]);

  if (!canAccess) {
    return <div className="loading-state">Reports are available only to managers, executives, and admins.</div>;
  }

  if (!normalized) return <div className="loading-state">Loading reports...</div>;

  async function runAction(action: Exclude<PendingAction, null>) {
    setBusy(action);
    setMessage('');
    setError('');
    try {
      if (action === 'close') {
        await api.runDayClose({ force: normalized.closeStatus.state === 'closed' });
        setMessage(normalized.closeStatus.state === 'closed' ? 'Day close rerun and snapshot replaced.' : 'Day close completed and snapshot saved.');
      }
      if (action === 'close-send') {
        await api.runDayClose({ sendEmail: true, force: normalized.closeStatus.state === 'closed' });
        setMessage(normalized.closeStatus.state === 'closed' ? 'Day close rerun and summary email resent.' : 'Day close completed and summary email sent.');
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
    }
  }

  return (
    <div className="page-grid reports-mockup-grid">
      <div className="reports-mockup-toolbar">
        <label className="stack-field inline-field compact-field">
          <span>Branch scope</span>
          <select value={branch} onChange={(event) => setBranch(event.target.value)} disabled={!normalized.canViewAllBranches}>
            {branchOptions.map((item) => (
              <option key={item} value={item}>{item === 'all' ? 'All branches' : item}</option>
            ))}
          </select>
        </label>
        <button className="ghost-button" type="button" onClick={() => runAction('close')} disabled={busy !== null}>
          {busy === 'close' ? 'Running close…' : 'Run day close'}
        </button>
        <button className="solid-button" type="button" onClick={() => runAction('close-send')} disabled={busy !== null}>
          {busy === 'close-send' ? 'Closing…' : 'Close + send email'}
        </button>
        <button className="ghost-button" type="button" onClick={() => runAction('resend')} disabled={busy !== null || normalized.closeStatus.state !== 'closed'}>
          {busy === 'resend' ? 'Resending…' : 'Resend summary'}
        </button>
      </div>

      {message ? <div className="banner-note">{message}</div> : null}
      {error ? <div className="banner-note error">{error}</div> : null}

      <div className="kpi-grid compact-kpi-grid reports-kpi-grid">
        <Card className="metric-card" title="Yesterday sales"><strong>{money(normalized.totals.totalSales)}</strong><p>{normalized.date}</p></Card>
        <Card className="metric-card" title="Target"><strong>{money(normalized.totals.target)}</strong><p>{normalized.totals.targetAchievedPct}% achieved</p></Card>
        <Card className="metric-card" title="Variance"><strong>{money(normalized.totals.varianceToTarget)}</strong><p>{normalized.totals.varianceToTarget >= 0 ? 'Above target' : 'Behind target'}</p></Card>
        <Card className="metric-card" title="Transactions"><strong>{normalized.totals.transactions}</strong><p>Across visible branches</p></Card>
      </div>

      <div className="split-grid reports-mockup-panels reports-mockup-panels-top">
        <Card title="Branch performance" subtitle="Yesterday totals, target attainment, and basket quality by branch." className="reports-panel-card">
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
                {normalized.visibleBranches.map((item) => (
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

        <Card title="Seller leaderboard" subtitle="Keep this operational: who is moving the number against their own target?" className="reports-panel-card compact-stack-card">
          <div className="notification-stack compact-report-stack">
            {normalized.sellerBoard.map((seller) => {
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
            {!normalized.sellerBoard.length ? <div className="loading-state">No seller data available.</div> : null}
          </div>
        </Card>
      </div>

      <div className="split-grid reports-mockup-panels">
        <Card title="Daily summary email preview" subtitle="This is the message the boss or managers receive after close." className="reports-panel-card">
          <div className="email-preview-box mockup-email-preview">
            <strong>{normalized.emailPreview.subject}</strong>
            <pre>{normalized.emailPreview.body}</pre>
          </div>
        </Card>

        <Card title="Automation status" subtitle="Stored recipient rules and live delivery readiness." className="reports-panel-card compact-stack-card">
          <div className="setting-list compact-setting-list">
            <div><span>Close status</span><strong>{normalized.closeStatus.label}</strong></div>
            <div><span>Email status</span><strong>{normalized.sendStatus.label}</strong></div>
            <div><span>Trigger mode</span><strong>{normalized.automation.triggerMode}</strong></div>
            <div><span>Close time</span><strong>{normalized.automation.closeTime}</strong></div>
            <div><span>Managers receive</span><strong>{normalized.automation.sendToManagers ? 'Yes' : 'No'}</strong></div>
            <div><span>Executives receive</span><strong>{normalized.automation.sendToExecutives ? 'Yes' : 'No'}</strong></div>
            <div><span>Manager recipients</span><strong>{normalized.automation.managerRecipients.join(', ') || 'None set'}</strong></div>
            <div><span>Executive recipients</span><strong>{normalized.automation.executiveRecipients.join(', ') || 'None set'}</strong></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ReportsPage;
