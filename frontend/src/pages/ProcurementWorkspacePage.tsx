import { Link } from 'react-router-dom';

const purchaseOrders = [
  { id: 'PO-3101', supplier: 'Cape Paper Supply', status: 'Pending approval', branch: 'Cape Town', value: 'R18,240' },
  { id: 'PO-3097', supplier: 'Prime Devices', status: 'Issued', branch: 'Johannesburg', value: 'R42,880' },
  { id: 'PO-3092', supplier: 'Northline Industrial', status: 'Goods received', branch: 'Durban', value: 'R9,640' }
];

function WorkspaceBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="workspace-block static-block">
      <div className="workspace-icon" />
      <div className="workspace-block-copy">
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </div>
  );
}

export function ProcurementWorkspacePage() {
  return (
    <div className="module-page-grid">
      <section className="module-hero-card">
        <div className="module-hero-copy">
          <p className="eyebrow">Procurement workspace</p>
          <h2>POs, suppliers, reorders, and goods received live under one procurement module.</h2>
          <p className="module-subcopy">Purchase Orders sit at the center of the issue-to-receipt workflow instead of being buried in flat links.</p>
        </div>
        <div className="module-chip-row">
          <span className="module-chip">1 pending PO</span>
          <span className="module-chip">3 suppliers</span>
          <span className="module-chip">1 receipt due</span>
        </div>
      </section>

      <section className="module-board">
        <div className="module-board-head">
          <div>
            <strong className="module-board-count">5</strong>
            <p>Procurement control blocks with purchase orders at the center.</p>
          </div>
        </div>
        <div className="workspace-block-grid two-up plus-single">
          <WorkspaceBlock title="Suppliers" body="Commercial partners, lead times, and contact ownership." />
          <WorkspaceBlock title="Purchase Orders" body="PO queue, approvals, and issue-to-receipt flow." />
          <WorkspaceBlock title="Reorders" body="Threshold-driven reorder candidates and follow-up." />
          <WorkspaceBlock title="Goods Received" body="Inbound stock acknowledgement and receiving control." />
          <WorkspaceBlock title="Supplier Bills" body="Bills matched against deliveries and PO references." />
        </div>
      </section>

      <section className="module-watch-card">
        <div className="card-header compact-card-header">
          <div>
            <h3>PO queue</h3>
            <p>The live purchase order foundation you asked for.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-grid">
            <thead>
              <tr>
                <th>PO</th>
                <th>Supplier</th>
                <th>Status</th>
                <th>Branch</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((item) => (
                <tr key={item.id}>
                  <td><Link to="/procurement" className="row-link">{item.id}</Link></td>
                  <td>{item.supplier}</td>
                  <td>{item.status}</td>
                  <td>{item.branch}</td>
                  <td>{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
