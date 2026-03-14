import { useEffect, useMemo, useState } from 'react';

type BranchRow = { branch?: string; sales?: number; target?: number; variance?: number; transactions?: number; };
type LeaderboardRow = { name?: string; branch?: string; sales?: number; targetPercent?: number; };
type AutomationSettings = {
  triggerMode?: string;
  closeTime?: string;
  sendToManagers?: boolean;
  sendToExecutives?: boolean;
  managerRecipients?: string[];
  executiveRecipients?: string[];
};
type EmailDispatch = { id?: string; branch?: string; sentAt?: string; recipient?: string; status?: string; };
type CloseHistory = { id?: string; branch?: string; closedAt?: string; closedBy?: string; status?: string; };
type ReportsResponse = {
  branchScope?: string[];
  selectedBranch?: string;
  yesterdaySales?: number;
  target?: number;
  variance?: number;
  transactions?: number;
  branchPerformance?: BranchRow[];
  sellerLeaderboard?: LeaderboardRow[];
  dailySummaryPreview?: string;
  automation?: AutomationSettings;
  emailDispatches?: EmailDispatch[];
  dayCloseHistory?: CloseHistory[];
};

const money = (value?: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(Number.isFinite(value as number) ? (value as number) : 0);

const panel: React.CSSProperties = {
  background: 'linear-gradient(180deg, rgba(14,22,52,0.96), rgba(8,14,34,0.98))',
  border: '1px solid rgba(83, 111, 175, 0.24)',
  borderRadius: 20,
  padding: 20,
  boxShadow: '0 14px 30px rgba(0,0,0,0.22)',
};

async function fetchReports(): Promise<ReportsResponse> {
  const response = await fetch('/api/reports', { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Failed to load reports (${response.status})`);
  const raw = (await response.json()) as ReportsResponse | null;
  return {
    branchScope: raw?.branchScope ?? ['Johannesburg'],
    selectedBranch: raw?.selectedBranch ?? raw?.branchScope?.[0] ?? 'Johannesburg',
    yesterdaySales: raw?.yesterdaySales ?? 0,
    target: raw?.target ?? 0,
    variance: raw?.variance ?? 0,
    transactions: raw?.transactions ?? 0,
    branchPerformance: Array.isArray(raw?.branchPerformance) ? raw!.branchPerformance : [],
    sellerLeaderboard: Array.isArray(raw?.sellerLeaderboard) ? raw!.sellerLeaderboard : [],
    dailySummaryPreview: raw?.dailySummaryPreview ?? 'Daily summary preview is not available yet.',
    automation: {
      triggerMode: raw?.automation?.triggerMode ?? 'manual-close',
      closeTime: raw?.automation?.closeTime ?? '18:00',
      sendToManagers: raw?.automation?.sendToManagers ?? true,
      sendToExecutives: raw?.automation?.sendToExecutives ?? true,
      managerRecipients: Array.isArray(raw?.automation?.managerRecipients) ? raw!.automation!.managerRecipients : [],
      executiveRecipients: Array.isArray(raw?.automation?.executiveRecipients) ? raw!.automation!.executiveRecipients : [],
    },
    emailDispatches: Array.isArray(raw?.emailDispatches) ? raw!.emailDispatches : [],
    dayCloseHistory: Array.isArray(raw?.dayCloseHistory) ? raw!.dayCloseHistory : [],
  };
}

export default function ReportsPage() {
  const [report, setReport] = useState<ReportsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branch, setBranch] = useState('');

  useEffect(() => {
    let active = true;
    fetchReports()
      .then((data) => {
        if (!active) return;
        setReport(data);
        setBranch(data.selectedBranch ?? data.branchScope?.[0] ?? 'Johannesburg');
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load reports');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(() => {
    const base = report?.branchPerformance ?? [];
    if (!branch || branch === 'All branches') return base;
    return base.filter((row) => row.branch === branch);
  }, [report, branch]);

  return (
    <div style={{ padding: 24, color: '#eef4ff', display: 'grid', gap: 16 }}>
      <section style={{ ...panel, paddingBottom: 18 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.2, opacity: 0.65 }}>Module / Reports</div>
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginTop: 6 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 40, lineHeight: 1, fontWeight: 800 }}>Reports</h1>
            <div style={{ marginTop: 8, opacity: 0.72 }}>Locked layout hotfix: stable mockup-style reporting screen.</div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', opacity: 0.65, marginBottom: 6 }}>Branch scope</label>
            <select value={branch} onChange={(e) => setBranch(e.target.value)} style={{ minWidth: 220, padding: '11px 12px', borderRadius: 14, background: 'rgba(12,22,48,0.96)', color: '#eef4ff', border: '1px solid rgba(83, 111, 175, 0.3)' }}>
              {(report?.branchScope ?? ['Johannesburg']).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>
        {error ? <div style={{ marginTop: 14, color: '#ffb6b6' }}>{error}</div> : null}
      </section>

      {loading ? <section style={panel}>Loading reports…</section> : (
        <>
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
            <div style={panel}><div style={{ opacity: 0.7 }}>Yesterday sales</div><div style={{ fontSize: 36, fontWeight: 800, marginTop: 10 }}>{money(report?.yesterdaySales)}</div></div>
            <div style={panel}><div style={{ opacity: 0.7 }}>Target</div><div style={{ fontSize: 36, fontWeight: 800, marginTop: 10 }}>{money(report?.target)}</div></div>
            <div style={panel}><div style={{ opacity: 0.7 }}>Variance</div><div style={{ fontSize: 36, fontWeight: 800, marginTop: 10 }}>{money(report?.variance)}</div></div>
            <div style={panel}><div style={{ opacity: 0.7 }}>Transactions</div><div style={{ fontSize: 36, fontWeight: 800, marginTop: 10 }}>{report?.transactions ?? 0}</div></div>
          </section>

          <section style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 16 }}>
            <div style={panel}>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Branch performance</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', opacity: 0.65 }}>
                    <th style={{ padding: '10px 8px' }}>Branch</th>
                    <th style={{ padding: '10px 8px' }}>Sales</th>
                    <th style={{ padding: '10px 8px' }}>Target</th>
                    <th style={{ padding: '10px 8px' }}>Variance</th>
                    <th style={{ padding: '10px 8px' }}>Txns</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length ? rows.map((row, index) => (
                    <tr key={`${row.branch ?? 'row'}-${index}`} style={{ borderTop: '1px solid rgba(83, 111, 175, 0.15)' }}>
                      <td style={{ padding: '12px 8px' }}>{row.branch ?? '—'}</td>
                      <td style={{ padding: '12px 8px' }}>{money(row.sales)}</td>
                      <td style={{ padding: '12px 8px' }}>{money(row.target)}</td>
                      <td style={{ padding: '12px 8px' }}>{money(row.variance)}</td>
                      <td style={{ padding: '12px 8px' }}>{row.transactions ?? 0}</td>
                    </tr>
                  )) : <tr><td colSpan={5} style={{ padding: '12px 8px', opacity: 0.65 }}>No branch rows available.</td></tr>}
                </tbody>
              </table>
            </div>
            <div style={panel}>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Seller leaderboard</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {(report?.sellerLeaderboard ?? []).length ? (report?.sellerLeaderboard ?? []).map((seller, index) => (
                  <div key={`${seller.name ?? 'seller'}-${index}`} style={{ border: '1px solid rgba(83, 111, 175, 0.18)', borderRadius: 16, padding: 14, background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ fontWeight: 700 }}>{seller.name ?? 'Unknown seller'}</div>
                    <div style={{ opacity: 0.72, marginTop: 4 }}>{seller.branch ?? '—'}</div>
                    <div style={{ marginTop: 8 }}>{money(seller.sales)} · {seller.targetPercent ?? 0}% of target</div>
                  </div>
                )) : <div style={{ opacity: 0.65 }}>No seller data available.</div>}
              </div>
            </div>
          </section>

          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={panel}>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Daily summary email preview</div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65, opacity: 0.9 }}>{report?.dailySummaryPreview ?? 'No summary available.'}</div>
            </div>
            <div style={panel}>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Automation status</div>
              <div style={{ display: 'grid', gap: 10 }}>
                <div>Trigger mode: <strong>{report?.automation?.triggerMode ?? 'manual-close'}</strong></div>
                <div>Close time: <strong>{report?.automation?.closeTime ?? '18:00'}</strong></div>
                <div>Managers receive: <strong>{report?.automation?.sendToManagers ? 'Yes' : 'No'}</strong></div>
                <div>Executives receive: <strong>{report?.automation?.sendToExecutives ? 'Yes' : 'No'}</strong></div>
                <div>Manager recipients: <strong>{(report?.automation?.managerRecipients ?? []).join(', ') || '—'}</strong></div>
                <div>Executive recipients: <strong>{(report?.automation?.executiveRecipients ?? []).join(', ') || '—'}</strong></div>
              </div>
            </div>
          </section>

          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={panel}>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Email dispatch log</div>
              {(report?.emailDispatches ?? []).length ? (report?.emailDispatches ?? []).map((item, index) => (
                <div key={`${item.id ?? 'email'}-${index}`} style={{ padding: '12px 0', borderTop: index ? '1px solid rgba(83, 111, 175, 0.15)' : 'none' }}>
                  <div><strong>{item.status ?? 'sent'}</strong> · {item.branch ?? '—'}</div>
                  <div style={{ opacity: 0.72 }}>{item.recipient ?? '—'} · {item.sentAt ?? '—'}</div>
                </div>
              )) : <div style={{ opacity: 0.65 }}>No dispatches yet.</div>}
            </div>
            <div style={panel}>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Day close history</div>
              {(report?.dayCloseHistory ?? []).length ? (report?.dayCloseHistory ?? []).map((item, index) => (
                <div key={`${item.id ?? 'close'}-${index}`} style={{ padding: '12px 0', borderTop: index ? '1px solid rgba(83, 111, 175, 0.15)' : 'none' }}>
                  <div><strong>{item.branch ?? '—'}</strong> · {item.status ?? 'closed'}</div>
                  <div style={{ opacity: 0.72 }}>{item.closedBy ?? 'System'} · {item.closedAt ?? '—'}</div>
                </div>
              )) : <div style={{ opacity: 0.65 }}>No close history yet.</div>}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
