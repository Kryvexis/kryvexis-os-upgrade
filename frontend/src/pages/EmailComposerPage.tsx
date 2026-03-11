import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { api } from '../lib/api';
import type { EmailDraft, EmailTemplateKind } from '../types';

const kindLabels: Record<EmailTemplateKind, string> = {
  'quote-send': 'Quote email',
  'invoice-reminder': 'Invoice reminder',
  'payment-proof': 'Payment follow-up'
};

export function EmailComposerPage() {
  const params = useParams();
  const kind = (params.kind || 'quote-send') as EmailTemplateKind;
  const id = params.id || '';
  const [draft, setDraft] = useState<EmailDraft | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.emailDraft(kind, id).then(setDraft);
  }, [kind, id]);

  const emailText = useMemo(() => {
    if (!draft) return '';
    return [draft.intro, ...draft.body, '', draft.closing].join('\n\n');
  }, [draft]);

  const handleCopy = async () => {
    if (!emailText) return;
    await navigator.clipboard.writeText(`Subject: ${draft?.subject}\nTo: ${draft?.to}\n\n${emailText}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  if (!draft) return <div className="loading-state">Generating email draft...</div>;

  return (
    <div className="record-layout email-page-layout">
      <Card className="record-hero compact-record-hero">
        <div className="record-head">
          <div>
            <p className="eyebrow">Auto email generation</p>
            <h2>{kindLabels[kind]}</h2>
          </div>
          <div className="record-link-strip">
            <span className="record-chip muted-chip">Record {draft.recordId}</span>
            <span className="record-chip muted-chip">To {draft.to}</span>
          </div>
        </div>
      </Card>

      <div className="split-grid email-grid">
        <Card title="Email preview" subtitle="Use this as your send-ready draft, then copy into Gmail or your mail tool.">
          <div className="email-preview-stack">
            <div className="email-meta-grid">
              <div><span>To</span><strong>{draft.to}</strong></div>
              <div><span>Subject</span><strong>{draft.subject}</strong></div>
            </div>
            <div className="email-preview-sheet">
              <p>{draft.intro}</p>
              {draft.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              <p>{draft.closing}</p>
            </div>
          </div>
        </Card>

        <Card title="Actions" subtitle="Quick handoff into your workflow.">
          <div className="action-focus-stack compact-actions">
            <button className="solid-button" onClick={handleCopy}>{copied ? 'Copied' : 'Copy email draft'}</button>
            <a className="ghost-button" href={`mailto:${draft.to}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(emailText)}`}>Open in email app</a>
            <Link className="ghost-button" to={draft.recordId.startsWith('Q-') ? `/quotes/${draft.recordId}` : draft.recordId.startsWith('INV-') ? `/invoices/${draft.recordId}` : `/payments/${draft.recordId}`}>Back to record</Link>
          </div>
          <div className="detail-stack tight-detail-stack">
            <div><span>Customer</span><strong>{draft.customerName}</strong></div>
            <div><span>Template</span><strong>{kindLabels[kind]}</strong></div>
            <div><span>Status</span><strong>Ready to send</strong></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
