export type Plan = 'free' | 'pro';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: Plan;
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | null;
  usageThisMonth: number;
  usageResetAt: string;
  freeProposalLimit: number;
  brandingCompanyName?: string;
  brandingLogoUrl?: string;
}

export interface ProposalContent {
  title: string;
  executiveSummary: string;
  scope: { phase: string; items: string[] }[];
  timeline: { week: string; milestone: string }[];
  deliverables: string[];
  pricing: {
    recommendedTotal: number;
    currency: string;
    breakdown: { label: string; amount: number }[];
    paymentTerms: string;
  };
  assumptions: string[];
  nextSteps: string[];
  validUntil: string;
}

export interface Brief {
  _id: string;
  clientName: string;
  clientEmail?: string;
  projectTitle: string;
  industry: string;
  projectType: string;
  budgetRange: string;
  timeline: string;
  deliverables: string;
  goals: string;
  constraints?: string;
  clientWebsite?: string;
  additionalNotes?: string;
  status: 'draft' | 'completed';
  createdAt: string;
}

export interface BriefFormData {
  clientName: string;
  clientEmail: string;
  projectTitle: string;
  industry: string;
  projectType: string;
  budgetRange: string;
  timeline: string;
  deliverables: string;
  goals: string;
  constraints: string;
  clientWebsite: string;
  additionalNotes: string;
}

export interface Proposal {
  _id: string;
  briefId: Brief | string;
  content: ProposalContent;
  status: 'draft' | 'generated' | 'sent' | 'paid';
  publicSlug?: string;
  isPublic?: boolean;
  stripePaymentLinkUrl?: string;
  paymentAmount?: number;
  createdAt: string;
}

export interface PublicProposalBranding {
  companyName?: string;
  logoUrl?: string;
}

export interface PublicProposal {
  content: ProposalContent;
  status: string;
  paymentLinkUrl?: string;
  paymentAmount?: number;
  paymentCurrency?: string;
  paidAt?: string;
  clientName?: string;
  projectTitle?: string;
  createdAt: string;
  branding?: PublicProposalBranding;
}
