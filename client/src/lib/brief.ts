import type { Brief, Proposal } from '../types';

export function getBriefFromProposal(proposal: Proposal): Brief | undefined {
  return typeof proposal.briefId === 'object' ? proposal.briefId : undefined;
}
