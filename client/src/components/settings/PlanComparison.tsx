const FREE_FEATURES = [
  '3 AI proposals per month',
  'Public proposal links',
  'Standard AI detail level',
];

const PRO_FEATURES = [
  'Unlimited AI proposals',
  'Enhanced AI (deeper scope & pricing)',
  'Stripe payment links on publish',
  'Your logo & name on client links',
  'Email alerts + send proposal to client',
];

export default function PlanComparison() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Free</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-400">
          {FREE_FEATURES.map((f) => (
            <li key={f} className="flex gap-2">
              <span className="text-emerald-400">✓</span>
              {f}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-brand-500/30 bg-brand-950/30 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">Pro — $15/mo</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex gap-2">
              <span className="text-brand-400">✓</span>
              {f}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-brand-400/80">Use the upgrade button above to unlock Pro.</p>
      </div>
    </div>
  );
}
