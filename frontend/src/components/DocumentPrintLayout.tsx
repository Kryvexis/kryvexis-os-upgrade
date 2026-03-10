import type { ReactNode } from 'react';

type PartyMeta = {
  label: string;
  value: string;
};

type DocumentLine = {
  id: string;
  sku: string;
  description: string;
  qty: number;
  unitPrice: string;
  total: string;
};

type Totals = {
  subtotal?: string;
  tax?: string;
  total: string;
};

type Props = {
  kind: 'Quote' | 'Invoice';
  id: string;
  status: string;
  title: string;
  subtitle: string;
  customerName: string;
  branch: string;
  ownerLabel: string;
  ownerValue: string;
  issuedLabel: string;
  issuedValue: string;
  dueLabel?: string;
  dueValue?: string;
  meta: PartyMeta[];
  lines: DocumentLine[];
  totals: Totals;
  notes?: string;
  supportEmail?: string;
  whatsapp?: string;
  sourceLabel?: string;
  sourceValue?: ReactNode;
};

export function DocumentPrintLayout({
  kind,
  id,
  status,
  title,
  subtitle,
  customerName,
  branch,
  ownerLabel,
  ownerValue,
  issuedLabel,
  issuedValue,
  dueLabel,
  dueValue,
  meta,
  lines,
  totals,
  notes,
  supportEmail,
  whatsapp,
  sourceLabel,
  sourceValue
}: Props) {
  return (
    <div className="print-page-shell">
      <div className="print-toolbar no-print">
        <button className="solid-button" onClick={() => window.print()}>Print now</button>
        <button className="ghost-button" onClick={() => window.history.back()}>Back</button>
      </div>

      <article className="document-sheet">
        <header className="document-header">
          <div>
            <p className="document-kicker">Kryvexis OS</p>
            <h1>{title}</h1>
            <p className="document-subtitle">{subtitle}</p>
          </div>
          <div className="document-status-block">
            <span className="document-badge">{kind}</span>
            <strong>{id}</strong>
            <span>{status}</span>
          </div>
        </header>

        <section className="document-brand-row">
          <div className="document-brand-card">
            <p className="document-section-label">Prepared for</p>
            <h2>{customerName}</h2>
            <p>{branch} branch workflow</p>
          </div>
          <div className="document-brand-card align-right">
            <p className="document-section-label">Kryvexis Solutions</p>
            <p>{supportEmail ?? 'kryvexissolutions@gmail.com'}</p>
            <p>{whatsapp ?? '+27686282874'}</p>
          </div>
        </section>

        <section className="document-meta-grid">
          <div className="document-meta-card">
            <p className="document-section-label">Document details</p>
            <div className="document-meta-list">
              <div><span>{ownerLabel}</span><strong>{ownerValue}</strong></div>
              <div><span>{issuedLabel}</span><strong>{issuedValue}</strong></div>
              {dueLabel && dueValue ? <div><span>{dueLabel}</span><strong>{dueValue}</strong></div> : null}
              {sourceLabel && sourceValue ? <div><span>{sourceLabel}</span><strong>{sourceValue}</strong></div> : null}
            </div>
          </div>
          <div className="document-meta-card">
            <p className="document-section-label">Commercial context</p>
            <div className="document-meta-list">
              {meta.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="document-lines">
          <div className="document-table-wrap">
            <table className="document-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id}>
                    <td>{line.sku}</td>
                    <td>{line.description}</td>
                    <td>{line.qty}</td>
                    <td>{line.unitPrice}</td>
                    <td>{line.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="document-summary-row">
          <div className="document-note-card">
            <p className="document-section-label">Notes</p>
            <p>{notes ?? 'Prepared inside Kryvexis OS. Print-ready foundation for later PDF saving and communication workflows.'}</p>
          </div>
          <div className="document-total-card">
            {totals.subtotal ? <div><span>Subtotal</span><strong>{totals.subtotal}</strong></div> : null}
            {totals.tax ? <div><span>Tax</span><strong>{totals.tax}</strong></div> : null}
            <div className="document-grand-total"><span>Total</span><strong>{totals.total}</strong></div>
          </div>
        </section>

        <footer className="document-footer">
          <span>Generated from Kryvexis OS operational workflow</span>
          <span>{kind} print foundation · Phase C</span>
        </footer>
      </article>
    </div>
  );
}
