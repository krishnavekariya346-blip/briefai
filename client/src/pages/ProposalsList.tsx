import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBriefFromProposal } from '../lib/brief';
import { useProposals } from '../hooks/useProposals';
import PageShell from '../components/layout/PageShell';

export default function ProposalsList() {
  const { user } = useAuth();
  const { proposals, loading, error } = useProposals(user?.id);

  return (
    <PageShell
      title="Proposals"
      subtitle={`${proposals.length} saved to your account${user?.email ? ` · ${user.email}` : ''}`}
      action={
        <Link to="/briefs/new" className="btn-primary">
          + New brief
        </Link>
      }
    >
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-800/50" />
          ))}
        </div>
      ) : error ? (
        <p className="form-error-banner">{error}</p>
      ) : proposals.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-base text-slate-400">No proposals yet.</p>
          <Link to="/briefs/new" className="btn-primary mt-6 inline-flex">
            Create a brief
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((p) => (
            <Link
              key={p._id}
              to={`/proposals/${p._id}`}
              className="card block transition hover:border-brand-500/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold leading-snug text-white">
                    {p.content?.title || 'Untitled proposal'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {getBriefFromProposal(p)?.clientName} ·{' '}
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-800 px-3 py-1 text-xs capitalize text-slate-300">
                  {p.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
