import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DocumentPrintLayout } from '../components/DocumentPrintLayout';
import { api } from '../lib/api';
import type { QuoteDetail, Settings } from '../types';

export function QuotePrintPage() {
  const { id = '' } = useParams();
  const [item, setItem] = useState<QuoteDetail | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.quote(id), api.settings()])
      .then(([quote, appSettings]) => {
        setItem(quote);
        setSettings(appSettings);
      })
      .catch((err: Error) => setError(err.message));
  }, [id]);

  if (error && !item) return <div className="loading-state print-loading">{error}</div>;
  if (!item) return <div className="loading-state print-loading">Loading print view...</div>;

  return (
    <DocumentPrintLayout
      kind="Quote"
      id={item.id}
      status={item.status}
      title="Quote document"
      subtitle="Customer-ready quote layout with branded totals and clean line-item formatting."
      customerName={item.customer}
      branch={item.branch}
      ownerLabel="Quote owner"
      ownerValue={item.owner}
      issuedLabel="Validity"
      issuedValue={item.validity}
      meta={[
        { label: 'Approval trigger', value: item.trigger },
        { label: 'Approval owner', value: item.approvalOwner },
        { label: 'Margin band', value: item.marginBand },
        { label: 'Customer record', value: item.sourceCustomerId }
      ]}
      lines={item.lines}
      totals={{ subtotal: item.subtotal, tax: item.tax, total: item.total }}
      notes={`${item.notes} Next action: ${item.nextAction}`}
      supportEmail={settings?.supportEmail}
      whatsapp={settings?.whatsapp}
      sourceLabel="Customer profile"
      sourceValue={<Link to={`/customers/${item.sourceCustomerId}`}>Open customer record</Link>}
    />
  );
}
