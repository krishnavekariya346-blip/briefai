import { Router, type Response, type NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireStripe } from '../config/stripe.js';
import {
  getBillingMode,
  isStripeConfigured,
  activateProDemo,
  deactivateProDemo,
  PRO_FEATURES,
} from '../services/billingService.js';
import type { AuthRequest } from '../types/index.js';

const router = Router();
router.use(authMiddleware);

router.get('/status', (_req: AuthRequest, res: Response) => {
  const mode = getBillingMode();
  res.json({
    mode,
    stripeConfigured: isStripeConfigured(),
    proFeatures: PRO_FEATURES,
    demoAvailable: mode === 'demo',
  });
});

router.post('/demo-upgrade', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (getBillingMode() !== 'demo') {
      res.status(403).json({
        error: 'Demo upgrade is only available when BILLING_MODE=demo or Stripe is not configured in development.',
      });
      return;
    }

    await activateProDemo(req.user!);
    res.json({
      user: req.user!.toSafeJSON(),
      message: 'Pro activated (demo). No payment was charged.',
      proFeatures: PRO_FEATURES,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/demo-downgrade', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (getBillingMode() !== 'demo') {
      res.status(403).json({ error: 'Demo downgrade is only available in demo billing mode.' });
      return;
    }

    await deactivateProDemo(req.user!);
    res.json({
      user: req.user!.toSafeJSON(),
      message: 'Reverted to Free plan (demo).',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/create-checkout', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const mode = getBillingMode();
    if (mode === 'demo') {
      res.status(400).json({
        error: 'Stripe checkout is disabled in demo mode. Use "Activate Pro (demo)" instead.',
        billingMode: 'demo',
      });
      return;
    }

    if (mode === 'disabled') {
      res.status(503).json({
        error:
          'Payments are not configured. Set BILLING_MODE=demo for a free demo upgrade, or add Stripe test keys.',
        billingMode: 'disabled',
      });
      return;
    }

    const stripe = requireStripe();
    const priceId = process.env.STRIPE_PRICE_ID_PRO;
    if (!priceId) {
      res.status(503).json({ error: 'Stripe price is not configured (STRIPE_PRICE_ID_PRO).' });
      return;
    }

    let customerId = req.user!.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user!.email,
        name: req.user!.name,
        metadata: { userId: req.user!._id.toString() },
      });
      customerId = customer.id;
      req.user!.stripeCustomerId = customerId;
      await req.user!.save();
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/settings?checkout=success`,
      cancel_url: `${process.env.CLIENT_URL}/settings?checkout=canceled`,
      metadata: { userId: req.user!._id.toString() },
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

router.post('/create-portal', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (getBillingMode() === 'demo') {
      res.status(400).json({
        error: 'Billing portal is not used in demo mode. Use "Switch back to Free" to test the free plan.',
      });
      return;
    }

    const stripe = requireStripe();
    if (!req.user!.stripeCustomerId) {
      res.status(400).json({ error: 'No billing account found. Subscribe first.' });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: req.user!.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/settings`,
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

export default router;
