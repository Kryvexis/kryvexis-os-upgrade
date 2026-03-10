import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DocumentPrintLayout } from '../components/DocumentPrintLayout';
import { api } from '../lib/api';
import type { InvoiceDetail, Settings } from '../types';

export function InvoicePrintPage() {
  const { id = '' } = useParams();
  const [item, setItem] = useState<InvoiceDetail | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.invoice(id), api.settings()])
      .then(([invoice, appSettings]) => {
        setItem(invoice);
        setSettings(appSettings);
      })
      .catch((err: Error) => setError(err.message));
  }, [id]);

  if (error && !item) return <div className="loading-state print-loading">{error}</div>;
  if (!item) return <div className="loading-state print-loading">Loading print view...</div>;

  return (
    <DocumentPrintLayout
      kind="Invoice"
      id={item.id}
      status={item.status}
      title="Invoice document"
      subtitle="Print-ready invoice output with source quote traceability and customer billing context."
      customerName={item.customer}
      branch={item.branch}
      ownerLabel="Payment state"
      ownerValue={item.paymentStatus}
      issuedLabel="Issued on"
      issuedValue={item.issuedOn}
      dueLabel="Due"
      dueValue={item.due}
      meta={[
        { label: 'Tax treatment', value: item.tax },
        { label: 'Reminders', value: item.reminders },
        { label: 'Customer record', value: item.sourceCustomerId },
        { label: 'Next action', value: item.nextAction }
      ]}
      lines={item.lines}
      totals={{ subtotal: item.subtotal, total: item.total }}
      notes={`Source: ${item.source}. ${item.nextAction}`}
      supportEmail={settings?.supportEmail}
      whatsapp={settings?.whatsapp}
      sourceLabel="Source quote"
      sourceValue={item.sourceQuoteId ? <Link to={`/quotes/${item.sourceQuoteId}`}>{item.source}</Link> : item.source}
    />
  );
}
