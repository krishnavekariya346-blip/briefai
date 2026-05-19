import type { IUser } from '../models/User.js';

const FREE_LIMIT = (): number => Number(process.env.FREE_PROPOSAL_LIMIT) || 3;

function getNextMonthStart(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

export async function resetUsageIfNeeded(user: IUser): Promise<IUser> {
  const now = new Date();
  if (now >= user.usageResetAt) {
    user.usageThisMonth = 0;
    user.usageResetAt = getNextMonthStart();
    await user.save();
  }
  return user;
}

export function canGenerateProposal(user: IUser): { allowed: boolean; message?: string } {
  if (user.plan === 'pro') return { allowed: true };
  const limit = FREE_LIMIT();
  if (user.usageThisMonth >= limit) {
    return {
      allowed: false,
      message: `Free plan limit reached (${limit}/month). Upgrade to Pro for unlimited proposals.`,
    };
  }
  return { allowed: true };
}

export async function incrementUsage(user: IUser): Promise<void> {
  user.usageThisMonth += 1;
  await user.save();
}
