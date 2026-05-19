import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import PageShell from '../components/layout/PageShell';
import ProBrandingForm from '../components/settings/ProBrandingForm';
import PlanComparison from '../components/settings/PlanComparison';
import ProUnlockList from '../components/settings/ProUnlockList';

type BillingMode = 'stripe' | 'demo' | 'disabled';

interface BillingStatus {
  mode: BillingMode;
  stripeConfigured: boolean;
  proFeatures: string[];
  demoAvailable: boolean;
}

export default function Settings() {
  const { user, refreshUser, updateUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailStatus, setEmailStatus] = useState<{
    configured: boolean;
    mode: string;
    hint?: string;
  } | null>(null);
  const [billing, setBilling] = useState<BillingStatus | null>(null);

  const checkoutStatus = searchParams.get('checkout');
  const isPro = user?.plan === 'pro';
  const isDemoBilling = billing?.mode === 'demo';

  useEffect(() => {
    if (checkoutStatus === 'success') {
      void refreshUser();
    }
  }, [checkoutStatus, refreshUser]);

  useEffect(() => {
    api
      .get<{ configured: boolean; mode: string; hint?: string }>('/auth/email-status')
      .then((res) => setEmailStatus(res.data))
      .catch(() => setEmailStatus({ configured: false, mode: 'off' }));

    api
      .get<BillingStatus>('/billing/status')
      .then((res) => setBilling(res.data))
      .catch(() =>
        setBilling({
          mode: 'disabled',
          stripeConfigured: false,
          proFeatures: [],
          demoAvailable: false,
        })
      );
  }, []);

  const handleStripeUpgrade = async () => {
    setLoading('checkout');
    setError('');
    setSuccess('');
    try {
      const { data } = await api.post<{ url: string }>('/billing/create-checkout');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setLoading('');
    }
  };

  const handleDemoUpgrade = async () => {
    setLoading('demo');
    setError('');
    setSuccess('');
    try {
      const { data } = await api.post<{
        user: typeof user;
        message: string;
        proFeatures: string[];
      }>('/billing/demo-upgrade');
      if (data.user) updateUser(data.user);
      setSuccess(data.message);
      setBilling((b) =>
        b ? { ...b, proFeatures: data.proFeatures.length ? data.proFeatures : b.proFeatures } : b
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo upgrade failed');
    } finally {
      setLoading('');
    }
  };

  const handleDemoDowngrade = async () => {
    setLoading('demo-down');
    setError('');
    setSuccess('');
    try {
      const { data } = await api.post<{ user: typeof user; message: string }>(
        '/billing/demo-downgrade'
      );
      if (data.user) updateUser(data.user);
      setSuccess(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not switch plan');
    } finally {
      setLoading('');
    }
  };

  const handlePortal = async () => {
    setLoading('portal');
    setError('');
    try {
      const { data } = await api.post<{ url: string }>('/billing/create-portal');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Portal failed');
      setLoading('');
    }
  };

  const proFeatures =
    billing?.proFeatures?.length ? billing.proFeatures : undefined;

  return (
    <PageShell title="Settings" subtitle="Account, billing, and Pro features">
      {checkoutStatus === 'success' && (
        <p className="mb-6 rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-400">
          Welcome to Pro! Refreshing your plan...
        </p>
      )}

      {success && (
        <p className="mb-6 rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-400">{success}</p>
      )}

      {error && <p className="form-error-banner mb-6">{error}</p>}

      {isDemoBilling && !isPro && (
        <p className="mb-6 rounded-lg border border-brand-500/25 bg-brand-500/10 px-4 py-3 text-sm text-brand-200/90">
          <strong>Demo mode:</strong> No Stripe account or payment required. Click{' '}
          <strong>Activate Pro (demo)</strong> below to try all Pro features instantly.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="card space-y-6 lg:col-span-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Account</p>
            <p className="mt-2 text-lg font-semibold text-white">{user?.name}</p>
            <p className="mt-1 text-sm text-slate-400">{user?.email}</p>
          </div>

          <div className="border-t border-slate-800/80 pt-6">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Current plan</p>
            <p className="mt-2 text-2xl font-bold capitalize text-white">{user?.plan}</p>
            {isDemoBilling && isPro && (
              <p className="mt-1 text-xs text-amber-400/90">Demo Pro — not a real subscription</p>
            )}
            {!isPro && (
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {user?.usageThisMonth} / {user?.freeProposalLimit ?? 3} proposals used this month
              </p>
            )}
            {isPro && (
              <p className="mt-2 text-sm leading-relaxed text-brand-400/90">
                Unlimited proposals · Enhanced AI · Custom branding · Email alerts
              </p>
            )}
          </div>

          {!isPro && (
            <>
              {isDemoBilling ? (
                <button
                  type="button"
                  onClick={handleDemoUpgrade}
                  className="btn-primary w-full"
                  disabled={loading === 'demo'}
                >
                  {loading === 'demo' ? 'Activating...' : 'Activate Pro (demo)'}
                </button>
              ) : billing?.mode === 'stripe' ? (
                <button
                  type="button"
                  onClick={handleStripeUpgrade}
                  className="btn-primary w-full"
                  disabled={loading === 'checkout'}
                >
                  {loading === 'checkout' ? 'Redirecting to Stripe...' : 'Upgrade to Pro — $15/mo'}
                </button>
              ) : (
                <p className="text-sm text-slate-500">
                  Billing is not configured. Set <code className="text-slate-400">BILLING_MODE=demo</code>{' '}
                  in server .env for local demos.
                </p>
              )}
            </>
          )}

          {isPro && isDemoBilling && (
            <button
              type="button"
              onClick={handleDemoDowngrade}
              className="btn-secondary w-full"
              disabled={loading === 'demo-down'}
            >
              {loading === 'demo-down' ? 'Switching...' : 'Switch back to Free (demo)'}
            </button>
          )}

          {isPro && !isDemoBilling && billing?.mode === 'stripe' && (
            <button
              type="button"
              onClick={handlePortal}
              className="btn-secondary w-full"
              disabled={loading === 'portal'}
            >
              {loading === 'portal' ? 'Opening...' : 'Manage billing'}
            </button>
          )}

          <button
            type="button"
            onClick={refreshUser}
            className="text-sm text-slate-500 hover:text-slate-300"
          >
            Refresh plan status
          </button>
        </div>

        <div className="space-y-6 lg:col-span-8">
          {!isPro && (
            <>
              <ProUnlockList features={proFeatures} />
              <div className="card">
                <h2 className="mb-6 text-xl font-semibold text-white">Free vs Pro</h2>
                <PlanComparison />
              </div>
            </>
          )}

          {isPro && (
            <>
              <ProUnlockList
                features={proFeatures}
                title="Your Pro features (active)"
              />
              <div className="card">
                <h2 className="mb-2 text-xl font-semibold text-white">Client-facing branding</h2>
                <p className="mb-6 text-sm text-slate-400">
                  Shown on public proposal links instead of the BriefAI header.
                </p>
                <ProBrandingForm />
              </div>

              <div className="card text-sm text-slate-400">
                <h2 className="mb-2 text-xl font-semibold text-white">Pro email notifications</h2>
                <p className="mb-4">
                  Sent to <span className="text-slate-300">{user?.email}</span>:
                </p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  <li className="flex gap-2">
                    <span className="text-brand-400">✓</span> Welcome email when you upgrade
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-400">✓</span> Confirmation when you publish
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-400">✓</span> Alert when a client pays
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brand-400">✓</span> Proposal link emailed to client
                  </li>
                </ul>
                {emailStatus?.configured === false && (
                  <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200/90">
                    {emailStatus.hint ||
                      'Restart the API server — in development, Ethereal test email starts automatically.'}
                  </p>
                )}
                {emailStatus?.mode === 'ethereal' && (
                  <div className="mt-4 space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-xs text-amber-100/90">
                    <p>
                      <strong>Test mode only</strong> — emails do not reach Gmail or real inboxes.
                      They only appear as preview links in the API terminal.
                    </p>
                    <p className="text-amber-200/80">
                      For real emails use <strong>Brevo</strong> (free): add SMTP keys in{' '}
                      <code className="text-amber-100">server/.env</code> — see Brevo setup in
                      README. Set <code className="text-amber-100">EMAIL_USE_ETHEREAL=false</code>{' '}
                      and restart the server.
                    </p>
                  </div>
                )}
                {emailStatus?.mode === 'smtp' && (
                  <p className="mt-4 text-xs text-emerald-400/90">
                    Email delivery is enabled via SMTP.
                  </p>
                )}
              </div>
            </>
          )}

          <div className="card text-sm leading-relaxed text-slate-400">
            <h2 className="mb-2 text-xl font-semibold text-white">Billing modes</h2>
            <ul className="list-inside list-disc space-y-2 text-slate-400">
              <li>
                <strong className="text-slate-300">Demo</strong> — free, no Stripe. Use{' '}
                <code className="text-slate-300">BILLING_MODE=demo</code> (default in development).
              </li>
              <li>
                <strong className="text-slate-300">Stripe test</strong> — free test keys from Stripe;
                card <code className="text-slate-300">4242 4242 4242 4242</code>, no real charges.
              </li>
              <li>
                <strong className="text-slate-300">Brevo email</strong> — free SMTP at brevo.com for real
                Pro notification emails.
              </li>
            </ul>
          </div>

          <div className="card text-sm leading-relaxed text-slate-400">
            <h2 className="mb-2 text-xl font-semibold text-white">AI providers</h2>
            <p>
              Free and Pro both use Google Gemini, Groq, or mock. Pro uses a richer prompt and
              higher token limits.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
