import mongoose, { Document, Schema, Types } from 'mongoose';
import type { ProposalContent } from '../types/index.js';

export type ProposalStatus = 'draft' | 'generated' | 'sent' | 'paid';

export interface IProposal extends Document {
  userId: Types.ObjectId;
  briefId: Types.ObjectId;
  content: ProposalContent;
  status: ProposalStatus;
  publicSlug?: string;
  isPublic: boolean;
  stripePaymentLinkId?: string;
  stripePaymentLinkUrl?: string;
  paymentAmount?: number;
  paymentCurrency: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const proposalSchema = new Schema<IProposal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    briefId: { type: Schema.Types.ObjectId, ref: 'Brief', required: true },
    content: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ['draft', 'generated', 'sent', 'paid'],
      default: 'generated',
    },
    publicSlug: { type: String, unique: true, sparse: true, index: true },
    isPublic: { type: Boolean, default: false },
    stripePaymentLinkId: String,
    stripePaymentLinkUrl: String,
    paymentAmount: Number,
    paymentCurrency: { type: String, default: 'usd' },
    paidAt: Date,
  },
  { timestamps: true }
);

export const Proposal = mongoose.model<IProposal>('Proposal', proposalSchema);
