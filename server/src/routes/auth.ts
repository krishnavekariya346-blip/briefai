import { Router, type Response, type NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';
import { resetUsageIfNeeded } from '../services/usageService.js';
import { emailIsConfigured, getEmailMode } from '../services/emailService.js';
import type { AuthRequest } from '../types/index.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);
    const exists = await User.findOne({ email: data.email.toLowerCase() });
    if (exists) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
    });

    const token = signToken(user._id);
    setAuthCookie(res, token);

    res.status(201).json({ user: user.toSafeJSON(), token });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0]?.message || 'Invalid input' });
      return;
    }
    next(err);
  }
});

router.post('/login', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    await resetUsageIfNeeded(user);
    const token = signToken(user._id);
    setAuthCookie(res, token);

    res.json({ user: user.toSafeJSON(), token });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input' });
      return;
    }
    next(err);
  }
});

router.post('/logout', (_req, res: Response) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get('/email-status', authMiddleware, (_req: AuthRequest, res: Response) => {
  const mode = getEmailMode();
  res.json({
    configured: emailIsConfigured(),
    mode,
    hint:
      mode === 'ethereal'
        ? 'Test emails use Ethereal — check the server terminal for preview links after sending.'
        : mode === 'smtp'
          ? 'Emails are sent via your SMTP server.'
          : 'Add SMTP settings or restart in development for auto Ethereal test mail.',
  });
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    await resetUsageIfNeeded(req.user);
    res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

const brandingSchema = z.object({
  brandingCompanyName: z.string().trim().max(120).optional(),
  brandingLogoUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .refine(
      (v) => !v || /^https?:\/\/.+/i.test(v),
      'Logo URL must start with http:// or https://'
    ),
});

router.patch('/branding', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;

    if (req.user.plan !== 'pro') {
      res.status(403).json({
        error: 'Custom branding is a Pro feature. Upgrade to add your logo on client proposal links.',
      });
      return;
    }

    const data = brandingSchema.parse(req.body);
    if (data.brandingCompanyName !== undefined) {
      req.user.brandingCompanyName = data.brandingCompanyName || undefined;
    }
    if (data.brandingLogoUrl !== undefined) {
      req.user.brandingLogoUrl = data.brandingLogoUrl || undefined;
    }
    await req.user.save();

    res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0]?.message || 'Invalid branding' });
      return;
    }
    next(err);
  }
});

export default router;
