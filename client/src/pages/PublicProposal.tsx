import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import ProposalPreview from '../components/proposal/ProposalPreview';
import { printProposal } from '../lib/printProposal';
import type { PublicProposal as PublicProposalData } from '../types';

export default function PublicProposal() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicProposalData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<{ proposal: PublicProposalData }>(`/proposals/public/${slug}`)
      .then((res) => setData(res.data.proposal))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Not found'));
  }, [slug]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="no-print border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          {data.branding?.logoUrl || data.branding?.companyName ? (
            <div className="flex items-center gap-3">
              {data.branding.logoUrl && (
                <img
                  src={data.branding.logoUrl}
                  alt=""
                  className="h-9 max-w-[140px] object-contain"
                />
              )}
              {data.branding.companyName && (
                <span className="text-lg font-semibold text-white">{data.branding.companyName}</span>
              )}
            </div>
          ) : (
            <Link to="/" className="text-lg font-bold">
              Brief<span className="text-brand-500">AI</span>
            </Link>
          )}
          <div className="flex items-center gap-3">
            <button type="button" onClick={printProposal} className="btn-secondary text-xs">
              Download PDF
            </button>
            {data.status === 'paid' && (
              <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400">
                Paid
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12" id="proposal-print">
        <p className="mb-2 text-sm text-slate-500">
          Proposal for {data.clientName} · {data.projectTitle}
        </p>

        <ProposalPreview content={data.content} />

        {data.paymentLinkUrl && data.status !== 'paid' && (
          <div className="no-print card mt-8 text-center">
            <p className="mb-4 text-slate-300">Ready to move forward?</p>
            <a href={data.paymentLinkUrl} className="btn-primary inline-flex px-8">
              Pay ${data.paymentAmount?.toLocaleString()} deposit
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
