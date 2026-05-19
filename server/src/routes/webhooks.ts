import { Router, type Request, type Response } from 'express';
import type Stripe from 'stripe';
import { requireStripe } from '../config/stripe.js';
import { User } from '../models/User.js';
import { Proposal } from '../models/Proposal.js';
import { WebhookEvent } from '../models/WebhookEvent.js';
import { Brief } from '../models/Brief.js';
import {
  sendProWelcomeEmail,
  sendPaymentReceivedEmail,
} from '../services/emailService.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const stripe = requireStripe();
  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    res.status(503).send('Webhook secret not configured');
    return;
  }

  if (typeof sig !== 'string') {
    res.status(400).send('Missing stripe-signature');
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature error:', message);
    res.status(400).send(`Webhook Error: ${message}`);
    return;
  }

  const existing = await WebhookEvent.findOne({ stripeEventId: event.id });
  if (existing) {
    res.json({ received: true, duplicate: true });
    return;
  }

  await WebhookEvent.create({ stripeEventId: event.id });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (session.mode === 'subscription' && userId) {
          const user = await User.findByIdAndUpdate(
            userId,
            {
              plan: 'pro',
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              subscriptionStatus: 'active',
            },
            { new: true }
          );
          if (user) {
            void sendProWelcomeEmail(user);
          }
        }

        if (session.mode === 'payment') {
          const proposalId = session.metadata?.proposalId;
          if (proposalId) {
            const proposal = await Proposal.findByIdAndUpdate(
              proposalId,
              { status: 'paid', paidAt: new Date() },
              { new: true }
            );
            if (proposal) {
              const owner = await User.findById(proposal.userId);
              const brief = await Brief.findById(proposal.briefId);
              if (owner?.plan === 'pro') {
                void sendPaymentReceivedEmail({
                  user: owner,
                  projectTitle: brief?.projectTitle || proposal.content?.title || 'Project',
                  clientName: brief?.clientName || 'Client',
                  amount: proposal.paymentAmount,
                  currency: proposal.paymentCurrency,
                });
              }
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const user = await User.findOne({ stripeSubscriptionId: sub.id });
        if (user) {
          user.subscriptionStatus = sub.status as typeof user.subscriptionStatus;
          if (sub.status === 'active') {
            user.plan = 'pro';
          } else if (['canceled', 'unpaid', 'incomplete_expired'].includes(sub.status)) {
            user.plan = 'free';
          }
          await user.save();
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await User.findOneAndUpdate(
          { stripeSubscriptionId: sub.id },
          { plan: 'free', subscriptionStatus: 'canceled' }
        );
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
    return;
  }

  res.json({ received: true });
});

export default router;
