import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBrief extends Document {
  userId: Types.ObjectId;
  clientName: string;
  clientEmail?: string;
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
  status: 'draft' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const briefSchema = new Schema<IBrief>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    clientName: { type: String, required: true, trim: true },
    clientEmail: { type: String, trim: true },
    projectTitle: { type: String, required: true, trim: true },
    industry: { type: String, default: 'Other' },
    projectType: { type: String, required: true },
    budgetRange: { type: String, required: true },
    timeline: { type: String, required: true },
    deliverables: { type: String, required: true },
    goals: { type: String, required: true },
    constraints: { type: String, default: '' },
    clientWebsite: { type: String, default: '' },
    additionalNotes: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'completed'], default: 'draft' },
  },
  { timestamps: true }
);

export const Brief = mongoose.model<IBrief>('Brief', briefSchema);
