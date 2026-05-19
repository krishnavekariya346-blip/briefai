import { Router, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import type Stripe from 'stripe';
import { Brief } from '../models/Brief.js';
import { Proposal } from '../models/Proposal.js';
import type { IUser } from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateProposalContent } from '../services/aiService.js';
import {
  resetUsageIfNeeded,
  canGenerateProposal,
  incrementUsage,
} from '../services/usageService.js';
import { requireStripe } from '../config/stripe.js';
import {
  sendProposalPublishedEmail,
  sendProposalToClientEmail,
} from '../services/emailService.js';
import type { AuthRequest } from '../types/index.js';
import type { ProposalContent } from '../types/index.js';

const router = Router();

router.get('/public/:slug', async (req, res: Response, next: NextFunction) => {
  try {
    const proposal = await Proposal.findOne({
      publicSlug: req.params.slug,
      isPublic: true,
    })
      .populate('briefId', 'clientName projectTitle')
      .populate('userId', 'plan name brandingCompanyName brandingLogoUrl');

    if (!proposal) {
      res.status(404).json({ error: 'Proposal not found' });
      return;
    }

    const brief = proposal.briefId as { clientName?: string; projectTitle?: string } | null;
    const owner = proposal.userId as {
      plan?: string;
      name?: string;
      brandingCompanyName?: string;
      brandingLogoUrl?: string;
    } | null;

    const branding =
      owner?.plan === 'pro'
        ? {
            companyName: owner.brandingCompanyName?.trim() || owner.name,
            logoUrl: owner.brandingLogoUrl?.trim() || undefined,
          }
        : undefined;

    res.json({
      proposal: {
        content: proposal.content,
        status: proposal.status,
        paymentLinkUrl: proposal.stripePaymentLinkUrl,
        paymentAmount: proposal.paymentAmount,
        paymentCurrency: proposal.paymentCurrency,
        paidAt: proposal.paidAt,
        clientName: brief?.clientName,
        projectTitle: brief?.projectTitle,
        createdAt: proposal.createdAt,
        branding,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.use(authMiddleware);

async function runGeneration(user: IUser, briefId: string) {
  await resetUsageIfNeeded(user);
  const check = canGenerateProposal(user);
  if (!check.allowed) {
    const err = new Error(check.message) as Error & { status?: number };
    err.status = 403;
    throw err;
  }

  const brief = await Brief.findOne({ _id: briefId, userId: user._id });
  if (!brief) {
    const err = new Error('Brief not found') as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  const content = await generateProposalContent(brief, { plan: user.plan });
  await incrementUsage(user);

  brief.status = 'completed';
  await brief.save();

  return { brief, content };
}

router.post('/generate', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { briefId } = z.object({ briefId: z.string() }).parse(req.body);
    const { brief, content } = await runGeneration(req.user!, briefId);

    const proposal = await Proposal.create({
      userId: req.user!._id,
      briefId: brief._id,
      content,
      status: 'generated',
    });

    res.status(201).json({ proposal, user: req.user!.toSafeJSON() });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'briefId is required' });
      return;
    }
    next(err);
  }
});

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const proposals = await Proposal.find({ userId: req.user!._id })
      .populate('briefId', 'clientName projectTitle')
      .sort({ createdAt: -1 });
    res.json({ proposals });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const proposal = await Proposal.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    }).populate('briefId');

    if (!proposal) {
      res.status(404).json({ error: 'Proposal not found' });
      return;
    }
    res.json({ proposal });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { content } = z.object({ content: z.custom<ProposalContent>() }).parse(req.body);
    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      { content },
      { new: true }
    );
    if (!proposal) {
      res.status(404).json({ error: 'Proposal not found' });
      return;
    }
    res.json({ proposal });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid content' });
      return;
    }
    next(err);
  }
});

router.post('/:id/regenerate', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await Proposal.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });
    if (!existing) {
      res.status(404).json({ error: 'Proposal not found' });
      return;
    }

    const { content } = await runGeneration(req.user!, existing.briefId.toString());
    existing.content = content;
    existing.status = 'generated';
    await existing.save();

    res.json({ proposal: existing, user: req.user!.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/publish', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = z
      .object({
        enablePayment: z.boolean().optional(),
        paymentAmount: z.number().positive().optional(),
      })
      .parse(req.body);

    const proposal = await Proposal.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!proposal) {
      res.status(404).json({ error: 'Proposal not found' });
      return;
    }

    if (!proposal.publicSlug) {
      proposal.publicSlug = nanoid(10);
    }
    proposal.isPublic = true;
    proposal.status = 'sent';

    if (body.enablePayment) {
      if (req.user!.plan !== 'pro') {
        res.status(403).json({
          error: 'Payment links require a Pro subscription. Upgrade to publish with payment.',
        });
        return;
      }

      const amount = body.paymentAmount ?? proposal.content?.pricing?.recommendedTotal;
      if (!amount || amount <= 0) {
        res.status(400).json({ error: 'Valid payment amount is required' });
        return;
      }

      const stripe = requireStripe();
      const amountCents = Math.round(amount * 100);

      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price_data: {
              currency: proposal.paymentCurrency || 'usd',
              product_data: {
                name: proposal.content?.title || 'Project deposit',
              },
              unit_amount: amountCents,
            },
            quantity: 1,
          } as unknown as Stripe.PaymentLinkCreateParams.LineItem,
        ],
        metadata: {
          proposalId: proposal._id.toString(),
          userId: req.user!._id.toString(),
        },
      });

      proposal.stripePaymentLinkId = paymentLink.id;
      proposal.stripePaymentLinkUrl = paymentLink.url;
      proposal.paymentAmount = amount;
    }

    await proposal.save();

    const publicUrl = `${process.env.CLIENT_URL}/p/${proposal.publicSlug}`;
    const brief = await Brief.findById(proposal.briefId);

    if (req.user!.plan === 'pro') {
      void sendProposalPublishedEmail({
        user: req.user!,
        projectTitle: brief?.projectTitle || proposal.content?.title || 'Project',
        clientName: brief?.clientName || 'Client',
        publicUrl,
        paymentLinkUrl: proposal.stripePaymentLinkUrl,
      });

      const clientEmail = brief?.clientEmail?.trim();
      if (clientEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
        void sendProposalToClientEmail({
          clientEmail,
          clientName: brief?.clientName || 'there',
          projectTitle: brief?.projectTitle || proposal.content?.title || 'Project',
          publicUrl,
          senderName: req.user!.name,
          companyName: req.user!.brandingCompanyName,
        });
      }
    }

    res.json({
      proposal,
      publicUrl,
      paymentLinkUrl: proposal.stripePaymentLinkUrl,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input' });
      return;
    }
    next(err);
  }
});

export default router;
