import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import BriefForm, { type BriefFormValues } from '../components/brief/BriefForm';
import PageShell from '../components/layout/PageShell';
import type { Brief } from '../types';

export default function BriefNew() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (values: BriefFormValues) => {
    setSubmitting(true);
    setServerError('');
    try {
      const { data } = await api.post<{ brief: Brief }>('/briefs', values);
      navigate(`/briefs/${data.brief._id}`);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to save brief');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      title="New client brief"
      subtitle="Fill in the details below. We'll use them to generate your proposal."
    >
      {serverError && <p className="form-error-banner mb-6">{serverError}</p>}

      <div className="card w-full">
        <BriefForm onSubmit={handleSubmit} submitting={submitting} />
      </div>
    </PageShell>
  );
}
