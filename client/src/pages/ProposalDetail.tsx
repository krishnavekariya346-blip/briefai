import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import ProposalPreview from '../components/proposal/ProposalPreview';
import { printProposal } from '../lib/printProposal';
import { getBriefFromProposal } from '../lib/brief';
import type { Proposal, User } from '../types';

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, updateUser } = useAuth();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [publicUrl, setPublicUrl] = useState('');
  const [enablePayment, setEnablePayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  const load = () => {
    api
      .get<{ proposal: Proposal }>(`/proposals/${id}`)
      .then(({ data }) => {
        setProposal(data.proposal);
        if (data.proposal.isPublic && data.proposal.publicSlug) {
          setPublicUrl(`${window.location.origin}/p/${data.proposal.publicSlug}`);
        }
        if (data.proposal.content?.pricing?.recommendedTotal) {
          setPaymentAmount(String(data.proposal.content.pricing.recommendedTotal));
        }
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleRegenerate = async () => {
    setActionLoading('regenerate');
    setError('');
    try {
      const { data } = await api.post<{ proposal: Proposal; user: User }>(
        `/proposals/${id}/regenerate`
      );
      setProposal(data.proposal);
      if (data.user) updateUser(data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Regeneration failed');
    } finally {
      setActionLoading('');
    }
  };

  const handlePublish = async () => {
    setActionLoading('publish');
    setError('');
    try {
      const body = {
        enablePayment: enablePayment && user?.plan === 'pro',
        paymentAmount: enablePayment ? Number(paymentAmount) : undefined,
      };
      const { data } = await api.post<{
        proposal: Proposal;
        publicUrl: string;
        paymentLinkUrl?: string;
      }>(`/proposals/${id}/publish`, body);
      setProposal(data.proposal);
      setPublicUrl(data.publicUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setActionLoading('');
    }
  };

  const copyLink = () => {
    if (publicUrl) navigator.clipboard.writeText(publicUrl);
  };

  if (loading) return <p className="text-slate-500">Loading proposal...</p>;
  if (!proposal) return <p className="text-red-400">{error || 'Not found'}</p>;

  const isPro = user?.plan === 'pro';
  const brief = getBriefFromProposal(proposal);
  const clientEmail = brief?.clientEmail?.trim();

  return (
    <div>
      <Link
        to="/proposals"
        className="no-print text-sm text-brand-400 hover:text-brand-300"
      >
        ← All proposals
      </Link>

      <div className="no-print mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Proposal</h1>
          <span className="mt-1 inline-block rounded-full bg-slate-800 px-2 py-0.5 text-xs capitalize text-slate-300">
            {proposal.status}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={printProposal} className="btn-secondary">
            Download PDF
          </button>
          <button
            type="button"
            onClick={handleRegenerate}
            className="btn-secondary"
            disabled={!!actionLoading}
          >
            {actionLoading === 'regenerate' ? 'Regenerating...' : 'Regenerate'}
          </button>
          {isPro && (
            <span className="rounded-full bg-brand-500/15 px-2.5 py-0.5 text-xs text-brand-300">
              Pro · Enhanced AI
            </span>
          )}
        </div>
      </div>

      {error && (
        <p className="no-print mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2" id="proposal-print">
          <p className="print-only mb-6 text-sm text-gray-600">BriefAI Proposal</p>
          <ProposalPreview content={proposal.content} />
        </div>

        <div className="no-print space-y-6">
          <div className="card">
            <h2 className="mb-4 font-semibold text-white">Publish to client</h2>
            <p className="mb-4 text-sm text-slate-400">
              Create a public link your client can view.
            </p>

            {isPro && (
              <label className="mb-4 flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={enablePayment}
                  onChange={(e) => setEnablePayment(e.target.checked)}
                  className="rounded border-slate-600"
                />
                Add Stripe payment link
              </label>
            )}

            {enablePayment && isPro && (
              <div className="mb-4">
                <label className="label">Amount (USD)</label>
                <input
                  className="input-field"
                  type="number"
                  min="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
            )}

            {!isPro && (
              <p className="mb-4 text-xs text-amber-400/90">
                Upgrade to Pro for payment links, client emails, and branding.{' '}
                <Link to="/settings" className="text-brand-400 hover:text-brand-300">
                  Go to Settings
                </Link>
              </p>
            )}

            {isPro && (
              <p className="mb-4 text-xs text-slate-500">
                {clientEmail
                  ? `We will email the proposal link to ${clientEmail} when you publish.`
                  : 'Add a client email on the brief to auto-send the proposal link.'}
              </p>
            )}

            <button
              type="button"
              onClick={handlePublish}
              className="btn-primary w-full"
              disabled={!!actionLoading}
            >
              {actionLoading === 'publish' ? 'Publishing...' : 'Publish proposal'}
            </button>

            {publicUrl && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-slate-500">Public link</p>
                <div className="flex gap-2">
                  <input className="input-field text-xs" readOnly value={publicUrl} />
                  <button type="button" onClick={copyLink} className="btn-secondary shrink-0">
                    Copy
                  </button>
                </div>
                {proposal.stripePaymentLinkUrl && (
                  <a
                    href={proposal.stripePaymentLinkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center text-sm text-brand-400 hover:text-brand-300"
                  >
                    Open payment link →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
