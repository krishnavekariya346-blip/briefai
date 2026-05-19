import nodemailer from 'nodemailer';
import type { IUser } from '../models/User.js';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export type EmailMode = 'smtp' | 'ethereal' | 'off';

let transporter: nodemailer.Transporter | null = null;
let emailMode: EmailMode = 'off';
let etherealUser: string | null = null;

function useEtherealDev(): boolean {
  if (process.env.EMAIL_ENABLED === 'false') return false;
  if (process.env.EMAIL_USE_ETHEREAL === 'true') return true;
  if (process.env.EMAIL_USE_ETHEREAL === 'false') return false;
  // Default: Ethereal in development when SMTP is not set
  return process.env.NODE_ENV !== 'production' && !hasSmtpEnv();
}

function hasSmtpEnv(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM || process.env.SMTP_USER || etherealUser || 'noreply@briefai.app';
}

export async function initEmailTransport(): Promise<void> {
  if (process.env.EMAIL_ENABLED === 'false') {
    emailMode = 'off';
    return;
  }

  if (hasSmtpEnv()) {
    const port = Number(process.env.SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    emailMode = 'smtp';
    console.info('[email] SMTP ready →', process.env.SMTP_HOST);
    return;
  }

  if (useEtherealDev()) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      etherealUser = testAccount.user;
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      emailMode = 'ethereal';
      console.info('\n[email] Ethereal test inbox (free, no signup):');
      console.info('[email]   Login:', testAccount.user);
      console.info('[email]   Pass: ', testAccount.pass);
      console.info('[email]   Preview: https://ethereal.email/login\n');
    } catch (err) {
      console.warn('[email] Could not start Ethereal:', err);
      emailMode = 'off';
    }
    return;
  }

  emailMode = 'off';
  console.info('[email] Not configured — set SMTP_* or EMAIL_USE_ETHEREAL=true in development');
}

export function getEmailMode(): EmailMode {
  return emailMode;
}

export function emailIsConfigured(): boolean {
  return emailMode === 'smtp' || emailMode === 'ethereal';
}

function getTransporter(): nodemailer.Transporter | null {
  return transporter;
}

interface SendOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

async function sendEmail(options: SendOptions): Promise<boolean> {
  const transport = getTransporter();
  if (!transport || emailMode === 'off') {
    console.info('[email] Skipped (not configured):', options.subject, '→', options.to);
    return false;
  }

  try {
    const info = await transport.sendMail({
      from: `"BriefAI" <${getFromAddress()}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (emailMode === 'ethereal') {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) {
        console.info('[email] Sent (preview):', options.subject, '→', options.to);
        console.info('[email]   Open:', preview);
      }
    } else {
      console.info('[email] Sent:', options.subject, '→', options.to);
    }
    return true;
  } catch (err) {
    console.error('[email] Failed:', options.subject, err);
    return false;
  }
}

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px;">
  <div style="max-width: 520px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 28px; border: 1px solid #334155;">
    <h1 style="margin: 0 0 16px; font-size: 20px; color: #fff;">${title}</h1>
    ${body}
    <p style="margin-top: 28px; font-size: 12px; color: #64748b;">BriefAI · <a href="${CLIENT_URL}" style="color: #818cf8;">Open app</a></p>
  </div>
</body>
</html>`;
}

export async function sendProWelcomeEmail(user: IUser): Promise<boolean> {
  const settingsUrl = `${CLIENT_URL}/settings`;
  const body = `
    <p>Hi ${user.name},</p>
    <p>Your <strong>Pro</strong> subscription is active. You now have:</p>
    <ul style="color: #cbd5e1; line-height: 1.8;">
      <li>Unlimited AI proposals</li>
      <li>Enhanced AI generation</li>
      <li>Stripe payment links on published proposals</li>
      <li>Custom branding on client-facing links</li>
      <li>Email notifications for publishes and payments</li>
    </ul>
    <p><a href="${settingsUrl}" style="display: inline-block; background: #6366f1; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">Open Settings</a></p>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Welcome to BriefAI Pro',
    html: layout('Welcome to Pro', body),
    text: `Hi ${user.name}, your Pro subscription is active. Manage branding at ${settingsUrl}`,
  });
}

export async function sendProposalPublishedEmail(params: {
  user: IUser;
  projectTitle: string;
  clientName: string;
  publicUrl: string;
  paymentLinkUrl?: string;
}): Promise<boolean> {
  const { user, projectTitle, clientName, publicUrl, paymentLinkUrl } = params;
  const paymentNote = paymentLinkUrl ? `<p>Payment link included for your client.</p>` : '';

  const body = `
    <p>Hi ${user.name},</p>
    <p>Your proposal for <strong>${clientName}</strong> — <em>${projectTitle}</em> — is live.</p>
    <p><a href="${publicUrl}" style="color: #818cf8;">${publicUrl}</a></p>
    ${paymentNote}
    <p><a href="${publicUrl}" style="display: inline-block; background: #6366f1; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">View public proposal</a></p>
  `;

  return sendEmail({
    to: user.email,
    subject: `Proposal published: ${projectTitle}`,
    html: layout('Proposal published', body),
    text: `Your proposal for ${clientName} is live: ${publicUrl}`,
  });
}

export async function sendProposalToClientEmail(params: {
  clientEmail: string;
  clientName: string;
  projectTitle: string;
  publicUrl: string;
  senderName: string;
  companyName?: string;
}): Promise<boolean> {
  const { clientEmail, clientName, projectTitle, publicUrl, senderName, companyName } = params;
  const from = companyName || senderName;

  const body = `
    <p>Hi ${clientName},</p>
    <p><strong>${from}</strong> shared a project proposal with you for <em>${projectTitle}</em>.</p>
    <p><a href="${publicUrl}" style="display: inline-block; background: #6366f1; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">View proposal</a></p>
    <p style="font-size: 13px; color: #94a3b8;">Or copy this link: ${publicUrl}</p>
  `;

  return sendEmail({
    to: clientEmail,
    subject: `Proposal: ${projectTitle}`,
    html: layout('New proposal for you', body),
    text: `${from} shared a proposal for ${projectTitle}: ${publicUrl}`,
  });
}

export async function sendPaymentReceivedEmail(params: {
  user: IUser;
  projectTitle: string;
  clientName: string;
  amount?: number;
  currency?: string;
}): Promise<boolean> {
  const { user, projectTitle, clientName, amount, currency = 'USD' } = params;
  const amountText =
    amount != null
      ? `<p><strong>Amount:</strong> ${currency.toUpperCase()} $${amount.toLocaleString()}</p>`
      : '';

  const body = `
    <p>Hi ${user.name},</p>
    <p>Great news — <strong>${clientName}</strong> paid for <em>${projectTitle}</em>.</p>
    ${amountText}
    <p><a href="${CLIENT_URL}/proposals" style="display: inline-block; background: #6366f1; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">View proposals</a></p>
  `;

  return sendEmail({
    to: user.email,
    subject: `Payment received: ${projectTitle}`,
    html: layout('Payment received', body),
    text: `Payment received for ${projectTitle} from ${clientName}.`,
  });
}
