import { Router, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { Brief } from '../models/Brief.js';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthRequest } from '../types/index.js';

const router = Router();
router.use(authMiddleware);

const briefSchema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.union([z.string().email(), z.literal('')]).optional(),
  projectTitle: z.string().min(1),
  industry: z.string().optional(),
  projectType: z.string().min(1),
  budgetRange: z.string().min(1),
  timeline: z.string().min(1),
  deliverables: z.string().min(1),
  goals: z.string().min(1),
  constraints: z.string().optional(),
  clientWebsite: z.string().optional(),
  additionalNotes: z.string().optional(),
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = briefSchema.parse(req.body);
    const brief = await Brief.create({ ...data, userId: req.user!._id });
    res.status(201).json({ brief });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0]?.message || 'Invalid input' });
      return;
    }
    next(err);
  }
});

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const briefs = await Brief.find({ userId: req.user!._id }).sort({ createdAt: -1 });
    res.json({ briefs });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const brief = await Brief.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!brief) {
      res.status(404).json({ error: 'Brief not found' });
      return;
    }
    res.json({ brief });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = briefSchema.partial().parse(req.body);
    const brief = await Brief.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      data,
      { new: true }
    );
    if (!brief) {
      res.status(404).json({ error: 'Brief not found' });
      return;
    }
    res.json({ brief });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0]?.message || 'Invalid input' });
      return;
    }
    next(err);
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const brief = await Brief.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
    if (!brief) {
      res.status(404).json({ error: 'Brief not found' });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
