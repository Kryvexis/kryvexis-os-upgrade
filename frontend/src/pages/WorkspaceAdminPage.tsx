import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type {
  ImportJob,
  ImportPreview,
  RoleKey,
  WorkspaceAdminResponse,
  WorkspaceBranch,
  WorkspaceInvitePayload,
  WorkspaceUser
} from '../types';

type ViewState = {
  companyName: string;
  adminName: string;
  email: string;
  phone: string;
  businessType: string;
  currency: string;
  logoDataUrl?: string;
  logoFileName?: string;
  branches: WorkspaceBranch[];
};

type InviteState = WorkspaceInvitePayload;

const emptyPreview: ImportPreview = {
  importType: 'customers',
  columns: [],
  rowCount: 0,
  createCount: 0,
  warningCount: 0,
  errorCount: 0,
  mappings: [],
  issues: [],
  sampleRows: []
};

const emptyWorkspace: WorkspaceAdminResponse = {
  companyProfile: {
    companyName: 'Kryvexis Solutions',
    adminName: 'Antonie Meyer',
    email: 'kryvexissolutions@gmail.com',
    phone: '',
    businessType: 'Retail',
    currency: 'ZAR',
    branchCount: 1,
    primaryBranchId: 'JHB',
    branches: [{ id: 'JHB', name: 'Main Branch' }]
  },
  documentBranding: { companyName: 'Kryvexis Solutions' },
  branches: [{ id: 'JHB', name: 'Main Branch', managerName: 'Antonie Meyer', managerEmail: 'kryvexissolutions@gmail.com', isPrimary: true, active: true }],
  users: [],
  rolePolicies: [],
  importJobs: []
};

function toViewState(data: WorkspaceAdminResponse): ViewState {
  return {
    companyName: data.companyProfile.companyName,
    adminName: data.companyProfile.adminName,
    email: data.companyProfile.email,
    phone: data.companyProfile.phone || '',
    businessType: data.companyProfile.businessType || '',
    currency: data.companyProfile.currency,
    logoDataUrl: data.documentBranding.logoDataUrl,
    logoFileName: data.documentBranding.logoFileName,
    branches: data.branches
  };
}

function inferNavigationLabel(role: RoleKey) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function WorkspaceAdminPage() {
  const [data, setData] = useState<WorkspaceAdminResponse>(emptyWorkspace);
  const [view, setView] = useState<ViewState>(toViewState(emptyWorkspace));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<'company' | 'branches' | 'invite' | 'preview' | 'commit' | null>(null);
  const [invite, setInvite] = useState<InviteState>({ fullName: '', email: '', roleKey: 'manager', branchId: 'JHB', canManageRoles: false, canManageWorkspace: false });
  const [importType, setImportType] = useState('customers');
  const [importFilename, setImportFilename] = useState('');
  const [importContent, setImportContent] = useState('');
  const [preview, setPreview] = useState<ImportPreview>(emptyPreview);

  async function load() {
    const workspace = await api.workspaceAdmin();
    setData(workspace);
    setView(toViewState(workspace));
    setInvite((current) => ({ ...current, branchId: workspace.branches[0]?.id || current.branchId }));
  }

  useEffect(() => { load().catch(() => undefined); }, []);

  const activeBranches = useMemo(() => view.branches.filter((branch) => branch.active), [view.branches]);
  const workspaceHeadline = `${activeBranches.length} active branch${activeBranches.length === 1 ? '' : 'es'} • ${data.users.length} workspace user${data.users.length === 1 ? '' : 's'}`;
  const latestJob = data.importJobs[0];

  function updateBranch(index: number, patch: Partial<WorkspaceBranch>) {
    setView((current) => ({
      ...current,
      branches: current.branches.map((branch, branchIndex) => branchIndex === index ? { ...branch, ...patch } : branch)
    }));
  }

  function addBranch() {
    setView((current) => {
      const nextIndex = current.branches.length + 1;
      const nextId = `BR${nextIndex}`;
      return {
        ...current,
        branches: [...current.branches, { id: nextId, name: `Branch ${nextIndex}`, managerName: `Branch ${nextIndex} Lead`, managerEmail: `branch${nextIndex}@company.local`, isPrimary: false, active: true }]
      };
    });
  }

  async function onLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setView((current) => ({ ...current, logoDataUrl: String(reader.result || ''), logoFileName: file.name }));
    reader.readAsDataURL(file);
  }

  async function onImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportFilename(file.name);
    const content = await file.text();
    setImportContent(content);
  }

  async function saveCompany() {
    setBusy('company');
    setError('');
    setMessage('');
    try {
      const workspace = await api.updateWorkspaceCompany({
        companyName: view.companyName,
        adminName: view.adminName,
        email: view.email,
        phone: view.phone,
        businessType: view.businessType,
        currency: view.currency,
        logoDataUrl: view.logoDataUrl,
        logoFileName: view.logoFileName
      });
      setData(workspace);
      setView(toViewState(workspace));
      setMessage('Workspace company profile saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save company profile');
    } finally {
      setBusy(null);
    }
  }

  async function saveBranches() {
    setBusy('branches');
    setError('');
    setMessage('');
    try {
      const workspace = await api.saveWorkspaceBranches({
        primaryBranchId: view.branches.find((branch) => branch.isPrimary)?.id || view.branches[0]?.id || 'JHB',
        branches: view.branches.map((branch) => ({ id: branch.id, name: branch.name, managerName: branch.managerName, managerEmail: branch.managerEmail, active: branch.active }))
      });
      setData(workspace);
      setView(toViewState(workspace));
      setInvite((current) => ({ ...current, branchId: workspace.branches[0]?.id || current.branchId }));
      setMessage('Branch directory updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save branch settings');
    } finally {
      setBusy(null);
    }
  }

  async function inviteUser() {
    setBusy('invite');
    setError('');
    setMessage('');
    try {
      const workspace = await api.inviteWorkspaceUser(invite);
      setData(workspace);
      setInvite({ fullName: '', email: '', roleKey: 'manager', branchId: workspace.branches[0]?.id || 'JHB', canManageRoles: false, canManageWorkspace: false });
      setMessage('Workspace invite created.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to invite user');
    } finally {
      setBusy(null);
    }
  }

  async function previewImport() {
    setBusy('preview');
    setError('');
    setMessage('');
    try {
      const result = await api.previewImport({ importType, filename: importFilename || `${importType}.csv`, content: importContent });
      setPreview(result);
      setMessage('Import preview generated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to preview import');
    } finally {
      setBusy(null);
    }
  }

  async function commitImport() {
    setBusy('commit');
    setError('');
    setMessage('');
    try {
      const result = await api.commitImport({ importType, filename: importFilename || `${importType}.csv`, content: importContent });
      setData(result.workspace);
      setPreview(emptyPreview);
      setImportContent('');
      setImportFilename('');
      setMessage(`Import job ${result.importJob.id} recorded for ${result.importJob.importedCount} rows.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to commit import');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="page-grid workspace-admin-page">
      <Card title="Workspace Admin" subtitle="Company control, branches, access, and migration intake in one governed surface.">
        <div className="inventory-hero-grid workspace-admin-hero">
          <div>
            <strong className="hero-value compact-hero-value">{data.companyProfile.companyName}</strong>
            <p className="hero-support">{workspaceHeadline}</p>
          </div>
          <div className="hero-chip-stack horizontal-chips">
            <span className="hero-chip small-chip">{data.rolePolicies.filter((item) => item.canManageWorkspace).length} governance roles</span>
            <span className="hero-chip muted small-chip">Latest import: {latestJob ? latestJob.importType : 'None yet'}</span>
          </div>
        </div>
      </Card>

      {message ? <div className="banner-note">{message}</div> : null}
      {error ? <div className="banner-note error">{error}</div> : null}

      <div className="split-grid reports-split">
        <Card title="Company profile" subtitle="This drives workspace identity and document branding.">
          <div className="setting-list">
            <label className="stack-field"><span>Company name</span><input value={view.companyName} onChange={(e) => setView((current) => ({ ...current, companyName: e.target.value }))} /></label>
            <label className="stack-field"><span>Admin name</span><input value={view.adminName} onChange={(e) => setView((current) => ({ ...current, adminName: e.target.value }))} /></label>
            <label className="stack-field"><span>Admin email</span><input value={view.email} onChange={(e) => setView((current) => ({ ...current, email: e.target.value }))} /></label>
            <label className="stack-field"><span>Phone</span><input value={view.phone} onChange={(e) => setView((current) => ({ ...current, phone: e.target.value }))} /></label>
            <label className="stack-field"><span>Business type</span><input value={view.businessType} onChange={(e) => setView((current) => ({ ...current, businessType: e.target.value }))} /></label>
            <label className="stack-field"><span>Currency</span><select value={view.currency} onChange={(e) => setView((current) => ({ ...current, currency: e.target.value }))}><option value="ZAR">ZAR</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option></select></label>
            <label className="stack-field"><span>Quote &amp; invoice logo</span><input type="file" accept="image/*" onChange={onLogoChange} /></label>
            {view.logoDataUrl ? <div className="workspace-logo-preview"><img src={view.logoDataUrl} alt="Workspace logo" /><p>{view.logoFileName || 'Document logo ready'}</p></div> : null}
          </div>
          <div className="toolbar-actions"><button className="solid-button" type="button" onClick={saveCompany} disabled={busy !== null}>{busy === 'company' ? 'Saving…' : 'Save company profile'}</button></div>
        </Card>

        <Card title="Role guardrails" subtitle="This is the first pass before the final hardening phase.">
          <div className="history-table-wrap">
            <table className="data-grid history-table compact-table">
              <thead><tr><th>Role</th><th>Finance</th><th>Workspace</th><th>Role edits</th><th>Navigation focus</th></tr></thead>
              <tbody>
                {data.rolePolicies.map((policy) => (
                  <tr key={policy.roleKey}>
                    <td>{policy.label || inferNavigationLabel(policy.roleKey)}</td>
                    <td>{policy.canViewFinance ? 'Yes' : 'No'}</td>
                    <td>{policy.canManageWorkspace ? 'Yes' : 'No'}</td>
                    <td>{policy.canManageRoles ? 'Yes' : 'No'}</td>
                    <td>{policy.navigation.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="split-grid reports-split">
        <Card title="Branches" subtitle="Primary branch, managers, and active status all live here now.">
          <div className="notification-stack workspace-branch-stack">
            {view.branches.map((branch, index) => (
              <article key={branch.id} className="mini-list-row workspace-branch-row">
                <div className="workspace-branch-grid">
                  <label className="stack-field"><span>Branch ID</span><input value={branch.id} onChange={(e) => updateBranch(index, { id: e.target.value.toUpperCase().replace(/\s+/g, '-') })} /></label>
                  <label className="stack-field"><span>Name</span><input value={branch.name} onChange={(e) => updateBranch(index, { name: e.target.value })} /></label>
                  <label className="stack-field"><span>Manager</span><input value={branch.managerName} onChange={(e) => updateBranch(index, { managerName: e.target.value })} /></label>
                  <label className="stack-field"><span>Manager email</span><input value={branch.managerEmail} onChange={(e) => updateBranch(index, { managerEmail: e.target.value })} /></label>
                </div>
                <div className="workspace-branch-switches">
                  <label><input type="checkbox" checked={branch.isPrimary} onChange={() => setView((current) => ({ ...current, branches: current.branches.map((item, itemIndex) => ({ ...item, isPrimary: itemIndex === index })) }))} /> Primary</label>
                  <label><input type="checkbox" checked={branch.active} onChange={(e) => updateBranch(index, { active: e.target.checked })} /> Active</label>
                </div>
              </article>
            ))}
          </div>
          <div className="toolbar-actions"><button className="ghost-button" type="button" onClick={addBranch}>Add branch</button><button className="solid-button" type="button" onClick={saveBranches} disabled={busy !== null}>{busy === 'branches' ? 'Saving…' : 'Save branches'}</button></div>
        </Card>

        <Card title="Users & invites" subtitle="Add company users now; later phases will tighten deeper branch and tenant control.">
          <div className="setting-list">
            <label className="stack-field"><span>Full name</span><input value={invite.fullName} onChange={(e) => setInvite((current) => ({ ...current, fullName: e.target.value }))} /></label>
            <label className="stack-field"><span>Email</span><input value={invite.email} onChange={(e) => setInvite((current) => ({ ...current, email: e.target.value }))} /></label>
            <div className="split-grid">
              <label className="stack-field"><span>Role</span><select value={invite.roleKey} onChange={(e) => setInvite((current) => ({ ...current, roleKey: e.target.value as RoleKey }))}>{['admin','manager','executive','sales','finance','warehouse','procurement','operations'].map((role) => <option key={role} value={role}>{inferNavigationLabel(role as RoleKey)}</option>)}</select></label>
              <label className="stack-field"><span>Branch</span><select value={invite.branchId} onChange={(e) => setInvite((current) => ({ ...current, branchId: e.target.value }))}>{data.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
            </div>
            <label><input type="checkbox" checked={Boolean(invite.canManageWorkspace)} onChange={(e) => setInvite((current) => ({ ...current, canManageWorkspace: e.target.checked }))} /> Can manage workspace</label>
            <label><input type="checkbox" checked={Boolean(invite.canManageRoles)} onChange={(e) => setInvite((current) => ({ ...current, canManageRoles: e.target.checked }))} /> Can manage roles</label>
          </div>
          <div className="toolbar-actions"><button className="solid-button" type="button" onClick={inviteUser} disabled={busy !== null}>{busy === 'invite' ? 'Inviting…' : 'Create invite'}</button></div>
          <div className="history-table-wrap">
            <table className="data-grid history-table compact-table">
              <thead><tr><th>User</th><th>Role</th><th>Branch</th><th>Status</th><th>Controls</th></tr></thead>
              <tbody>
                {data.users.map((user: WorkspaceUser) => (
                  <tr key={user.id}>
                    <td><strong>{user.fullName}</strong><div className="muted-inline">{user.email}</div></td>
                    <td>{inferNavigationLabel(user.roleKey)}</td>
                    <td>{user.branchName}</td>
                    <td>{user.status}</td>
                    <td>{user.canManageWorkspace ? 'Workspace' : 'Standard'}{user.canManageRoles ? ' • Roles' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="split-grid reports-split">
        <Card title="Import Center v1" subtitle="Bring customers, products, stock, invoices, and payments into Kryvexis with a validation-first intake flow.">
          <div className="setting-list">
            <label className="stack-field"><span>Import type</span><select value={importType} onChange={(e) => setImportType(e.target.value)}><option value="customers">Customers</option><option value="products">Products</option><option value="stock">Stock on hand</option><option value="invoices">Invoices</option><option value="payments">Payments</option></select></label>
            <label className="stack-field"><span>Upload CSV</span><input type="file" accept=".csv,text/csv" onChange={onImportFile} /></label>
            <label className="stack-field"><span>Or paste CSV content</span><textarea rows={8} value={importContent} onChange={(e) => setImportContent(e.target.value)} placeholder="customer_name,email,phone\nAcme,accounts@acme.co.za,+27..." /></label>
          </div>
          <div className="toolbar-actions"><button className="ghost-button" type="button" onClick={previewImport} disabled={!importContent || busy !== null}>{busy === 'preview' ? 'Previewing…' : 'Preview import'}</button><button className="solid-button" type="button" onClick={commitImport} disabled={!importContent || preview.rowCount === 0 || busy !== null}>{busy === 'commit' ? 'Committing…' : 'Record import job'}</button></div>
        </Card>

        <Card title="Import validation" subtitle="Map first, validate second, commit third. No silent data drift.">
          <div className="notification-stack">
            <article className="mini-list-row"><div><strong>Rows detected</strong><p>{preview.importType}</p></div><div className="align-right"><strong>{preview.rowCount}</strong><p>{preview.createCount} ready</p></div></article>
            <article className="mini-list-row"><div><strong>Warnings</strong><p>Rows that can import but need review</p></div><div className="align-right"><strong>{preview.warningCount}</strong><p>watch</p></div></article>
            <article className="mini-list-row"><div><strong>Errors</strong><p>Rows blocked before commit</p></div><div className="align-right"><strong>{preview.errorCount}</strong><p>blocked</p></div></article>
          </div>
          <div className="history-table-wrap">
            <table className="data-grid history-table compact-table">
              <thead><tr><th>Source</th><th>Target</th><th>Sample</th></tr></thead>
              <tbody>{preview.mappings.map((mapping) => <tr key={mapping.source}><td>{mapping.source}</td><td>{mapping.target}</td><td>{mapping.sample}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="notification-stack">
            {preview.issues.slice(0, 5).map((issue) => <article key={`${issue.row}-${issue.message}`} className="mini-list-row"><div><strong>{issue.level.toUpperCase()}</strong><p>Row {issue.row}{issue.column ? ` • ${issue.column}` : ''}</p></div><div className="align-right"><p>{issue.message}</p></div></article>)}
          </div>
        </Card>
      </div>

      <Card title="Import history" subtitle="Every intake run is logged so migration work stays auditable.">
        <div className="history-table-wrap">
          <table className="data-grid history-table compact-table">
            <thead><tr><th>Job</th><th>File</th><th>Status</th><th>Rows</th><th>Imported</th><th>Warnings</th><th>Errors</th></tr></thead>
            <tbody>
              {data.importJobs.map((job: ImportJob) => (
                <tr key={job.id}>
                  <td><strong>{job.importType}</strong><div className="muted-inline">{job.createdAt}</div></td>
                  <td>{job.filename}</td>
                  <td>{job.status}</td>
                  <td>{job.rowCount}</td>
                  <td>{job.importedCount}</td>
                  <td>{job.warningCount}</td>
                  <td>{job.errorCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
