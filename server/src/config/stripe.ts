import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;

export const stripe: Stripe | null = key ? new Stripe(key) : null;

export function requireStripe(): Stripe {
  if (!stripe) throw new Error('Stripe is not configured');
  return stripe;
}
