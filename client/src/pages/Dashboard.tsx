import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBriefFromProposal } from '../lib/brief';
import { useProposals } from '../hooks/useProposals';
import PageShell from '../components/layout/PageShell';

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="stat-card">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-white">{value}</p>
      {hint ? <p className="mt-2 text-sm leading-relaxed text-slate-400">{hint}</p> : null}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { proposals, loading, error } = useProposals(user?.id);
  const recent = proposals.slice(0, 5);

  const limit = user?.freeProposalLimit ?? 3;
  const used = user?.usageThisMonth ?? 0;
  const isPro = user?.plan === 'pro';

  return (
    <PageShell
      title="Dashboard"
      subtitle={`Welcome back, ${user?.name?.split(' ')[0] ?? 'there'}`}
      action={
        <Link to="/briefs/new" className="btn-primary gap-2">
          <span className="text-lg leading-none">+</span> New brief
        </Link>
      }
    >
      <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <Link to="/settings" className="block h-full transition-opacity hover:opacity-90">
          <StatCard
            label="Current plan"
            value={user?.plan ?? '—'}
            hint={isPro ? 'Manage billing in Settings' : 'Upgrade to Pro in Settings →'}
          />
        </Link>
        <StatCard
          label="Proposals this month"
          value={isPro ? String(used) : `${used} / ${limit}`}
          hint={isPro ? 'Unlimited on Pro' : `${Math.max(0, limit - used)} remaining this month`}
        />
        <StatCard
          label="Total proposals"
          value={String(proposals.length)}
          hint="All proposals saved to your account"
        />
      </div>

      <div className="card">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">Recent proposals</h2>
          <Link to="/proposals" className="text-sm font-medium text-brand-400 hover:text-brand-300">
            View all →
          </Link>
        </div>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-800/50" />
            ))}
          </div>
        ) : error ? (
          <p className="form-error-banner">{error}</p>
        ) : recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 py-16 text-center">
            <p className="text-base text-slate-400">No proposals yet. Start with a client brief.</p>
            <Link to="/briefs/new" className="btn-primary mt-6 inline-flex">
              Create your first brief
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-800/80">
            {recent.map((p) => {
              const brief = getBriefFromProposal(p);
              return (
                <li
                  key={p._id}
                  className="flex flex-wrap items-center justify-between gap-4 py-5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-base font-medium leading-snug text-white">
                      {p.content?.title || brief?.projectTitle || 'Untitled'}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{brief?.clientName}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className={p.status === 'paid' ? 'badge-success' : 'badge-muted'}>
                      {p.status}
                    </span>
                    <Link
                      to={`/proposals/${p._id}`}
                      className="text-sm font-medium text-brand-400 hover:text-brand-300"
                    >
                      Open →
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
