import type { Request } from 'express';
import type { IUser } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
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

export interface JwtPayload {
  userId: string;
}
