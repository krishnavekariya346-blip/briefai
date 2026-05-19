import { stripe } from '../config/stripe.js';
import type { IUser } from '../models/User.js';
import { sendProWelcomeEmail } from './emailService.js';

export type BillingMode = 'stripe' | 'demo' | 'disabled';

export function isStripeConfigured(): boolean {
  return Boolean(stripe && process.env.STRIPE_PRICE_ID_PRO);
}

export function getBillingMode(): BillingMode {
  const forced = (process.env.BILLING_MODE || '').toLowerCase();
  if (forced === 'demo') return 'demo';
  if (forced === 'stripe') return isStripeConfigured() ? 'stripe' : 'disabled';
  if (forced === 'disabled') return 'disabled';

  if (isStripeConfigured()) return 'stripe';

  // Default: demo in development so portfolios work without Stripe signup
  if (process.env.NODE_ENV !== 'production') return 'demo';

  return 'disabled';
}

export async function activateProDemo(user: IUser): Promise<IUser> {
  user.plan = 'pro';
  user.subscriptionStatus = 'active';
  await user.save();
  void sendProWelcomeEmail(user);
  return user;
}

export async function deactivateProDemo(user: IUser): Promise<IUser> {
  user.plan = 'free';
  user.subscriptionStatus = null;
  await user.save();
  return user;
}

export const PRO_FEATURES = [
  'Unlimited AI proposals per month',
  'Enhanced AI (richer scope, pricing, and detail)',
  'Stripe payment links when you publish (requires Stripe test keys)',
  'Custom logo and company name on client proposal links',
  'Email notifications (welcome, publish, client delivery, payments)',
] as const;
