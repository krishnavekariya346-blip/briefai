import type { Response } from 'express';
import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';

const EXPIRY = '7d';

export function signToken(userId: Types.ObjectId | string): string {
  return jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET!, {
    expiresIn: EXPIRY,
  });
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie('token');
}
