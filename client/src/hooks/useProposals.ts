import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Proposal } from '../types';

export function useProposals(userId: string | undefined) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = useCallback(async () => {
    if (!userId) {
      setProposals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ proposals: Proposal[] }>('/proposals');
      setProposals(data.proposals);
    } catch (err) {
      setProposals([]);
      setError(err instanceof Error ? err.message : 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchProposals();
  }, [fetchProposals]);

  return { proposals, loading, error, refetch: fetchProposals };
}
