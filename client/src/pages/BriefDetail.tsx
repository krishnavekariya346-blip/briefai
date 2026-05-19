import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import PageShell from '../components/layout/PageShell';
import type { Brief, Proposal, User } from '../types';

export default function BriefDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<{ brief: Brief }>(`/briefs/${id}`)
      .then(({ data }) => setBrief(data.brief))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, [id]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const { data } = await api.post<{ proposal: Proposal; user: User }>('/proposals/generate', {
        briefId: id,
      });
      if (data.user) updateUser(data.user);
      navigate(`/proposals/${data.proposal._id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  if (error && !brief) {
    return <p className="text-red-400">{error}</p>;
  }

  if (!brief) {
    return <p className="text-slate-500">Loading brief...</p>;
  }

  const fields = [
    ['Industry', brief.industry],
    ['Type', brief.projectType],
    ['Budget', brief.budgetRange],
    ['Timeline', brief.timeline],
    ['Deliverables', brief.deliverables],
    ['Goals', brief.goals],
  ] as const;

  return (
    <PageShell
      title={brief.projectTitle}
      subtitle={`Client: ${brief.clientName}`}
      action={
        <Link to="/dashboard" className="btn-secondary text-sm">
          ← Dashboard
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-6 text-lg font-semibold text-white">Brief details</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <div key={label} className={label === 'Deliverables' || label === 'Goals' ? 'sm:col-span-2' : ''}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-slate-200">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card flex flex-col justify-between lg:col-span-1">
          <div>
            <h2 className="text-lg font-semibold text-white">Next step</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Generate a client-ready proposal from this brief using AI. You can edit and publish it
              afterward.
            </p>
          </div>
          {error && <p className="form-error-banner mt-4">{error}</p>}
          <button
            type="button"
            onClick={handleGenerate}
            className="btn-primary mt-6 w-full"
            disabled={generating}
          >
            {generating ? 'Generating proposal with AI...' : '✨ Generate proposal'}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
