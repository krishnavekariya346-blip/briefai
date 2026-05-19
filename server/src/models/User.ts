import mongoose, { Document, Schema } from 'mongoose';

export type Plan = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | null;

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  plan: Plan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus: SubscriptionStatus;
  usageThisMonth: number;
  usageResetAt: Date;
  brandingCompanyName?: string;
  brandingLogoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  toSafeJSON(): SafeUser;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  plan: Plan;
  subscriptionStatus: SubscriptionStatus;
  usageThisMonth: number;
  usageResetAt: Date;
  freeProposalLimit: number;
  brandingCompanyName?: string;
  brandingLogoUrl?: string;
}

function getNextMonthStart(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    subscriptionStatus: {
      type: String,
      enum: ['active', 'canceled', 'past_due', null],
      default: null,
    },
    usageThisMonth: { type: Number, default: 0 },
    usageResetAt: { type: Date, default: getNextMonthStart },
    brandingCompanyName: { type: String, trim: true, maxlength: 120 },
    brandingLogoUrl: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function (this: IUser): SafeUser {
  return {
    id: this._id.toString(),
    email: this.email,
    name: this.name,
    plan: this.plan,
    subscriptionStatus: this.subscriptionStatus,
    usageThisMonth: this.usageThisMonth,
    usageResetAt: this.usageResetAt,
    freeProposalLimit: Number(process.env.FREE_PROPOSAL_LIMIT) || 3,
    brandingCompanyName: this.brandingCompanyName,
    brandingLogoUrl: this.brandingLogoUrl,
  };
};

export const User = mongoose.model<IUser>('User', userSchema);
